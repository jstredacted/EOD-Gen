import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Task } from "@/types"
import { getSupabaseClient } from "./supabase"

// Type definitions for our database tables
export type ClientRecord = {
  id: string
  key: string
  name: string
  created_at: string
}

export type ReportRecord = {
  id: string
  date: string
  client_key: string
  reporter_name: string
  total_hours: number
  created_at: string
}

export type TaskRecord = {
  id: string
  report_id: string
  name: string
  time: string
  status: string
  created_at: string
}

// Transformed report type that includes tasks
export type ReportWithTasks = ReportRecord & {
  tasks: Task[]
  clientName: string // Added for UI compatibility
}

interface EODReportDB extends DBSchema {
  reports: {
    key: string // date as key
    value: {
      id: string
      date: string
      clientName: string
      clientKey: string // Added client key for filtering
      reporterName: string
      tasks: Task[]
      totalHours: number
    }
    indexes: {
      "by-date": string
      "by-client": string
    }
  }
}

let db: IDBPDatabase<EODReportDB> | null = null

export async function getDB() {
  if (!db) {
    db = await openDB<EODReportDB>("eod-reports-db", 1, {
      upgrade(db) {
        const reportStore = db.createObjectStore("reports", {
          keyPath: "id",
        })
        reportStore.createIndex("by-date", "date")
        reportStore.createIndex("by-client", "clientKey")
      },
    })
  }
  return db
}

// Function to sync local clients to Supabase
export async function syncClientsToSupabase(clients: Record<string, string>) {
  const supabase = getSupabaseClient()

  // Get existing clients from Supabase
  const { data: existingClients } = await supabase.from("clients").select("key, name")

  const existingClientKeys = new Set(existingClients?.map((client) => client.key) || [])

  // Prepare batch operations
  const clientsToUpsert = Object.entries(clients).map(([key, name]) => ({
    key,
    name,
  }))

  if (clientsToUpsert.length > 0) {
    // Upsert clients
    const { error } = await supabase.from("clients").upsert(clientsToUpsert, { onConflict: "key" })

    if (error) {
      console.error("Error syncing clients:", error)
      throw error
    }
  }

  return true
}

// Function to save a report to Supabase
export async function saveReport(
  date: string,
  clientName: string,
  clientKey: string,
  reporterName: string,
  tasks: Task[],
) {
  const supabase = getSupabaseClient()

  // First, ensure the client exists
  await syncClientsToSupabase({ [clientKey]: clientName })

  // Calculate total hours
  const totalHours = tasks.reduce((sum, task) => sum + Number.parseFloat(task.time), 0)

  // Insert the report
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      date,
      client_key: clientKey,
      reporter_name: reporterName,
      total_hours: totalHours,
    })
    .select()
    .single()

  if (reportError) {
    console.error("Error saving report:", reportError)
    throw reportError
  }

  // Insert the tasks
  const tasksToInsert = tasks.map((task) => ({
    report_id: report.id,
    name: task.name,
    time: task.time,
    status: task.status,
  }))

  const { error: tasksError } = await supabase.from("tasks").insert(tasksToInsert)

  if (tasksError) {
    console.error("Error saving tasks:", tasksError)
    throw tasksError
  }

  return report.id
}

// Function to get all reports from Supabase
export async function getAllReports(): Promise<ReportWithTasks[]> {
  const supabase = getSupabaseClient()

  // Get all reports
  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .order("date", { ascending: false })

  if (reportsError) {
    console.error("Error fetching reports:", reportsError)
    throw reportsError
  }

  if (!reports || reports.length === 0) {
    return []
  }

  // Get all clients for name lookup
  const { data: clients, error: clientsError } = await supabase.from("clients").select("key, name")

  if (clientsError) {
    console.error("Error fetching clients:", clientsError)
    throw clientsError
  }

  // Create a map of client keys to names
  const clientMap = (clients || []).reduce(
    (map, client) => {
      map[client.key] = client.name
      return map
    },
    {} as Record<string, string>,
  )

  // Get all tasks for these reports
  const reportIds = reports.map((report) => report.id)
  const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").in("report_id", reportIds)

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError)
    throw tasksError
  }

  // Group tasks by report_id
  const tasksByReportId = (tasks || []).reduce(
    (map, task) => {
      if (!map[task.report_id]) {
        map[task.report_id] = []
      }
      map[task.report_id].push({
        name: task.name,
        time: task.time,
        status: task.status,
      })
      return map
    },
    {} as Record<string, Task[]>,
  )

  // Combine reports with their tasks
  return reports.map((report) => ({
    ...report,
    tasks: tasksByReportId[report.id] || [],
    clientName: clientMap[report.client_key] || report.client_key,
  }))
}

// Function to get reports by filters
export async function getReportsByFilters(
  clientKey: string | null,
  startDate: string | null,
  endDate: string | null,
): Promise<ReportWithTasks[]> {
  const supabase = getSupabaseClient()

  // Start building the query
  let query = supabase.from("reports").select("*")

  // Apply filters
  if (clientKey) {
    query = query.eq("client_key", clientKey)
  }

  if (startDate) {
    query = query.gte("date", startDate)
  }

  if (endDate) {
    query = query.lte("date", endDate)
  }

  // Execute the query
  const { data: reports, error: reportsError } = await query.order("date", { ascending: false })

  if (reportsError) {
    console.error("Error fetching filtered reports:", reportsError)
    throw reportsError
  }

  if (!reports || reports.length === 0) {
    return []
  }

  // Get all clients for name lookup
  const { data: clients, error: clientsError } = await supabase.from("clients").select("key, name")

  if (clientsError) {
    console.error("Error fetching clients:", clientsError)
    throw clientsError
  }

  // Create a map of client keys to names
  const clientMap = (clients || []).reduce(
    (map, client) => {
      map[client.key] = client.name
      return map
    },
    {} as Record<string, string>,
  )

  // Get all tasks for these reports
  const reportIds = reports.map((report) => report.id)
  const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").in("report_id", reportIds)

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError)
    throw tasksError
  }

  // Group tasks by report_id
  const tasksByReportId = (tasks || []).reduce(
    (map, task) => {
      if (!map[task.report_id]) {
        map[task.report_id] = []
      }
      map[task.report_id].push({
        name: task.name,
        time: task.time,
        status: task.status,
      })
      return map
    },
    {} as Record<string, Task[]>,
  )

  // Combine reports with their tasks
  return reports.map((report) => ({
    ...report,
    tasks: tasksByReportId[report.id] || [],
    clientName: clientMap[report.client_key] || report.client_key,
  }))
}

// Function to delete a report
export async function deleteReport(id: string) {
  const supabase = getSupabaseClient()

  // Delete the report (tasks will be deleted via cascade)
  const { error } = await supabase.from("reports").delete().eq("id", id)

  if (error) {
    console.error("Error deleting report:", error)
    throw error
  }

  return true
}

// Function to import reports from a backup
export async function importReports(reports: any[]) {
  const supabase = getSupabaseClient()

  // Process each report
  for (const report of reports) {
    try {
      // First, ensure the client exists
      await syncClientsToSupabase({
        [report.clientKey || report.client_key]: report.clientName,
      })

      // Insert the report
      const { data: newReport, error: reportError } = await supabase
        .from("reports")
        .insert({
          date: report.date,
          client_key: report.clientKey || report.client_key,
          reporter_name: report.reporterName || report.reporter_name,
          total_hours: report.totalHours || report.total_hours,
        })
        .select()
        .single()

      if (reportError) {
        console.error("Error importing report:", reportError)
        continue
      }

      // Insert the tasks
      const tasksToInsert = (report.tasks || []).map((task: any) => ({
        report_id: newReport.id,
        name: task.name,
        time: task.time,
        status: task.status,
      }))

      if (tasksToInsert.length > 0) {
        const { error: tasksError } = await supabase.from("tasks").insert(tasksToInsert)

        if (tasksError) {
          console.error("Error importing tasks:", tasksError)
        }
      }
    } catch (error) {
      console.error("Error processing report import:", error)
    }
  }

  return true
}

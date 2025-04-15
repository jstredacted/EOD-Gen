"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Trash2, ArrowLeft, Filter } from "lucide-react"
import { getAllReports, deleteReport, getReportsByFilters } from "@/lib/db"
import { useConfig } from "@/context/config-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { exportMultipleReportsToCsv } from "@/lib/report-utils"

export function History({ onBack }: { onBack: () => void }) {
  const { config } = useConfig()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const allReports = await getAllReports()
        setReports(allReports)
      } catch (err) {
        console.error("Error fetching reports:", err)
        setError("Failed to load reports from cloud storage")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id)
      setReports(reports.filter((report) => report.id !== id))
    } catch (err) {
      console.error("Error deleting report:", err)
      setError("Failed to delete report")
    }
  }

  const handleApplyFilters = async () => {
    setLoading(true)
    setError(null)
    try {
      const filteredReports = await getReportsByFilters(
        selectedClient === "all" ? null : selectedClient,
        startDate || null,
        endDate || null,
      )
      setReports(filteredReports)
    } catch (err) {
      console.error("Error applying filters:", err)
      setError("Failed to filter reports")
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = async () => {
    setSelectedClient("all")
    setStartDate("")
    setEndDate("")
    setLoading(true)
    setError(null)
    try {
      const allReports = await getAllReports()
      setReports(allReports)
    } catch (err) {
      console.error("Error resetting filters:", err)
      setError("Failed to reset filters")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadAll = () => {
    if (reports.length === 0) return

    // Flatten all tasks from all reports
    const allTasks = reports.flatMap((report) =>
      report.tasks.map((task) => ({
        ...task,
        date: report.date,
        clientName: report.clientName,
      })),
    )

    // Generate filename based on filters
    let filename = "all_tasks"
    if (selectedClient !== "all") {
      filename += `_${selectedClient}`
    }
    if (startDate && endDate) {
      filename += `_${startDate}_to_${endDate}`
    } else if (startDate) {
      filename += `_from_${startDate}`
    } else if (endDate) {
      filename += `_until_${endDate}`
    }
    filename += ".csv"

    exportMultipleReportsToCsv(allTasks, filename)
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      <h2 className="text-2xl font-bold">Task History</h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-filter">Filter by Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger id="client-filter">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {config &&
                    Object.entries(config.clients).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 ? (
        <div>No reports found.</div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="text-sm">
              Found {reports.length} report{reports.length !== 1 ? "s" : ""}
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadAll}>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h3 className="font-medium">{report.clientName}</h3>
                    <p className="text-sm text-gray-500">
                      {report.date} - {report.reporter_name || report.reporterName}
                    </p>
                    <p className="text-sm text-gray-500">Total Hours: {report.total_hours || report.totalHours}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

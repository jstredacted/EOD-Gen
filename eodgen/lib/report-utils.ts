export interface Task {
  name: string
  time: number
  status: string
}

// Helper function to format time in hours and minutes
function formatTimeHoursMinutes(timeInHours: number): string {
  const hours = Math.floor(timeInHours)
  const minutes = Math.round((timeInHours - hours) * 60)

  if (hours === 0) {
    return `${minutes} minutes`
  } else if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`
  } else {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minutes`
  }
}

// Helper function to get status emoji
function getStatusEmoji(status: string): string {
  const lowerStatus = status.toLowerCase()
  if (lowerStatus.includes("complete") || lowerStatus.includes("done") || lowerStatus.includes("finish")) {
    return "✅"
  } else if (lowerStatus.includes("progress") || lowerStatus.includes("ongoing")) {
    return "🔄"
  } else if (lowerStatus.includes("hold") || lowerStatus.includes("pause")) {
    return "⏸️"
  } else if (lowerStatus.includes("cancel") || lowerStatus.includes("abandon")) {
    return "❌"
  } else {
    return "📝"
  }
}

export function generateEmailSubject(reporterName: string, estDate: string): string {
  return `${reporterName}'s End-of-Day Report – ${estDate}`
}

export function generateEmailBody(clientName: string, estDate: string, tasks: Task[], reporterName: string): string {
  if (!tasks.length) {
    return "No tasks were logged today."
  }

  let body = `Hey ${clientName},\n\nHere's what I've completed today:\n\n`

  // Add each task with formatted time and status emoji
  for (const task of tasks) {
    const formattedTime = formatTimeHoursMinutes(Number(task.time))
    const statusEmoji = getStatusEmoji(task.status)
    body += `${task.name} – ${formattedTime} (${task.status} ${statusEmoji})\n\n`
  }

  // Calculate and add total time
  const totalHours = tasks.reduce((sum, task) => sum + Number(task.time), 0)
  body += `Total Time: ${formatTimeHoursMinutes(totalHours)}\n\n`

  // Add friendly closing with emoji
  body += `If there's anything else you need, just let me know!\n\nHave a great rest of your day! 😊\n\n${reporterName}`

  return body
}

export function exportToCsv(tasks: Task[], estDate: string, filename: string): void {
  // Create CSV content
  const headers = ["Date (EST)", "Task Name", "Time Spent", "Status"]
  const csvRows = [headers]

  for (const task of tasks) {
    csvRows.push([estDate, task.name, task.time, task.status])
  }

  // Convert to CSV string
  const csvContent = csvRows.map((row) => row.join(",")).join("\n")

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename || "task_log.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportMultipleReportsToCsv(tasks: any[], filename: string): void {
  // Create CSV content
  const headers = ["Date", "Client", "Task Name", "Time Spent", "Status"]
  const csvRows = [headers]

  for (const task of tasks) {
    csvRows.push([task.date || "", task.clientName || "", task.name || "", task.time || "", task.status || ""])
  }

  // Convert to CSV string
  const csvContent = csvRows.map((row) => row.join(",")).join("\n")

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

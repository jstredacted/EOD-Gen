"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useConfig } from "@/context/config-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Copy, Download, RotateCcw } from "lucide-react"
import { getEstDate } from "@/lib/date-utils"
import { generateEmailSubject, generateEmailBody, exportToCsv } from "@/lib/report-utils"
import type { Task } from "@/types"
import { saveReport } from "@/lib/db"

export function Report({
  tasks,
  onReset,
  onBack,
}: {
  tasks: Task[]
  onReset: () => void
  onBack: () => void
}) {
  const { config } = useConfig()
  const [copied, setCopied] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  const subjectRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (!config) return null

  const estDate = getEstDate()
  const clientName = config.clients[config.current_client_profile]
  const clientKey = config.current_client_profile
  const reporterName = config.reporter_name

  const emailSubject = generateEmailSubject(reporterName, estDate)
  const emailBody = generateEmailBody(clientName, estDate, tasks, reporterName)

  useEffect(() => {
    let isMounted = true

    const saveReportToDb = async () => {
      try {
        setIsSaving(true)
        setSaveError(null)
        await saveReport(estDate, clientName, clientKey, reporterName, tasks)
      } catch (error) {
        console.error("Error saving report:", error)
        setSaveError("Failed to save report to cloud storage. Your report is still available for export.")
      } finally {
        if (isMounted) {
          setIsSaving(false)
        }
      }
    }

    if (config && tasks.length > 0) {
      saveReportToDb()
    }

    return () => {
      isMounted = false
    }
  }, [config, estDate, clientName, clientKey, reporterName, tasks])

  const handleCopySubject = () => {
    if (subjectRef.current) {
      navigator.clipboard.writeText(subjectRef.current.innerText)
      setCopiedSubject(true)
      setTimeout(() => setCopiedSubject(false), 2000)
    }
  }

  const handleCopyBody = () => {
    if (bodyRef.current) {
      navigator.clipboard.writeText(bodyRef.current.innerText)
      setCopiedBody(true)
      setTimeout(() => setCopiedBody(false), 2000)
    }
  }

  const handleExportCsv = () => {
    exportToCsv(tasks, estDate, config.csv_file_path)
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
        <div className="text-sm">
          Date (EST): <span className="font-medium">{estDate}</span>
        </div>
      </div>

      {isSaving && <div className="text-sm text-gray-500 animate-pulse">Saving report to cloud storage...</div>}

      {saveError && <div className="text-sm text-red-500">{saveError}</div>}

      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-medium">Email Subject</h3>
              <Button variant="ghost" size="sm" onClick={handleCopySubject}>
                {copiedSubject ? (
                  "Copied!"
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div ref={subjectRef} className="p-4 whitespace-pre-wrap font-mono text-sm">
              {emailSubject}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-medium">Email Body</h3>
              <Button variant="ghost" size="sm" onClick={handleCopyBody}>
                {copiedBody ? (
                  "Copied!"
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div ref={bodyRef} className="p-4 whitespace-pre-wrap font-mono text-sm">
              {emailBody}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="flex-1" onClick={handleExportCsv}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>

        <Button variant="outline" className="flex-1" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Start Over
        </Button>
      </div>
    </motion.div>
  )
}

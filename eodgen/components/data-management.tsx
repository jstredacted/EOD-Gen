"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Upload, HardDrive, Cloud, CloudOff } from "lucide-react"
import { getAllReports, importReports, syncClientsToSupabase } from "@/lib/db"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useConfig } from "@/context/config-context"
import { getSupabaseClient } from "@/lib/supabase"

export function DataManagement({ onBack }: { onBack: () => void }) {
  const { config } = useConfig()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const fileInputRef = useState<HTMLInputElement | null>(null)

  useEffect(() => {
    // Check Supabase connection on component mount
    const checkConnection = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.from("clients").select("count").limit(1)

        if (error) {
          console.error("Supabase connection error:", error)
          setConnectionStatus("disconnected")
        } else {
          setConnectionStatus("connected")
        }
      } catch (error) {
        console.error("Connection check error:", error)
        setConnectionStatus("disconnected")
      }
    }

    checkConnection()
  }, [])

  const handleExportAllData = async () => {
    try {
      setIsExporting(true)
      const allReports = await getAllReports()

      // Create a JSON blob with all data
      const dataStr = JSON.stringify(allReports, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })

      // Create download link
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      const date = new Date().toISOString().split("T")[0]
      link.setAttribute("href", url)
      link.setAttribute("download", `eod-reports-backup-${date}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      setImportError(null)
      setImportSuccess(false)

      const fileReader = new FileReader()
      fileReader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content)

          // Validate data structure
          if (!Array.isArray(data)) {
            throw new Error("Invalid backup file format")
          }

          // Import data
          await importReports(data)
          setImportSuccess(true)
        } catch (error) {
          console.error("Import parsing error:", error)
          setImportError("Failed to parse backup file. Please ensure it's a valid EOD backup.")
        } finally {
          setIsImporting(false)
        }
      }

      fileReader.onerror = () => {
        setImportError("Failed to read the file")
        setIsImporting(false)
      }

      fileReader.readAsText(file)
    } catch (error) {
      console.error("Import error:", error)
      setImportError("An unexpected error occurred during import")
      setIsImporting(false)
    }
  }

  const handleSyncClients = async () => {
    if (!config) return

    try {
      setIsSyncing(true)
      setSyncError(null)
      setSyncSuccess(false)

      await syncClientsToSupabase(config.clients)
      setSyncSuccess(true)
    } catch (error) {
      console.error("Sync error:", error)
      setSyncError("Failed to sync clients with cloud storage")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h2 className="text-2xl font-bold">Data Management</h2>

      <Alert variant={connectionStatus === "connected" ? "default" : "destructive"}>
        {connectionStatus === "connected" ? (
          <>
            <Cloud className="h-4 w-4" />
            <AlertTitle>Connected to Cloud Storage</AlertTitle>
            <AlertDescription>
              Your EOD reports are now stored in the cloud and synchronized across all your devices.
            </AlertDescription>
          </>
        ) : (
          <>
            <CloudOff className="h-4 w-4" />
            <AlertTitle>Cloud Storage Disconnected</AlertTitle>
            <AlertDescription>
              Unable to connect to cloud storage. Your data will be stored locally until connection is restored.
            </AlertDescription>
          </>
        )}
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </CardTitle>
            <CardDescription>Download all your EOD reports as a JSON file for safekeeping</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleExportAllData} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export All Data"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Import Data
            </CardTitle>
            <CardDescription>Restore your EOD reports from a previously exported backup file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
              ref={(el) => (fileInputRef.current = el)}
            />
            <Button className="w-full" onClick={handleImportClick} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import From Backup"}
            </Button>

            {importError && <div className="text-sm text-red-500 mt-2">{importError}</div>}
            {importSuccess && <div className="text-sm text-green-500 mt-2">Data imported successfully!</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="h-5 w-5 mr-2" />
            Cloud Synchronization
          </CardTitle>
          <CardDescription>Sync your client profiles with the cloud</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={handleSyncClients}
            disabled={isSyncing || connectionStatus !== "connected"}
          >
            {isSyncing ? "Syncing..." : "Sync Client Profiles"}
          </Button>

          {syncError && <div className="text-sm text-red-500 mt-2">{syncError}</div>}
          {syncSuccess && <div className="text-sm text-green-500 mt-2">Clients synced successfully!</div>}

          <div className="text-sm text-gray-500 mt-2">
            <p>Your EOD reports are automatically synced with the cloud when you create them.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Storage Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Storage Type:</strong> {connectionStatus === "connected" ? "Cloud (Supabase)" : "Local (IndexedDB)"}
          </p>
          <p>
            <strong>Benefits of Cloud Storage:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access your reports from any device or browser</li>
            <li>Never lose data when clearing browser cache</li>
            <li>Automatic backups and data protection</li>
            <li>Virtually unlimited storage for your reports</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

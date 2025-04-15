"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useConfig } from "@/context/config-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2, History, Database } from "lucide-react"

export function Settings({
  onProceed,
  onViewHistory,
  onManageData,
}: {
  onProceed: () => void
  onViewHistory: () => void
  onManageData: () => void
}) {
  const { config, updateConfig } = useConfig()
  const [activeTab, setActiveTab] = useState("general")
  const [newClientKey, setNewClientKey] = useState("")
  const [newClientName, setNewClientName] = useState("")

  if (!config) return null

  const handleAddClient = () => {
    if (!newClientKey || !newClientName) return

    const updatedClients = {
      ...config.clients,
      [newClientKey]: newClientName,
    }

    updateConfig({
      ...config,
      clients: updatedClients,
      current_client_profile: newClientKey,
    })

    setNewClientKey("")
    setNewClientName("")
  }

  const handleRemoveClient = (keyToRemove: string) => {
    if (Object.keys(config.clients).length <= 1) {
      // Don't allow removing the last client
      return
    }

    const updatedClients = { ...config.clients }
    delete updatedClients[keyToRemove]

    // If we're removing the current client, switch to another one
    let newCurrentClient = config.current_client_profile
    if (newCurrentClient === keyToRemove) {
      newCurrentClient = Object.keys(updatedClients)[0]
    }

    updateConfig({
      ...config,
      clients: updatedClients,
      current_client_profile: newCurrentClient,
    })
  }

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reporter_name">Your Name</Label>
            <Input
              id="reporter_name"
              value={config.reporter_name}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  reporter_name: e.target.value,
                })
              }
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label>Work Mode</Label>
            <RadioGroup
              value={config.work_mode}
              onValueChange={(value) =>
                updateConfig({
                  ...config,
                  work_mode: value,
                })
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Full-Time" id="full-time" />
                <Label htmlFor="full-time" className="cursor-pointer">
                  Full-Time (7 hours)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Part-Time" id="part-time" />
                <Label htmlFor="part-time" className="cursor-pointer">
                  Part-Time (4 hours)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="current_client">Current Client</Label>
            <Select
              value={config.current_client_profile}
              onValueChange={(value) =>
                updateConfig({
                  ...config,
                  current_client_profile: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(config.clients).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium mb-2">Manage Clients</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(config.clients).map(([key, name]) => (
                <div key={key} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-500">{key}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClient(key)}
                    disabled={Object.keys(config.clients).length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium mb-2">Add New Client</h3>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Client Key (e.g. client_a)"
                value={newClientKey}
                onChange={(e) => setNewClientKey(e.target.value)}
              />
              <Input
                placeholder="Client Name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleAddClient}
              disabled={!newClientKey || !newClientName}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 flex flex-col gap-2">
        <Button className="w-full" onClick={onProceed}>
          Proceed to Log Tasks
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="w-full" onClick={onViewHistory}>
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button variant="outline" className="w-full" onClick={onManageData}>
            <Database className="h-4 w-4 mr-2" />
            Manage Data
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

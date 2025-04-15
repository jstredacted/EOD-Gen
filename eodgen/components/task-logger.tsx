"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useConfig } from "@/context/config-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { getEstDate } from "@/lib/date-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Task {
  name: string
  time: string
  status: string
}

// Common status options
const STATUS_OPTIONS = ["Completed", "In Progress", "On Hold", "Pending Review", "Cancelled", "Blocked", "Deferred"]

export function TaskLogger({
  onComplete,
  onBack,
}: {
  onComplete: (tasks: Task[]) => void
  onBack: () => void
}) {
  const { config } = useConfig()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task>({
    name: "",
    time: "",
    status: "",
  })
  const [totalHours, setTotalHours] = useState(0)
  const [estDate, setEstDate] = useState("")

  useEffect(() => {
    setEstDate(getEstDate())
  }, [])

  const dailyLimit = config?.work_mode === "Full-Time" ? 7.0 : 4.0
  const remainingHours = dailyLimit - totalHours

  const handleAddTask = () => {
    if (!currentTask.name || !currentTask.time || !currentTask.status) return

    const timeSpent = Number.parseFloat(currentTask.time)
    if (isNaN(timeSpent) || timeSpent <= 0) return

    // Check if adding this task would exceed the daily limit
    if (totalHours + timeSpent > dailyLimit) {
      alert(`Adding this task would exceed your daily limit of ${dailyLimit} hours. Please adjust the time.`)
      return
    }

    const newTask = {
      ...currentTask,
      time: timeSpent.toString(),
    }

    setTasks([...tasks, newTask])
    setTotalHours((prev) => prev + timeSpent)
    setCurrentTask({ name: "", time: "", status: "" })
  }

  const handleRemoveTask = (index: number) => {
    const taskToRemove = tasks[index]
    const updatedTasks = tasks.filter((_, i) => i !== index)
    setTasks(updatedTasks)
    setTotalHours((prev) => prev - Number.parseFloat(taskToRemove.time))
  }

  const handleComplete = () => {
    if (tasks.length === 0) return
    onComplete(tasks)
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

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="task_name">Task Name</Label>
            <Input
              id="task_name"
              value={currentTask.name}
              onChange={(e) => setCurrentTask({ ...currentTask, name: e.target.value })}
              placeholder="What did you work on?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_spent">Time Spent (hours)</Label>
            <Input
              id="time_spent"
              type="number"
              step="0.25"
              min="0.25"
              value={currentTask.time}
              onChange={(e) => setCurrentTask({ ...currentTask, time: e.target.value })}
              placeholder="e.g. 1.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={currentTask.status}
              onValueChange={(value) => setCurrentTask({ ...currentTask, status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddTask}
          disabled={!currentTask.name || !currentTask.time || !currentTask.status}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {tasks.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between text-sm">
            <div>
              Tasks logged: <span className="font-medium">{tasks.length}</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2">
                Hours: <span className="font-medium">{totalHours.toFixed(2)}</span> / {dailyLimit}
              </div>
              <div className={remainingHours < 0 ? "text-red-500" : "text-green-500"}>
                (<span className="font-medium">{remainingHours.toFixed(2)}</span> remaining)
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">{task.name}</div>
                      <div className="text-sm text-gray-500">
                        {task.time} hrs · {task.status}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveTask(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button className="w-full" onClick={handleComplete}>
            Generate Report
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

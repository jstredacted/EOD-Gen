"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Settings } from "@/components/settings"
import { TaskLogger } from "@/components/task-logger"
import { Report } from "@/components/report"
import { ConfigProvider } from "@/context/config-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Task } from "@/types"
import { History } from "@/components/history"
import { DataManagement } from "@/components/data-management"

export default function Home() {
  const [step, setStep] = useState<"settings" | "logger" | "report" | "history" | "data-management">("settings")
  const [tasks, setTasks] = useState<Task[]>([])

  return (
    <ConfigProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 font-mono bg-white text-black">
        <div className="w-full max-w-3xl mx-auto flex flex-col min-h-[80vh] justify-between">
          <Header />

          <div className="flex-1 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {step === "settings" && (
                <Settings
                  key="settings"
                  onProceed={() => setStep("logger")}
                  onViewHistory={() => setStep("history")}
                  onManageData={() => setStep("data-management")}
                />
              )}

              {step === "logger" && (
                <TaskLogger
                  key="logger"
                  onComplete={(loggedTasks) => {
                    setTasks(loggedTasks)
                    setStep("report")
                  }}
                  onBack={() => setStep("settings")}
                />
              )}

              {step === "report" && (
                <Report
                  key="report"
                  tasks={tasks}
                  onReset={() => {
                    setTasks([])
                    setStep("settings")
                  }}
                  onBack={() => setStep("logger")}
                />
              )}

              {step === "history" && <History key="history" onBack={() => setStep("settings")} />}

              {step === "data-management" && (
                <DataManagement key="data-management" onBack={() => setStep("settings")} />
              )}
            </AnimatePresence>
          </div>

          <Footer />
        </div>
      </main>
    </ConfigProvider>
  )
}

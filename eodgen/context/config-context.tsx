"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ClientsMap = {
  [key: string]: string
}

export type Config = {
  work_mode: "Full-Time" | "Part-Time"
  csv_file_path: string
  reporter_name: string
  current_client_profile: string
  clients: ClientsMap
}

const defaultConfig: Config = {
  work_mode: "Full-Time",
  csv_file_path: "task_log.csv",
  reporter_name: "Your Name",
  current_client_profile: "default",
  clients: {
    default: "Valued Client",
  },
}

type ConfigContextType = {
  config: Config | null
  updateConfig: (newConfig: Config) => void
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load config from localStorage on initial render
    const storedConfig = localStorage.getItem("eod-config")

    if (storedConfig) {
      try {
        const parsedConfig = JSON.parse(storedConfig)
        // Merge with default config to ensure all fields exist
        setConfig({
          ...defaultConfig,
          ...parsedConfig,
          clients: {
            ...defaultConfig.clients,
            ...(parsedConfig.clients || {}),
          },
        })
      } catch (e) {
        console.error("Failed to parse stored config:", e)
        setConfig(defaultConfig)
      }
    } else {
      setConfig(defaultConfig)
    }

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    // Save config to localStorage whenever it changes
    if (isLoaded && config) {
      localStorage.setItem("eod-config", JSON.stringify(config))
    }
  }, [config, isLoaded])

  const updateConfig = (newConfig: Config) => {
    setConfig(newConfig)
  }

  return <ConfigContext.Provider value={{ config, updateConfig }}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  const context = useContext(ConfigContext)

  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider")
  }

  return context
}

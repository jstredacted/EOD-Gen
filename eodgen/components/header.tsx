"use client"

import { motion } from "framer-motion"
import { useConfig } from "@/context/config-context"

export function Header() {
  const { config } = useConfig()

  return (
    <motion.header
      className="w-full py-6 text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-2xl md:text-3xl font-bold tracking-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        EOD Report Generator
      </motion.h1>

      {config && (
        <motion.div
          className="text-sm mt-2 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {config.work_mode} · {config.clients[config.current_client_profile]}
        </motion.div>
      )}
    </motion.header>
  )
}

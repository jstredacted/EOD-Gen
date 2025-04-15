"use client"

import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer
      className="w-full py-4 text-center text-xs text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <p>Made with ♥ · {new Date().getFullYear()}</p>
    </motion.footer>
  )
}

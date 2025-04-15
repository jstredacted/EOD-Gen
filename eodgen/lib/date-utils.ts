import { format } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"

export function getEstDate(): string {
  // Get current date in local timezone
  const now = new Date()

  // Convert to EST timezone
  const estTimeZone = "America/New_York"
  const estDate = utcToZonedTime(now, estTimeZone)

  // Format as YYYY-MM-DD
  return format(estDate, "yyyy-MM-dd")
}

import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"

// Function to get the current date and time formatted for EST
export function getEstDate(): string {
  // Get the current UTC time
  const now = new Date()

  // Define the time zone for EST (Eastern Standard Time)
  // Note: 'America/New_York' handles both EST and EDT (Daylight Saving Time) transitions
  const estTimeZone = "America/New_York"

  // Convert the UTC time to EST
  const estDate = toZonedTime(now, estTimeZone)

  // Format the date and time
  // Example format: 'yyyy-MM-dd HH:mm:ss zzz' (e.g., 2023-10-27 10:30:00 EST)
  const formattedDate = format(estDate, "yyyy-MM-dd HH:mm:ss zzz")

  return formattedDate
}

interface DateFormatterOptions extends Intl.DateTimeFormatOptions {
  timeZoneName?:
    | "short"
    | "long"
    | "shortOffset"
    | "longOffset"
    | "shortGeneric"
    | "longGeneric";
  hour12?: boolean;
}

/**
 * Formats a date string according to the specified timezone
 * @param date - The date to format (ISO string or Date object)
 * @param timezone - The timezone to format to (e.g., 'America/New_York')
 * @param options - Additional formatting options
 * @returns Formatted date string
 */
export const formatToTimezone = (
  date: string | Date,
  timezone: string = "UTC",
  options: DateFormatterOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZoneName: "short"
  }
): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date provided");
    }

    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: timezone
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

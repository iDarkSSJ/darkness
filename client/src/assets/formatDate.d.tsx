export const formatDate = (objDate: number | undefined): string => {
  if (objDate) {
    const date = new Date(objDate)

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }

    const time = date.toLocaleTimeString("en-US", timeOptions)

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
    const newDate = date.toLocaleDateString("en-US", dateOptions)

    return `${newDate} at ${time}`
  } else return "unknown"
}

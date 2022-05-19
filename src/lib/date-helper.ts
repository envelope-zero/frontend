const dateFromIsoString = (date: string) => date.slice(0, 10)
const dateToIsoString = (date?: string) => {
  if (!date) {
    return
  }
  return new Date(date).toISOString()
}

export { dateFromIsoString, dateToIsoString }

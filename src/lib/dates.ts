const dateFromIsoString = (date: string) => date.slice(0, 10)
const dateToIsoString = (date?: string) => {
  if (!date) {
    return
  }
  return new Date(date).toISOString()
}
const dateToMonthString = (date: Date) => {
  return `${date.toLocaleString('default', {
    year: 'numeric',
  })}-${date.toLocaleString('default', { month: '2-digit' })}`
}

export { dateFromIsoString, dateToIsoString, dateToMonthString }

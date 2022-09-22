const dateFromIsoString = (date: string) => date.slice(0, 10)
const dateToIsoString = (date?: string) => {
  if (!date) {
    return
  }
  return new Date(date).toISOString()
}

const monthYearFromDate = (date: Date) =>
  date.toLocaleDateString('default', { year: 'numeric', month: '2-digit' })

const dateFromMonthYear = (date: string) => {
  const [month, year] = date.split('/')
  return new Date(`${month}/01/${year}`)
}

export {
  dateFromIsoString,
  dateToIsoString,
  monthYearFromDate,
  dateFromMonthYear,
}

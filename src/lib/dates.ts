const locale = 'en' // TODO: dynamic

const translatedMonthFormat = new Intl.DateTimeFormat(locale, {
  month: 'long',
  year: 'numeric',
})
const shortTranslatedMonthFormat = new Intl.DateTimeFormat(locale, {
  month: 'short',
})

const dateFromIsoString = (date: string) => date.slice(0, 10)
const dateToIsoString = (date?: string) => {
  if (!date) {
    return
  }
  return new Date(date).toISOString()
}

const monthYearFromDate = (date: Date) => date.toISOString().slice(0, 7)

const dateFromMonthYear = (date: string) => {
  const [year, month] = date.split('-')
  return new Date(`${month}/15/${year}`)
}

const setToFirstOfTheMonth = (date: string) => {
  const [year, month] = date.split('-')
  return `${year}-${month}-01`
}

const setToFirstOfNextMonth = (date: string) => {
  const d = new Date(date)
  d.setDate(1)
  d.setMonth(d.getMonth() + 1)

  // Return date in YYYY-MM-DD format
  return dateFromIsoString(d.toISOString())
}

export {
  dateFromIsoString,
  dateToIsoString,
  monthYearFromDate,
  dateFromMonthYear,
  setToFirstOfTheMonth,
  setToFirstOfNextMonth,
  translatedMonthFormat,
  shortTranslatedMonthFormat,
}

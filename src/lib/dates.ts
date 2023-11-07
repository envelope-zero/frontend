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

export {
  dateFromIsoString,
  dateToIsoString,
  monthYearFromDate,
  dateFromMonthYear,
  setToFirstOfTheMonth,
  translatedMonthFormat,
  shortTranslatedMonthFormat,
}

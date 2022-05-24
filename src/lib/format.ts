const locale = 'en-US' // TODO: user preference

const formatMoney = (
  amount: number,
  currency: string = '',
  signDisplay: Intl.NumberFormatOptions['signDisplay'] = 'exceptZero'
) => {
  return `${new Intl.NumberFormat(locale, {
    signDisplay: signDisplay,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ${currency}`
}

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString(locale)

export { formatMoney, formatDate }

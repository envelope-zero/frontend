const locale = 'en-US' // TODO: user preference

const formatMoney = (
  amount: number,
  currency: string = '',
  options: {
    signDisplay?: Intl.NumberFormatOptions['signDisplay']
    hideZero?: boolean
  } = {}
) => {
  if (options.hideZero && amount == 0) {
    return
  }

  return `${new Intl.NumberFormat(locale, {
    signDisplay: options.signDisplay || 'exceptZero',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ${currency}`
}

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString(locale)

export { formatMoney, formatDate }

const locale = 'en-US' // TODO: user preference

const formatMoney = (amount: number, currency: string = '') => {
  return `${new Intl.NumberFormat(locale, {
    signDisplay: 'exceptZero',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ${currency}`
}

export { formatMoney }

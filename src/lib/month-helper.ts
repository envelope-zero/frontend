const replaceMonthInLinks = (link: string, month: string) => {
  const [y, m] = month.split('-')
  return link.replace('YYYY', y).replace('MM', m)
}

export { replaceMonthInLinks }

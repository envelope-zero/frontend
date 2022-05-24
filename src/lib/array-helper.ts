const groupBy = (array: any[], groupKey: (element: any) => string) => {
  return array.reduce((object: { [key: string]: any[] }, current: any) => {
    const key = groupKey(current)
    object[key] ||= []
    object[key].push(current)
    return object
  }, {})
}

export { groupBy }

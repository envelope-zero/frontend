const trimWhitespace = (object: { [key: string]: any }) => {
  Object.entries(object).forEach(([key, value]) => {
    if (typeof value === 'string') {
      object[key] = value.trim()
    }
  })
  return object
}

export default trimWhitespace

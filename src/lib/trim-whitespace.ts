const trimWhitespace = (object: { [key: string]: any }) => {
  Object.entries(object).forEach(([key, value]) => {
    // typeof(null) is object, because Javascript.
    // Therefore we catch this here to not break the code
    if (!value) {
      return
    }

    if (typeof value === 'object') {
      object[key] = trimWhitespace(value)
    }

    if (typeof value === 'string') {
      object[key] = value.trim()
    }
  })
  return object
}

export default trimWhitespace

const checkStatus = async response => {
  if (response.ok) {
    return response
  } else {
    const text = await parseText(response)

    let error = ''

    // Try to parse the error as JSON, if it fails just use the
    // plain text of the response
    try {
      error = JSON.parse(text).error

      // The error is parseable, but null. Inspect the first element of the response
      // to see if it is a bulk creation element error
      if (!error) {
        error = JSON.parse(text).data[0].error
      }
    } catch (e) {
      error = 'Unknown error: ' + text
    }

    // Throw the message of the parsed error object
    throw new Error(error)
  }
}
const parseJSON = response => response.json()
const parseText = response => response.text()

export { checkStatus, parseJSON }

const checkStatus = async response => {
  if (response.ok) {
    return response
  } else {
    const error = new Error(response.statusText)
    error.response = await response.text().then(message => JSON.parse(message))
    throw error
  }
}
const parseJSON = response => response.json()

export { checkStatus, parseJSON }

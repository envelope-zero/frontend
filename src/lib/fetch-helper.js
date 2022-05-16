const checkStatus = async response => {
  if (response.ok) {
    return response
  } else {
    const error = await parseJSON(response)
    throw new Error(error.error)
  }
}
const parseJSON = response => response.json()

export { checkStatus, parseJSON }

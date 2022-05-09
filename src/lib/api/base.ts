import { checkStatus, parseJSON } from '../fetch-helper'

const endpoint =
  process.env.REACT_APP_API_ENDPOINT || window.location.origin + '/api/v1'

const getApiInfo = async () => {
  return fetch(endpoint).then(checkStatus).then(parseJSON)
}

export { getApiInfo }

import { ApiObject, UUID, Budget } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const endpoint =
  process.env.REACT_APP_API_ENDPOINT || window.location.origin + '/api/v1'

const getApiInfo = async () => {
  return fetch(endpoint).then(checkStatus).then(parseJSON)
}

const get = async (url: string) => {
  return fetch(url)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const api = (linkKey: string) => {
  return {
    getAll: (parent: ApiObject) => get(parent.links[linkKey]),
    get: (id: UUID) => {
      const url = new URL(linkKey)
      url.pathname += `/${id}`
      return get(url.href)
    },
    update: (object: any) => {
      return fetch(object.links.self, {
        method: 'PATCH',
        body: JSON.stringify(object),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.data)
    },
    create: (object: any, budget: Budget) => {
      return fetch(budget.links[linkKey], {
        method: 'POST',
        body: JSON.stringify({ ...object, budgetId: budget.id }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.data)
    },
    delete: (object: ApiObject) =>
      fetch(object.links.self, { method: 'DELETE' }).then(checkStatus),
  }
}

export { getApiInfo, api }

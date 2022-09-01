import { ApiObject, UUID, Budget, FilterOptions } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const endpoint = window.location.origin + '/api/v1'

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
    getAll: (parent: ApiObject, filterOptions: FilterOptions = {}) => {
      const url = new URL(parent.links[linkKey])
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (typeof value !== 'undefined') {
          url.searchParams.set(key, value)
        }
      })
      return get(url.href)
    },
    get: (id: UUID, parent: ApiObject) => {
      const url = new URL(parent.links[linkKey])
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

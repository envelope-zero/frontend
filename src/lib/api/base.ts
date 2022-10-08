import { ApiObject, UUID, Budget, FilterOptions } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'
import trimWhitespace from '../trim-whitespace'

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
          url.searchParams.set(key, value.toString())
        }
      })
      return get(url.href)
    },
    get: (id: UUID, parent: ApiObject) => {
      const url = new URL(parent.links[linkKey])
      url.pathname += `/${id}`
      return get(url.href)
    },
    update: (object: any, url?: string) => {
      return fetch(url || object.links.self, {
        method: 'PATCH',
        body: JSON.stringify(trimWhitespace(object)),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.data)
    },
    create: (object: any, budget: Budget, url?: string) => {
      return fetch(url || budget.links[linkKey], {
        method: 'POST',
        body: JSON.stringify(
          trimWhitespace({ ...object, budgetId: budget.id })
        ),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.data)
    },
    delete: (object: ApiObject | undefined, options: { url?: string } = {}) => {
      if (typeof object === 'undefined' && !options.url) {
        throw new Error('no url specified')
      }

      return fetch(options.url || (object as ApiObject).links.self, {
        method: 'DELETE',
      }).then(checkStatus)
    },
  }
}

export { getApiInfo, api, get }

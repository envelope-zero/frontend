import { ApiObject, UUID, Budget, FilterOptions } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const endpoint = window.location.origin + '/api/v3'

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
      // Set the limit to -1 to retrieve all resources - if unset the backend defaults to 50,
      // but we don't have endless scroll implemented yet
      url.searchParams.set('limit', '-1')
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
        body: JSON.stringify(object),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.data)
    },
    create: (object: any, budget: Budget, url?: string) => {
      // Are we creating a single resource?
      let single = !Array.isArray(object)

      // If the object is not an array yet, make it one
      object = [].concat(object).map((entry: any) => {
        return { ...entry, budgetId: budget.id }
      })

      return fetch(url || budget.links[linkKey], {
        method: 'POST',
        body: JSON.stringify(object),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(checkStatus)
        .then(parseJSON)
        .then(data => {
          // If we created a single object, return its data
          if (single) {
            return data.data[0].data
          }

          // List of objects
          return data.data
        })
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

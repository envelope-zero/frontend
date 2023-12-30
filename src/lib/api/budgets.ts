import { Budget, UnpersistedBudget, UUID } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'
import { getApiInfo } from './base'

const updateBudget = async (budget: Budget) => {
  return fetch(budget.links.self, {
    method: 'PATCH',
    body: JSON.stringify(budget),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const deleteBudget = (budget: Budget) => {
  return fetch(budget.links.self, { method: 'DELETE' }).then(checkStatus)
}

export default async function budgets() {
  const endpoint = await getApiInfo().then(data => data.links.budgets)

  return {
    getBudgets: async () => {
      return fetch(endpoint)
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.data)
    },

    getBudget: async (id: UUID) => {
      return fetch(`${endpoint}/${id}`)
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.data)
    },

    createBudget: async (data: UnpersistedBudget) => {
      return fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify([data]),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.data[0]?.data)
    },

    updateBudget,
    deleteBudget,
  }
}

export { updateBudget, deleteBudget }

import { Budget, UnpersistedBudget } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const endpoint =
  process.env.REACT_APP_API_ENDPOINT || window.location.origin + '/api/v1'

const getBudgets = async () => {
  return fetch(`${endpoint}/budgets`)
    .then(checkStatus)
    .then(parseJSON)
    .then((data: { data: Budget[] }) => data.data)
}

const getBudget = async (id: number | string) => {
  return fetch(`${endpoint}/budgets/${id}`)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const createBudget = async (data: UnpersistedBudget) => {
  return fetch(`${endpoint}/budgets`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(checkStatus)
    .then(parseJSON)
}

const updateBudget = async (id: number | string, data: Budget) => {
  return fetch(`${endpoint}/budgets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(checkStatus)
    .then(parseJSON)
}

const deleteBudget = (id: string) => {
  return fetch(`${endpoint}/budgets/${id}`, { method: 'DELETE' }).then(
    checkStatus
  )
}

export { getBudgets, getBudget, createBudget, updateBudget, deleteBudget }

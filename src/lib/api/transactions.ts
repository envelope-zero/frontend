import {
  ApiObject,
  Budget,
  Transaction,
  UnpersistedTransaction,
  UUID,
} from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const getTransactions = async (parent: ApiObject) => {
  return fetch(parent.links.transactions)
    .then(checkStatus)
    .then(parseJSON)
    .then(data =>
      data.data.sort(
        (a: Transaction, b: Transaction) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    )
}

const getTransaction = async (id: UUID, budget: Budget) => {
  const url = new URL(budget.links.transactions)
  url.pathname += `/${id}`

  return fetch(url.href)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const updateTransaction = async (transaction: Transaction) => {
  return fetch(transaction.links.self, {
    method: 'PATCH',
    body: JSON.stringify(transaction),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const createTransaction = async (
  transaction: UnpersistedTransaction,
  budget: Budget
) => {
  return fetch(budget.links.transactions, {
    method: 'POST',
    body: JSON.stringify({ ...transaction, budgetId: budget.id }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const deleteTransaction = async (transaction: Transaction) => {
  return fetch(transaction.links.self, { method: 'DELETE' }).then(checkStatus)
}

export {
  getTransactions,
  getTransaction,
  deleteTransaction,
  updateTransaction,
  createTransaction,
}

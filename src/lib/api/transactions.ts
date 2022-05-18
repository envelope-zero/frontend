import { Budget, Transaction, UnpersistedTransaction } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const getTransactions = async (budget: Budget) => {
  return fetch(budget.links.transactions)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const getTransaction = async (id: string, budget: Budget) => {
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

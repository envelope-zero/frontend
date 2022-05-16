import { Budget } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const getTransactions = async (budget: Budget) => {
  return fetch(budget.links.transactions)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

export { getTransactions }

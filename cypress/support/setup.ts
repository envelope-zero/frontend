import {
  Budget,
  UnpersistedAccount,
  UnpersistedBudget,
  UnpersistedCategory,
  UnpersistedEnvelope,
  UnpersistedTransaction,
} from '../../src/types'
import connectBudgetApi from '../../src/lib/api/budgets'
import { api } from '../../src/lib/api/base'

const randomName = () =>
  (Math.random() * Math.pow(10, 10)).toFixed(0).toString()

export const createBudget = async (budget: UnpersistedBudget) => {
  return connectBudgetApi().then(api => {
    return api.createBudget({ name: randomName(), ...budget })
  })
}

export const createAccount = async (
  account: UnpersistedAccount,
  budget: Budget
) => api('accounts').create({ name: randomName(), ...account }, budget)

export const listAccounts = async (budget: Budget) =>
  api('accounts').getAll(budget)

export const createCategory = async (
  category: UnpersistedCategory,
  budget: Budget
) => api('categories').create({ name: randomName(), ...category }, budget)

export const createEnvelope = async (
  envelope: UnpersistedEnvelope,
  budget: Budget
) => {
  const envelopeApi = api('envelopes')

  if (typeof envelope.categoryId !== 'undefined') {
    return envelopeApi.create({ name: randomName(), ...envelope }, budget)
  }

  return createCategory({}, budget).then(category =>
    envelopeApi.create(
      { name: randomName(), ...envelope, categoryId: category.id },
      budget
    )
  )
}

export const createTransaction = async (
  transaction: UnpersistedTransaction,
  budget: Budget
) => api('transactions').create(transaction, budget)

export const listTransactions = async (budget: Budget) =>
  api('transactions').getAll(budget)

import { Account, Transaction, UnpersistedTransaction } from '../types'
import { isExternal } from './account-helper'
import { safeName } from './name-helper'

const incoming = { color: 'positive', sign: '+' }
const outgoing = { color: 'negative', sign: '-' }
const transfer = { color: 'text-sky-600 dark:text-sky-500', sign: '±' }

const counterpartiesString = (
  sourceAccount?: Account,
  destinationAccount?: Account
) =>
  `${safeName(sourceAccount, 'account')} → ${safeName(
    destinationAccount,
    'account'
  )}`

const getConfiguration = (
  transaction: Transaction,
  accounts: Account[],
  povAccount?: Account
) => {
  const sourceAccount = accounts.find(
    account => account.id === transaction.sourceAccountId
  )
  const destinationAccount = accounts.find(
    account => account.id === transaction.destinationAccountId
  )

  let numberFormat

  if (typeof povAccount !== 'undefined' && !povAccount.external) {
    numberFormat =
      povAccount.id === transaction.sourceAccountId
        ? outgoing
        : povAccount.id === transaction.destinationAccountId
          ? incoming
          : transfer
  } else {
    numberFormat = sourceAccount?.external
      ? incoming
      : destinationAccount?.external
        ? outgoing
        : transfer
  }

  const { sign, color } = numberFormat

  return {
    sign,
    color,
    counterparties: counterpartiesString(sourceAccount, destinationAccount),
  }
}

const isIncome = (
  transaction: UnpersistedTransaction | Transaction,
  accounts: Account[]
) => {
  const hasEnvelope = Boolean(transaction.envelopeId)

  return (
    !hasEnvelope &&
    // We can only decide if a transaction is income if it has a source account set
    transaction.sourceAccountId &&
    isExternal(transaction.sourceAccountId, accounts) &&
    // We can only decide if a transaction is income if it has a destination account set
    transaction.destinationAccountId &&
    !isExternal(transaction.destinationAccountId, accounts)
  )
}

export { getConfiguration, isIncome }

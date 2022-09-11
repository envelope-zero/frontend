import { Account, Transaction } from '../types'
import { safeName } from './name-helper'

const incoming = { color: 'text-lime-700', sign: '+' }
const outgoing = { color: 'text-red-600', sign: '-' }
const transfer = { color: 'text-sky-600', sign: '±' }

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

export { getConfiguration }

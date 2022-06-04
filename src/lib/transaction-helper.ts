import { Account } from '../types'
import { safeName } from './name-helper'

const counterpartiesString = (
  sourceAccount?: Account,
  destinationAccount?: Account
) =>
  `${safeName(sourceAccount, 'account')} → ${safeName(
    destinationAccount,
    'account'
  )}`

export { counterpartiesString }

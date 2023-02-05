import { ChevronRightIcon, LockClosedIcon } from '@heroicons/react/20/solid'
import { Link } from 'react-router-dom'
import {
  Account,
  ApiObject,
  Budget,
  GroupedTransactions as GroupedTransactionsType,
} from '../types'
import { formatDate, formatMoney } from '../lib/format'
import { getConfiguration } from '../lib/transaction-helper'

type Props = {
  budget: Budget
  transactions: GroupedTransactionsType
  accounts: Account[]
  povFromAccount?: boolean
  parent?: ApiObject
}

const GroupedTransactions = ({
  budget,
  transactions,
  accounts,
  povFromAccount,
  parent,
}: Props) => {
  const anyReconciled = Object.values(transactions)
    .flat()
    .some(transaction => transaction.reconciled)

  return (
    <ul>
      {Object.keys(transactions).map(date => (
        <div key={date}>
          <h3 className="border-t first:sm:border-t-0 border-b border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-500">
            {formatDate(date)}
          </h3>
          <div className="divide-y divide-gray-200">
            {transactions[date].map(transaction => {
              const { sign, color, counterparties } = getConfiguration(
                transaction,
                accounts,
                povFromAccount ? (parent as Account) : undefined
              )

              return (
                <li key={transaction.id}>
                  <Link
                    to={`/transactions/${transaction.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-2 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium truncate ${
                            transaction.note ? '' : 'italic'
                          }`}
                        >
                          {transaction.note
                            ? `${transaction.note} (${counterparties})`
                            : counterparties}
                        </p>
                        <div className="flex items-center flex-shrink-0">
                          <div className="pl-2 flex items-center">
                            <p
                              className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${color}`}
                            >
                              {sign}
                              {formatMoney(
                                transaction.amount,
                                budget.currency,
                                {
                                  signDisplay: 'never',
                                }
                              )}
                            </p>
                          </div>
                          <div
                            className={`ml-1 flex ${
                              anyReconciled ? 'w-5' : 'hidden'
                            }`}
                          >
                            {transaction.reconciled ? (
                              <LockClosedIcon className="text-gray-500" />
                            ) : null}
                          </div>
                          <div
                            className={`${
                              anyReconciled ? 'ml-1' : ''
                            } flex w-5`}
                          >
                            <ChevronRightIcon className="text-gray-900" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </div>
        </div>
      ))}
    </ul>
  )
}

export default GroupedTransactions

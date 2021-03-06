import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/outline'
import {
  // FilterIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from '@heroicons/react/solid'
import { Budget, Translation, Transaction, Account } from '../types'
import { formatDate, formatMoney } from '../lib/format'
import { groupBy } from '../lib/array'
import { getConfiguration } from '../lib/transaction-helper'

type Props = {
  budget: Budget
  accounts: Account[]
  transactions: Transaction[]
}
type GroupedTransactions = {
  [key: string]: Transaction[]
}

const TransactionsList = ({ budget, accounts, transactions }: Props) => {
  const { t }: Translation = useTranslation()

  const groupedTransactions: GroupedTransactions = groupBy(
    transactions,
    ({ date }: Transaction) => formatDate(date)
  )

  const anyReconciled = Object.values(transactions)
    .flat()
    .some(transaction => transaction.reconciled)

  return (
    <>
      <div className="header">
        <h1>{t('transactions.transactions')}</h1>
        <div className="header--action">
          {/* TODO: <FilterIcon className="icon" /> */}
          <Link to="/transactions/new">
            <PlusIcon className="icon" />
          </Link>
        </div>
      </div>

      {/* TODO: search bar */}

      {Object.keys(groupedTransactions).length ? (
        <div className="bg-white sm:shadow overflow-hidden sm:rounded-md">
          <ul>
            {Object.keys(groupedTransactions).map(date => (
              <div key={date}>
                <h3 className="border-t border-b border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-500">
                  {date}
                </h3>
                <div className="divide-y divide-gray-200">
                  {groupedTransactions[date].map(transaction => {
                    const { sign, color, counterparties } = getConfiguration(
                      transaction,
                      accounts
                    )

                    return (
                      <li key={transaction.id}>
                        <Link
                          to={`/transactions/${transaction.id}`}
                          className="block hover:bg-gray-50"
                        >
                          <div className="px-2 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
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
                                      'never'
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
        </div>
      ) : (
        t('transactions.emptyList')
      )}
    </>
  )
}

export default TransactionsList

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/outline'
import {
  // FilterIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from '@heroicons/react/solid'
import { Budget, Translation, Transaction, Account } from '../types'
import Error from './Error'
import LoadingSpinner from './LoadingSpinner'
import { formatMoney } from '../lib/format'
import { getTransactions } from '../lib/api/transactions'
import { getAccounts } from '../lib/api/accounts'
import { safeName } from '../lib/name-helper'

type Props = { budget: Budget }

const TransactionsList = ({ budget }: Props) => {
  const { t }: Translation = useTranslation()

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    Promise.all([getTransactions(budget), getAccounts(budget)])
      .then(([transactionData, accountData]) => {
        setTransactions(transactionData) // TODO: sort?
        setAccounts(accountData)
        setIsLoading(false)
        setError('')
      })
      .catch(err => {
        setIsLoading(false)
        setError(err.message)
      })
  }, [budget])

  const anyReconciled = transactions.some(transaction => transaction.reconciled)

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
      <Error error={error} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {transactions.length ? (
            <div className="bg-white sm:shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {transactions.map(transaction => {
                  const sourceAccount = accounts.find(
                    account => account.id === transaction.sourceAccountId
                  )
                  const destinationAccount = accounts.find(
                    account => account.id === transaction.destinationAccountId
                  )

                  let title = transaction.note
                  let color = 'inherit'
                  let sign = ''

                  if (sourceAccount?.external) {
                    sign = '+'
                    color = 'text-lime-700'
                    title ||=
                      `${t('transactions.from')} ${sourceAccount?.name}` || ''
                  } else if (destinationAccount?.external) {
                    sign = '-'
                    color = 'text-red-600'
                    title ||=
                      `${t('transactions.to')} ${destinationAccount?.name}` ||
                      ''
                  } else {
                    sign = '±'
                    color = 'text-sky-600'
                    title ||= `${safeName(
                      sourceAccount,
                      'account'
                    )} → ${safeName(destinationAccount, 'account')}`
                  }

                  return (
                    <li key={transaction.id}>
                      <Link
                        to={`transactions/${transaction.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-2 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium truncate ${
                                transaction.note ? '' : 'italic'
                              }`}
                            >
                              {title ||
                                `${t('untitled')}
                                  ${t('transactions.transaction')}`}
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
              </ul>
            </div>
          ) : (
            t('transactions.emptyList')
          )}
        </>
      )}
    </>
  )
}

export default TransactionsList

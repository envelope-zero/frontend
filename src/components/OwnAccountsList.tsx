import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget, Account } from '../types'
import {
  ArchiveBoxIcon,
  PlusCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { api, get } from '../lib/api/base'
import { formatMoney } from '../lib/format'
import { safeName } from '../lib/name-helper'
import LoadingSpinner from './LoadingSpinner'
import AccountListSwitch from './AccountListSwitch'
import Error from './Error'
import {
  ArrowsRightLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
} from '@heroicons/react/20/solid'

type Props = {
  budget: Budget
}

const accountApi = api('accounts')

const OwnAccountsList = ({ budget }: Props) => {
  const { t }: Translation = useTranslation()
  const [searchParams] = useSearchParams()
  const archived = searchParams.get('archived') === 'true'

  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
    }

    accountApi
      .getAll(budget, { external: false, archived: Boolean(archived) })
      .then(data => {
        if (data.length === 0) {
          return []
        }

        // Create list of all IDs
        const ids = data.map((account: Account) => {
          return account.id
        })

        // Get the computed data for all accounts and add it to the accounts
        return get(
          data[0].links.computedData,
          JSON.stringify({
            time: new Date(),
            ids: ids,
          })
        ).then(computedData => {
          return data.map((account: Account) => ({
            ...account,
            computedData: computedData.find(
              (e: Account['computedData']) => e?.id === account.id
            ),
          }))
        })
      })
      .then(accounts => {
        setAccounts(accounts)
        setIsLoading(false)
        setError('')
      })
      .catch(err => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [budget, archived]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="header">
        <h1>{t('accounts.accounts')}</h1>
        <Link
          to="/own-accounts/new"
          className="header--action"
          title={t('accounts.create')}
        >
          <PlusIcon className="icon-red" />
        </Link>
      </div>

      <AccountListSwitch selected="internal" />
      <Error error={error} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {archived ? (
            <div className="align-center link-blue flex justify-start pb-2">
              <Link to="/own-accounts?archived=false">
                <ChevronLeftIcon className="icon relative bottom-0.5 inline" />
                {t('back')}
              </Link>
            </div>
          ) : (
            <div className="align-center link-blue flex justify-end pb-2">
              <Link to="/own-accounts?archived=true">
                {t('showArchived')}
                <ChevronRightIcon className="icon relative bottom-0.5 inline" />
              </Link>
            </div>
          )}
          {accounts.length ? (
            <>
              <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                {accounts.map(account => (
                  <li
                    key={account.id}
                    className="card col-span-1 flex flex-col justify-between divide-y  divide-gray-200 p-0 dark:divide-gray-600"
                  >
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="items-start justify-between lg:flex lg:space-x-3">
                          <div className="flex justify-between lg:block">
                            <h3
                              className={`truncate text-base font-bold ${
                                account.name === '' ? 'italic' : ''
                              }`}
                            >
                              {safeName(account, 'account')}
                              {account.archived ? (
                                <ArchiveBoxIcon
                                  className="icon-sm link-blue ml-2 inline stroke-2"
                                  title={t('archived')}
                                />
                              ) : null}
                            </h3>
                            {account.computedData ? (
                              <div
                                className={`${
                                  Number(account.computedData.balance) >= 0
                                    ? 'text-lime-600'
                                    : 'text-red-600'
                                } text-right text-lg lg:mt-2 lg:text-left`}
                              >
                                <strong>
                                  {formatMoney(
                                    account.computedData.balance,
                                    budget.currency,
                                    { signDisplay: 'auto' }
                                  )}
                                </strong>
                              </div>
                            ) : null}
                          </div>
                          {!account.onBudget && (
                            <span className="inline-flex flex-shrink-0 items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                              {t('accounts.offBudget')}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                          {account.note}
                        </p>
                      </div>
                    </div>
                    <div className="-mt-px flex divide-x divide-gray-200 dark:divide-gray-600">
                      <div className="flex w-0 flex-1">
                        <Link
                          to={`/transactions?account=${account.id}`}
                          className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-gray-100"
                        >
                          <ArrowsRightLeftIcon
                            className="icon-sm text-gray-400"
                            aria-hidden="true"
                          />
                          {t('accounts.showTransactions')}
                        </Link>
                      </div>
                      <div className="-ml-px flex w-0 flex-1">
                        <Link
                          to={`${account.id}`}
                          className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-800 dark:text-gray-200"
                        >
                          <PencilIcon
                            className="icon-sm text-gray-400"
                            aria-hidden="true"
                          />
                          {t('editObject', { object: t('accounts.account') })}
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="text-center text-gray-700 dark:text-gray-300">
                {archived
                  ? t('accounts.emptyArchive')
                  : t('accounts.emptyList')}
              </div>
              {!archived && (
                <Link to="/own-accounts/new" title={t('accounts.create')}>
                  <PlusCircleIcon className="icon-red icon-lg mx-auto mt-4" />
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}

export default OwnAccountsList

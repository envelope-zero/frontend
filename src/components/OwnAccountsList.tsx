import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget, Account } from '../types'
import { PencilIcon } from '@heroicons/react/24/solid'
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
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

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
            <div className="flex align-center justify-start link-blue pb-2">
              <Link to="/own-accounts?archived=false">
                <ChevronLeftIcon className="icon inline relative bottom-0.5" />
                {t('back')}
              </Link>
            </div>
          ) : (
            <div className="flex align-center justify-end link-blue pb-2">
              <Link to="/own-accounts?archived=true">
                {t('showArchived')}
                <ChevronRightIcon className="icon inline relative bottom-0.5" />
              </Link>
            </div>
          )}
          {accounts.length ? (
            <ul className="grid grid-cols-1 gap-5 sm:gap-6">
              {accounts.map(account => (
                <li
                  key={account.id}
                  className="card col-span-1 relative hover:bg-gray-50 dark:hover:bg-slate-700 p-4 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <Link to={`${account.id}`} className="w-full text-center">
                    <div title={t('edit')} className="absolute right-4">
                      <PencilIcon className="icon-red" />
                    </div>
                    <h3
                      className={`full-centered ${
                        typeof account.name === 'undefined' ? 'italic' : ''
                      }`}
                    >
                      {safeName(account, 'account')}
                      {account.archived ? (
                        <ArchiveBoxIcon
                          className="icon-sm inline link-blue ml-2 stroke-2"
                          title={t('archived')}
                        />
                      ) : null}
                    </h3>
                    {account.onBudget ? null : (
                      <div className="text-gray-700 dark:text-gray-300">
                        {t('accounts.offBudget')}
                      </div>
                    )}
                    {account.note ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                        {account.note}
                      </p>
                    ) : null}
                    {account.computedData ? (
                      <div
                        className={`${
                          Number(account.computedData.balance) >= 0
                            ? 'text-lime-600'
                            : 'text-red-600'
                        } mt-2 text-lg`}
                      >
                        <strong>
                          {formatMoney(
                            account.computedData.balance,
                            budget.currency
                          )}
                        </strong>
                      </div>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className="text-gray-700 dark:text-gray-300 text-center">
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

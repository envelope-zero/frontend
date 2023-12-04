import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Budget, Translation, Account } from '../types'
import { ArchiveBoxIcon, PlusIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'
import AccountListSwitch from './AccountListSwitch'
import Error from './Error'
import { api } from '../lib/api/base'
import { safeName } from '../lib/name-helper'
import { PencilIcon } from '@heroicons/react/24/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

const accountApi = api('accounts')

const ExternalAccountsList = ({ budget }: { budget: Budget }) => {
  const { t }: Translation = useTranslation()
  const [searchParams] = useSearchParams()
  const archived = searchParams.get('archived') === 'true'

  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<{ [key: string]: Account[] }>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
    }

    accountApi
      .getAll(budget, { external: true, archived: Boolean(archived) })
      .then(data => {
        const groupedAccounts = data.reduce(
          (object: { [letter: string]: Account[] }, account: Account) => {
            const letter = (account.name || '').substring(0, 1).toUpperCase()
            object[letter] ||= []
            object[letter].push(account)
            object[letter] = object[letter].sort((a, b) =>
              safeName(a, 'account').localeCompare(safeName(b, 'account'))
            )
            return object
          },
          {}
        )

        setAccounts(groupedAccounts)
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
          to="/external-accounts/new"
          className="header--action"
          title={t('accounts.create')}
        >
          <PlusIcon className="icon-red" />
        </Link>
      </div>

      <AccountListSwitch selected="external" />
      <Error error={error} />
      {/* TODO: search bar */}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {archived ? (
            <div className="flex align-center justify-start link-blue pb-2">
              <Link to="/external-accounts?archived=false">
                <ChevronLeftIcon className="icon inline relative bottom-0.5" />
                {t('back')}
              </Link>
            </div>
          ) : (
            <div className="flex align-center justify-end link-blue pb-2">
              <Link to="/external-accounts?archived=true">
                {t('showArchived')}
                <ChevronRightIcon className="icon inline relative bottom-0.5" />
              </Link>
            </div>
          )}
          {Object.keys(accounts).length ? (
            <nav className="h-full overflow-y-auto" aria-label="Directory">
              {Object.keys(accounts)
                .sort()
                .map(letter => (
                  <div key={letter} className="relative">
                    <div className="border-t border-b border-gray-200 dark:border-gray-900 bg-gray-50  dark:bg-gray-700 px-6 py-1 text-sm font-medium text-gray-500">
                      <h3>{letter || t('untitled')}</h3>
                    </div>
                    <ul className="relative z-0 divide-y divide-gray-200 dark:divide-gray-900">
                      {accounts[letter].map(account => (
                        <li
                          key={account.id}
                          className="bg-white dark:bg-slate-800"
                        >
                          <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div className="flex-1 min-w-0">
                              <Link to={`${account.id}`}>
                                <div>
                                  <div
                                    className={`${
                                      typeof account.name === 'undefined'
                                        ? 'italic'
                                        : ''
                                    } text-sm font-medium text-gray-900 dark:text-gray-100 flex justify-between`}
                                  >
                                    <span className="full-centered">
                                      {account.archived ? (
                                        <ArchiveBoxIcon
                                          className="icon-sm inline link-blue mr-2 stroke-2"
                                          title={t('archived')}
                                        />
                                      ) : null}
                                      {safeName(account, 'account')}
                                    </span>
                                    <PencilIcon className="icon-red" />
                                  </div>
                                  <p className="text-sm text-gray-500 truncate">
                                    {account.note}
                                  </p>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </nav>
          ) : (
            <div className="text-gray-700 dark:text-gray-300">
              {t('accounts.emptyList')}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ExternalAccountsList

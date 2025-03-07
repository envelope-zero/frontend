import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Budget, Translation, Account } from '../types'
import {
  ArchiveBoxIcon,
  PlusCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'
import AccountListSwitch from './AccountListSwitch'
import Error from './Error'
import { api } from '../lib/api/base'
import { safeName } from '../lib/name-helper'
import { PencilIcon } from '@heroicons/react/24/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import SearchBar from './SearchBar'

const accountApi = api('accounts')

const ExternalAccountsList = ({ budget }: { budget: Budget }) => {
  const { t }: Translation = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const archived = searchParams.get('archived') === 'true'

  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<{ [key: string]: Account[] }>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
    }

    accountApi
      .getAll(budget, {
        external: true,
        archived: Boolean(archived),
        search: searchParams.get('search') ?? '',
      })
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
  }, [budget, archived, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

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

      <SearchBar
        resourceLabel={t('accounts.accounts')}
        value={searchParams.get('search')}
        onSubmit={search => {
          if (search) {
            searchParams.set('search', search)
            setSearchParams(searchParams)
          } else {
            searchParams.delete('search')
            setSearchParams(searchParams)
          }
        }}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {archived ? (
            <div className="align-center link-blue flex justify-start pb-2">
              <Link to="/external-accounts?archived=false">
                <ChevronLeftIcon className="icon relative bottom-0.5 inline" />
                {t('back')}
              </Link>
            </div>
          ) : (
            <div className="align-center link-blue flex justify-end pb-2">
              <Link to="/external-accounts?archived=true">
                {t('showArchived')}
                <ChevronRightIcon className="icon relative bottom-0.5 inline" />
              </Link>
            </div>
          )}
          {Object.keys(accounts).length ? (
            <nav
              className="card h-full overflow-y-auto p-0"
              aria-label="Directory"
            >
              {Object.keys(accounts)
                .sort()
                .map(letter => (
                  <div key={letter} className="relative">
                    <div className="border-y border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500 dark:border-gray-900 dark:bg-gray-700">
                      <h3>{letter || t('untitled')}</h3>
                    </div>
                    <ul className="relative z-0">
                      {accounts[letter].map(account => (
                        <li
                          key={account.id}
                          className="relative flex items-center space-x-3 px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="min-w-0 flex-1">
                            <Link to={`${account.id}`}>
                              <div>
                                <div
                                  className={`${
                                    !account.name ? 'italic' : ''
                                  } flex justify-between text-sm font-medium text-gray-900 dark:text-gray-100`}
                                >
                                  <span className="full-centered">
                                    {account.archived ? (
                                      <ArchiveBoxIcon
                                        className="icon-sm link-blue mr-2 inline stroke-2"
                                        title={t('archived')}
                                      />
                                    ) : null}
                                    {safeName(account, 'account')}
                                  </span>
                                  <PencilIcon className="icon-red" />
                                </div>
                                <p className="truncate text-sm text-gray-500">
                                  {account.note}
                                </p>
                              </div>
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </nav>
          ) : (
            <div className="text-center text-gray-700 dark:text-gray-300">
              {archived ? t('accounts.emptyArchive') : t('accounts.emptyList')}
              {!archived && (
                <Link to="/external-accounts/new" title={t('accounts.create')}>
                  <PlusCircleIcon className="icon-red icon-lg mx-auto mt-4" />
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ExternalAccountsList

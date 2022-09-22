import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Budget, Translation, Account } from '../types'
import { PlusIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'
import AccountListSwitch from './AccountListSwitch'
import Error from './Error'
import { api } from '../lib/api/base'
import { safeName } from '../lib/name-helper'
import { PencilIcon } from '@heroicons/react/24/solid'

const accountApi = api('accounts')

const ExternalAccountsList = ({ budget }: { budget: Budget }) => {
  const { t }: Translation = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<{ [key: string]: Account[] }>({})
  const [error, setError] = useState('')

  useEffect(() => {
    accountApi
      .getAll(budget, { external: true })
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
  }, [budget])

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
          {Object.keys(accounts).length ? (
            <nav className="h-full overflow-y-auto" aria-label="Directory">
              {Object.keys(accounts)
                .sort()
                .map(letter => (
                  <div key={letter} className="relative">
                    <div className="border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                      <h3>{letter || t('untitled')}</h3>
                    </div>
                    <ul className="relative z-0 divide-y divide-gray-200">
                      {accounts[letter].map(account => (
                        <li key={account.id} className="bg-white">
                          <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`${account.id}`}
                                className="focus:outline-none"
                              >
                                <div>
                                  <div
                                    className={`${
                                      typeof account.name === 'undefined'
                                        ? 'italic'
                                        : ''
                                    } text-sm font-medium text-gray-900 flex justify-between`}
                                  >
                                    {safeName(account, 'account')}
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
            <div>{t('accounts.emptyList')}</div>
          )}
        </>
      )}
    </>
  )
}

export default ExternalAccountsList

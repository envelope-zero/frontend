import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget, Account, ApiResponse } from '../types'
import { PencilIcon } from '@heroicons/react/solid'
import { PlusCircleIcon, PlusIcon } from '@heroicons/react/outline'
import { getInternalAccounts } from '../lib/api/accounts'
import { formatMoney } from '../lib/format'
import { safeName } from '../lib/name-helper'
import LoadingSpinner from './LoadingSpinner'
import AccountListSwitch from './AccountListSwitch'

type Props = {
  budget: ApiResponse<Budget>
}

const OwnAccountsList = ({ budget }: Props) => {
  const { t }: Translation = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    getInternalAccounts(budget).then(data => {
      setAccounts(data)
      setIsLoading(false)
    })
  }, [budget])

  return (
    <>
      <div className="header">
        <h1>{t('accounts.accounts')}</h1>
        <Link to="TODO" className="header--action" title={t('accounts.create')}>
          <PlusIcon className="icon" />
        </Link>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <AccountListSwitch selected="internal" />
          {accounts.length ? (
            <ul className="grid grid-cols-1 gap-5 sm:gap-6">
              {accounts.map(account => (
                <li
                  key={account.id}
                  className="box col-span-1 flex hover:bg-gray-200 p-4 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <Link to="TODO" className="w-full text-center">
                    <h3
                      className={
                        typeof account.name === 'undefined' ? 'italic' : ''
                      }
                    >
                      {safeName(account, 'account')}
                    </h3>
                    {account.onBudget ? null : (
                      <div className="text-gray-700">
                        {t('accounts.offBudget')}
                      </div>
                    )}
                    {account.note ? (
                      <p className="text-sm text-gray-500 whitespace-pre-line">
                        {account.note}
                      </p>
                    ) : null}
                    <div className="text-lime-600 mt-2 text-lg">
                      <strong>
                        {formatMoney(
                          account.balance || 0,
                          budget.data.currency
                        )}
                      </strong>
                    </div>
                  </Link>
                  <Link to={`TODO`} title={t('edit')}>
                    <PencilIcon className="icon" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div>{t('accounts.emptyList')}</div>
          )}
          <Link to="TODO" title={t('accounts.create')}>
            <PlusCircleIcon className="icon icon-lg mx-auto mt-4" />
          </Link>
        </div>
      )}
    </>
  )
}

export default OwnAccountsList

import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Translation,
  Account,
  UnpersistedAccount,
  ApiResponse,
  Budget,
} from '../types'
import { getAccount, updateAccount, createAccount } from '../lib/api/accounts'
import LoadingSpinner from './LoadingSpinner'

type Props = { budget: ApiResponse<Budget>; type: 'internal' | 'external' }

const OwnAccountForm = ({ budget, type }: Props) => {
  const { t }: Translation = useTranslation()
  const { accountId } = useParams()
  const navigate = useNavigate()

  const [account, setAccount] = useState<
    ApiResponse<UnpersistedAccount | Account>
  >({ data: {} })

  const isPersisted = typeof accountId !== 'undefined' && accountId !== 'new'
  const accountData = account?.data

  useEffect(() => {
    if (isPersisted) {
      getAccount(accountId, budget).then(setAccount)
    }
  }, [accountId, budget, isPersisted])

  const updateValue = (key: keyof Account, value: any) => {
    setAccount({ ...account, data: { ...account.data, [key]: value } })
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if ('id' in accountData) {
          updateAccount(accountData).then(() => navigate(-1))
        } else {
          createAccount(accountData, budget).then(() => navigate(-1))
        }
      }}
    >
      <div className="header">
        <h1>{t('accounts.account')}</h1>
        <button className="header--action" type="submit">
          {t('save')}
        </button>
      </div>

      {isPersisted && typeof account === 'undefined' ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
              <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    {t('accounts.name')}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={accountData?.name || ''}
                        onChange={e => updateValue('name', e.target.value)}
                        className="flex-1 block w-full min-w-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {type === 'internal' ? (
                  <div className="grid grid-cols-3 gap-4 items-center sm:border-t sm:border-gray-200 sm:pt-5">
                    <label htmlFor="onbudget">{t('accounts.onBudget')}</label>
                    <div
                      className="mt-px pt-2 pr-2 col-span-2 flex sm:block justify-end"
                      onClick={e => {
                        e.preventDefault()
                        updateValue('onBudget', !accountData.onBudget)
                      }}
                    >
                      <div
                        className={`max-w-lg ${
                          accountData.onBudget ? 'bg-lime-600' : 'bg-gray-200'
                        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500`}
                      >
                        <span
                          aria-hidden="true"
                          className={`${
                            accountData?.onBudget
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          } inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 pointer-events-none`}
                        ></span>
                        <input
                          type="checkbox"
                          id="onBudget"
                          name="onBudget"
                          className="absolute inset-0 sr-only"
                          defaultChecked={accountData?.onBudget}
                          onChange={e =>
                            updateValue('onBudget', e.target.checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    {t('accounts.note')}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <textarea
                      id="note"
                      name="note"
                      rows={3}
                      value={accountData?.note || ''}
                      onChange={e => updateValue('note', e.target.value)}
                      className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
                    />
                  </div>
                </div>

                {isPersisted ? null : (
                  <input
                    type="checkbox"
                    hidden
                    readOnly
                    name="external"
                    checked={type === 'external'}
                  />
                )}
              </div>
            </div>
            {isPersisted ? 'TODO: delete & reconcile actions' : null}
          </div>
          {isPersisted ? 'TODO: transactions' : null}
        </>
      )}
    </form>
  )
}

export default OwnAccountForm

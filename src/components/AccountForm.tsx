import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/solid'
import { Translation, Account, UnpersistedAccount, Budget } from '../types'
import {
  getAccount,
  updateAccount,
  createAccount,
  deleteAccount,
} from '../lib/api/accounts'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import LatestTransactions from './LatestTransactions'
import RemainingHeightContainer from './RemainingHeightContainer'

type Props = {
  budget: Budget
  type: 'internal' | 'external'
  accounts: Account[]
}

const AccountForm = ({ budget, type, accounts }: Props) => {
  const { t }: Translation = useTranslation()
  const { accountId } = useParams()
  const navigate = useNavigate()

  const newAccount = { onBudget: true }

  const [error, setError] = useState('')
  const [account, setAccount] = useState<UnpersistedAccount | Account>({
    ...newAccount,
    external: type === 'external',
  })

  const isPersisted = typeof accountId !== 'undefined' && accountId !== 'new'

  useEffect(() => {
    if (isPersisted) {
      getAccount(accountId, budget)
        .then(data => {
          setAccount(data)
          setError('')
        })
        .catch(err => {
          setError(err.message)
        })
    }
  }, [accountId, budget, isPersisted])

  const updateValue = (key: keyof Account, value: any) => {
    setAccount({ ...account, [key]: value })
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if ('id' in account) {
          updateAccount(account)
            .then(() => navigate(-1))
            .catch(err => {
              setError(err.message)
            })
        } else {
          createAccount(account, budget)
            .then(() => navigate(-1))
            .catch(err => {
              setError(err.message)
            })
        }
      }}
    >
      <div className="header">
        <h1>{t('accounts.account')}</h1>
        <div className="header--action">
          <Link to={-1 as any} className="header--action__secondary">
            {t('cancel')}
          </Link>
          <button type="submit">{t('save')}</button>
        </div>
      </div>

      <Error error={error} />

      {isPersisted && typeof account === 'undefined' ? (
        <LoadingSpinner />
      ) : (
        <>
          <FormFields>
            <FormField
              type="text"
              name="name"
              label={t('accounts.name')}
              value={account.name || ''}
              onChange={e => updateValue('name', e.target.value)}
            />

            {type === 'internal' ? (
              <div className="grid grid-cols-3 gap-4 items-center sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="onbudget">{t('accounts.onBudget')}</label>
                <div
                  className="mt-px pt-2 pr-2 col-span-2 flex sm:block justify-end"
                  onClick={e => {
                    e.preventDefault()
                    updateValue('onBudget', !account.onBudget)
                  }}
                >
                  <div
                    className={`max-w-lg ${
                      account.onBudget ? 'bg-lime-600' : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500`}
                  >
                    <span
                      aria-hidden="true"
                      className={`${
                        account?.onBudget ? 'translate-x-5' : 'translate-x-0'
                      } inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 pointer-events-none`}
                    ></span>
                    <input
                      type="checkbox"
                      id="onBudget"
                      name="onBudget"
                      className="absolute inset-0 sr-only"
                      defaultChecked={account?.onBudget}
                      onChange={e => updateValue('onBudget', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="form-field--wrapper">
              <label htmlFor="note" className="form-field--label">
                {t('accounts.note')}
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  value={account?.note || ''}
                  onChange={e => updateValue('note', e.target.value)}
                  className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
                />
              </div>
            </div>
          </FormFields>

          {isPersisted ? (
            <div className="pt-5">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('accounts.confirmDelete'))) {
                    deleteAccount(account as Account)
                      .then(() => {
                        navigate(-1)
                      })
                      .catch(err => {
                        setError(err.message)
                      })
                  }
                }}
                className="btn-secondary"
              >
                {t('accounts.delete')}
              </button>
              {/* TODO: reconcile */}
            </div>
          ) : null}
          {'links' in account ? (
            <div className="pt-8">
              <RemainingHeightContainer>
                <div className="flex justify-between">
                  <h2>{t('transactions.transactions')}</h2>
                  <Link
                    to={`/transactions?account=${account.id}`}
                    className="flex items-center link-blue"
                  >
                    {/* TODO: confirmation before navigating if unsaved data in form */}
                    {t('seeAll')} <ChevronRightIcon className="inline h-6" />
                  </Link>
                </div>
                <LatestTransactions
                  accounts={accounts}
                  parent={account}
                  budget={budget}
                />
              </RemainingHeightContainer>
            </div>
          ) : null}
        </>
      )}
    </form>
  )
}

export default AccountForm

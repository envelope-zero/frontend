import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { Translation, Account, UnpersistedAccount, Budget } from '../types'
import { api } from '../lib/api/base'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import { TrashIcon } from '@heroicons/react/24/outline'
import submitOnMetaEnter from '../lib/submit-on-meta-enter'
import InputCurrency from './InputCurrency'
import { dateFromIsoString, dateToIsoString } from '../lib/dates'
import ArchiveButton from './ArchiveButton'
import InfoBox from './InfoBox'

const accountApi = api('accounts')

type Props = {
  budget: Budget
  type: 'internal' | 'external'
}

const AccountForm = ({ budget, type }: Props) => {
  const { t }: Translation = useTranslation()
  const { accountId } = useParams()
  const navigate = useNavigate()

  const newAccount = { onBudget: true }

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [account, setAccount] = useState<UnpersistedAccount | Account>({
    ...newAccount,
    external: type === 'external',
  })

  const isPersisted = typeof accountId !== 'undefined' && accountId !== 'new'

  useEffect(() => {
    if (isPersisted) {
      if (!isLoading) {
        setIsLoading(true)
      }
      accountApi
        .get(accountId, budget)
        .then(data => {
          setAccount(data)
          setError('')
          setIsLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setIsLoading(false)
        })
    }
  }, [accountId, budget, isPersisted]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateValue = (key: keyof Account, value: any) => {
    setHasUnsavedChanges(true)
    setAccount({ ...account, [key]: value })
  }

  const confirmDiscardingUnsavedChanges = (e: any) => {
    if (hasUnsavedChanges && !window.confirm(t('discardUnsavedChanges'))) {
      e.preventDefault()
    }
  }

  return (
    <form
      onKeyDown={submitOnMetaEnter}
      onSubmit={e => {
        e.preventDefault()
        if ('id' in account) {
          accountApi
            .update(account)
            .then(() => navigate(-1))
            .catch(err => {
              setError(err.message)
            })
        } else {
          accountApi
            .create(account, budget)
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

      {account.hidden ? (
        <InfoBox
          text={t('archivedObjectInformation', {
            object: t('accounts.account'),
          })}
        />
      ) : null}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {isPersisted && (
            <Link
              onClick={confirmDiscardingUnsavedChanges}
              to={`/transactions?account=${accountId}`}
              className="flex items-center justify-end link-blue"
            >
              {t('transactions.latest')}
              <ChevronRightIcon className="inline h-6" />
            </Link>
          )}

          <FormFields>
            <FormField
              type="text"
              name="name"
              label={t('accounts.name')}
              value={account.name || ''}
              onChange={e => updateValue('name', e.target.value)}
              options={{ autoFocus: true }}
            />

            {type === 'internal' ? (
              <>
                <div className="grid grid-cols-3 gap-4 items-center sm:border-t sm:border-gray-200 dark:sm:border-gray-900 sm:pt-5">
                  <label
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    htmlFor="onbudget"
                  >
                    {t('accounts.onBudget')}
                  </label>
                  <div
                    className="mt-px pt-2 pr-2 col-span-2 flex sm:block justify-end"
                    onClick={e => {
                      e.preventDefault()
                      updateValue('onBudget', !account.onBudget)
                    }}
                  >
                    <div
                      className={`max-w-lg ${
                        account.onBudget
                          ? 'bg-lime-600 dark:bg-lime-500'
                          : 'bg-gray-200 dark:bg-slate-700'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2`}
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
                        onChange={e =>
                          updateValue('onBudget', e.target.checked)
                        }
                      />
                    </div>
                  </div>
                </div>
                <FormField
                  type="number"
                  name="initialBalance"
                  label={t('accounts.initialBalance')}
                  value={account.initialBalance || ''}
                  onChange={e => updateValue('initialBalance', e.target.value)}
                >
                  <InputCurrency currency={budget.currency} />
                </FormField>
                <FormField
                  type="date"
                  name="initialBalanceDate"
                  label={t('accounts.initialBalanceDate')}
                  value={dateFromIsoString(
                    account.initialBalanceDate || new Date().toISOString()
                  )}
                  onChange={e => {
                    // value is empty string for invalid dates (e.g. when prefixing month with 0 while typing) – we want to ignore that and keep the previous input
                    if (e.target.value) {
                      updateValue(
                        'initialBalanceDate',
                        dateToIsoString(e.target.value)
                      )
                    }
                  }}
                />
              </>
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
            <div className="pt-5 space-y-3">
              <ArchiveButton
                resource={account as Account}
                resourceTypeTranslation={t('accounts.account')}
                apiConnection={accountApi}
                onSuccess={data => {
                  setAccount(data)
                  if (error) {
                    setError('')
                  }
                }}
                onError={setError}
              />
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('accounts.confirmDelete'))) {
                    accountApi
                      .delete(account as Account)
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
                <TrashIcon className="icon-red icon-sm inline mr-1 relative bottom-0.5" />
                {t('accounts.delete')}
              </button>
              {/* TODO: reconcile */}
            </div>
          ) : null}
        </>
      )}
    </form>
  )
}

export default AccountForm

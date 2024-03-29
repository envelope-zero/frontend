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
      </div>

      <Error error={error} />

      {account.archived ? (
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
              className="link-blue flex items-center justify-end py-4"
            >
              {t('transactions.latest')}
              <ChevronRightIcon className="inline h-6" />
            </Link>
          )}
          <div className="card">
            <FormFields className="grid-cols-2 md:grid md:gap-x-4 md:gap-y-6">
              <FormField
                className="col-span-full"
                type="text"
                name="name"
                label={t('accounts.name')}
                value={account.name || ''}
                onChange={e => updateValue('name', e.target.value)}
                options={{ autoFocus: true }}
              />

              {type === 'internal' ? (
                <>
                  <div className="relative col-span-full flex items-start">
                    <div
                      className="col-span-2 mt-px flex justify-end pr-2 pt-2 sm:block"
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
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2`}
                      >
                        <span
                          aria-hidden="true"
                          className={`${
                            account?.onBudget
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        ></span>
                        <input
                          type="checkbox"
                          id="onBudget"
                          name="onBudget"
                          className="sr-only absolute inset-0"
                          defaultChecked={account?.onBudget}
                          onChange={e =>
                            updateValue('onBudget', e.target.checked)
                          }
                        />
                      </div>
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label className="form-field--label" htmlFor="onBudget">
                        {t('accounts.onBudget')}
                      </label>
                      <p
                        id="comments-description"
                        className="text-gray-500 dark:text-gray-400"
                      >
                        {account.onBudget
                          ? t('accounts.onBudgetExplanation')
                          : t('accounts.offBudgetExplanation')}
                      </p>
                    </div>
                  </div>
                  <FormField
                    type="number"
                    name="initialBalance"
                    label={t('accounts.initialBalance')}
                    value={account.initialBalance || ''}
                    onChange={e =>
                      updateValue('initialBalance', e.target.value)
                    }
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

              <div className="col-span-full">
                <label htmlFor="note" className="form-field--label">
                  {t('accounts.note')}
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={account?.note || ''}
                    onChange={e => updateValue('note', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </FormFields>

            <div className="button-group mt-8">
              <button type="submit" className="btn-primary">
                {t('save')}
              </button>
              {isPersisted ? (
                <>
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
                    className="btn-secondary-red"
                  >
                    <TrashIcon className="icon-red icon-sm relative bottom-0.5 mr-1 inline" />
                    {t('accounts.delete')}
                  </button>
                  {/* TODO: reconcile */}
                </>
              ) : (
                <Link to={-1 as any} className="btn-secondary">
                  {t('cancel')}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default AccountForm

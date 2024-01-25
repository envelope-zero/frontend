import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import { DocumentDuplicateIcon, TrashIcon } from '@heroicons/react/24/outline'
import { api, get } from '../lib/api/base'
import {
  dateFromIsoString,
  dateToIsoString,
  monthYearFromDate,
  setToFirstOfTheMonth,
} from '../lib/dates'
import { safeName } from '../lib/name-helper'
import {
  Budget,
  Translation,
  Transaction,
  UnpersistedTransaction,
  Account,
  UnpersistedAccount,
  Envelope,
  Category,
  GroupedEnvelopes,
  RecentEnvelope,
} from '../types'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import Autocomplete from './Autocomplete'
import InputCurrency from './InputCurrency'
import isSupported from '../lib/is-supported'
import { isIncome } from '../lib/transaction-helper'

const transactionApi = api('transactions')
const accountApi = api('accounts')
const categoryApi = api('categories')
const envelopeApi = api('envelopes')

type Props = {
  budget: Budget
  setNotification: (notification: string) => void
}

const TransactionForm = ({ budget, setNotification }: Props) => {
  const { t }: Translation = useTranslation()
  const { transactionId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [groupedEnvelopes, setGroupedEnvelopes] = useState<GroupedEnvelopes>([])
  const [transaction, setTransaction] = useState<
    UnpersistedTransaction | Transaction
  >({})
  const [sourceAccountToCreate, setSourceAccountToCreate] =
    useState<UnpersistedAccount>()
  const [destinationAccountToCreate, setDestinationAccountToCreate] =
    useState<UnpersistedAccount>()
  const [recentEnvelopes, setRecentEnvelopes] = useState<RecentEnvelope[]>([])

  const isPersisted =
    typeof transactionId !== 'undefined' && transactionId !== 'new'

  const templateId = searchParams.get('duplicateFrom')

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
    }

    const promises = [
      categoryApi.getAll(budget).then((data: Category[]) =>
        setGroupedEnvelopes(
          data.map(category => ({
            title: safeName(category, 'category', t('categories.category')),
            items: category.envelopes,
          }))
        )
      ),
      accountApi.getAll(budget).then(setAccounts),
      envelopeApi.getAll(budget).then(setEnvelopes),
    ]

    if (isPersisted) {
      promises.push(
        transactionApi.get(transactionId, budget).then(setTransaction)
      )
    } else if (transactionId === 'new' && templateId) {
      promises.push(
        transactionApi.get(templateId, budget).then(template => {
          setTransaction({
            ...template,
            id: undefined,
            date: new Date().toISOString(),
            availableFrom: new Date().toISOString(),
          })
        })
      )
    } else if (transactionId === 'new') {
      promises.push(new Promise(resolve => resolve(setTransaction({}))))
    }

    Promise.all(promises)
      .then(() => setError(''))
      .catch(err => {
        setError(err.message)
      })
      .then(() => setIsLoading(false))
  }, [budget, transactionId, templateId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateValue = (key: keyof Transaction, value: any) => {
    setTransaction({ ...transaction, [key]: value })
  }

  const createNewResources = async () => {
    const promises = []
    let { sourceAccountId, destinationAccountId } = transaction

    if (sourceAccountToCreate) {
      promises.push(
        accountApi
          .create({ ...sourceAccountToCreate, external: true }, budget)
          .then(createdAccount => {
            sourceAccountId = createdAccount.id
          })
      )
    }

    if (destinationAccountToCreate) {
      promises.push(
        accountApi
          .create({ ...destinationAccountToCreate, external: true }, budget)
          .then(createdAccount => {
            destinationAccountId = createdAccount.id
          })
      )
    }

    return Promise.all(promises).then(() => ({
      sourceAccountId,
      destinationAccountId,
    }))
  }

  const accountGroups = [
    {
      title: t('accounts.internalAccounts'),
      items: accounts.filter(account => !account.external),
    },
    {
      title: t('accounts.externalAccounts'),
      items: accounts.filter(account => account.external),
    },
  ]

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()

        if (transaction.reconciled) {
          setError(t('transactions.unlockBeforeEditingError'))
          return
        }

        createNewResources()
          .then(({ sourceAccountId, destinationAccountId }) => {
            const transactionWithNewResources:
              | UnpersistedTransaction
              | Transaction = {
              ...transaction,
              sourceAccountId,
              destinationAccountId,
            }

            let result
            if (isPersisted) {
              result = transactionApi.update(
                transactionWithNewResources as Transaction
              )
            } else {
              result = transactionApi.create(
                transactionWithNewResources,
                budget
              )
            }

            return result.then(() => navigate('/transactions'))
          })
          .catch(err => setError(err.message))
      }}
    >
      <div className="header">
        <h1>{t('transactions.transaction')}</h1>
      </div>

      <Error error={error} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card md:mt-8">
          {transaction.reconciled ? (
            <div>
              <button
                type="button"
                className="btn-secondary font-bold"
                onClick={e => {
                  e.preventDefault()
                  if ('id' in transaction) {
                    transactionApi
                      .update({
                        ...transaction,
                        reconciled: false,
                      })
                      .then(setTransaction)
                      .catch(err => setError(err.message))
                  }
                }}
              >
                <LockClosedIcon className="icon-red inline mr-1" />
                {t('transactions.unlock')}
              </button>
              <small className="text-xs md:text-sm">
                {t('transactions.unlockBeforeEditingNote')}
              </small>
            </div>
          ) : null}

          <FormFields className="md:grid grid-cols-2 gap-x-4 space-y-6 md:space-y-0 md:gap-y-6">
            <FormField
              type="text"
              name="note"
              label={t('transactions.note')}
              value={transaction.note || ''}
              onChange={e => updateValue('note', e.target.value)}
              options={{
                disabled: transaction.reconciled || false,
                autoFocus: true,
              }}
              className="col-span-full"
            />

            <FormField
              type="number"
              name="amount"
              label={t('transactions.amount')}
              value={transaction.amount ?? ''}
              onChange={e => updateValue('amount', e.target.value)}
              options={{
                disabled: transaction.reconciled || false,
                step: 'any',
              }}
            >
              <InputCurrency currency={budget.currency} />
            </FormField>

            <Autocomplete<Account>
              groups={accountGroups}
              allowNewCreation={true}
              itemLabel={account => safeName(account, 'account')}
              itemId={account => account.id || safeName(account, 'account')}
              label={t('transactions.sourceAccountId')}
              onChange={account => {
                if (!account.id) {
                  setSourceAccountToCreate(account)
                  updateValue('sourceAccountId', undefined)
                } else {
                  setSourceAccountToCreate(undefined)
                  const valuesToUpdate: UnpersistedTransaction = {
                    sourceAccountId: account.id,
                  }
                  setTransaction({ ...transaction, ...valuesToUpdate })
                }
              }}
              value={
                (accounts.find(
                  account => account.id === transaction.sourceAccountId
                ) as Account) ||
                sourceAccountToCreate ||
                ''
              }
              disabled={transaction.reconciled}
              wrapperClass="col-start-1"
            />

            <Autocomplete<Account>
              groups={accountGroups}
              allowNewCreation={true}
              itemLabel={account => safeName(account, 'account')}
              itemId={account => account.id || safeName(account, 'account')}
              label={t('transactions.destinationAccountId')}
              onChange={account => {
                if (!account.id) {
                  setDestinationAccountToCreate(account)
                  updateValue('destinationAccountId', undefined)
                } else {
                  setDestinationAccountToCreate(undefined)
                  const valuesToUpdate: UnpersistedTransaction = {
                    destinationAccountId: account.id,
                  }

                  let envelopePromises = []

                  // Verify if we need to propose an envelope
                  if (account.external && !transaction.envelopeId) {
                    // Fetch the recent envelopes and suggest the first one
                    // as the Envelope to use for this transaction
                    envelopePromises.push(
                      get(account.links.recentEnvelopes).then(data => {
                        setRecentEnvelopes(data)
                        if (data.length) {
                          valuesToUpdate.envelopeId = data[0].id
                        }
                      })
                    )
                  } else if (!account.external) {
                    setRecentEnvelopes([])
                  }

                  Promise.all(envelopePromises).then(() =>
                    setTransaction({ ...transaction, ...valuesToUpdate })
                  )
                }
              }}
              value={
                (accounts.find(
                  account => account.id === transaction.destinationAccountId
                ) as Account) ||
                destinationAccountToCreate ||
                ''
              }
              disabled={transaction.reconciled}
            />

            <Autocomplete<Envelope>
              groups={[
                {
                  title: t('transactions.recentEnvelopes'),
                  items: recentEnvelopes.map(
                    recentEnvelope =>
                      envelopes.find(
                        envelope => envelope.id === recentEnvelope.id
                      ) as Envelope
                  ),
                },
                ...groupedEnvelopes,
              ]}
              allowNewCreation={false}
              emptyOption={t('envelopes.none')}
              value={
                (groupedEnvelopes
                  .flatMap(group => group.items)
                  .find(
                    envelope => envelope.id === transaction.envelopeId
                  ) as Envelope) || null
              }
              label={t('transactions.envelopeId')}
              itemLabel={envelope => safeName(envelope, 'envelope')}
              itemId={envelope => envelope.id || safeName(envelope, 'envelope')}
              onChange={envelope => {
                if (envelope === null) {
                  updateValue('envelopeId', null)
                } else {
                  updateValue('envelopeId', envelope.id)
                }
              }}
              wrapperClass="col-span-2"
            />

            <FormField
              type="date"
              name="date"
              label={t('transactions.date')}
              value={dateFromIsoString(
                transaction.date || new Date().toISOString()
              )}
              onChange={e => {
                // value is empty string for invalid dates (e.g. when prefixing month with 0 while typing) – we want to ignore that and keep the previous input
                if (e.target.value) {
                  updateValue('date', dateToIsoString(e.target.value))
                }
              }}
              options={{ disabled: transaction.reconciled || false }}
            />
            {isIncome(transaction, accounts) ? (
              <FormField
                type={isSupported.inputTypeMonth() ? 'month' : 'date'}
                name="availableFrom"
                label={t('transactions.availableFrom')}
                note={`(${t('transactions.onlyRelevantForIncome')})`}
                tooltip={`${t('transactions.availableFromExplanation')}${
                  isSupported.inputTypeMonth()
                    ? ''
                    : t('transactions.availableFromMonthField')
                }`}
                value={(isSupported.inputTypeMonth()
                  ? (date: string) => monthYearFromDate(new Date(date))
                  : (date: string) =>
                      setToFirstOfTheMonth(dateFromIsoString(date)))(
                  transaction.availableFrom ||
                    transaction.date ||
                    new Date().toISOString()
                )}
                onChange={e => {
                  // value is empty string for invalid dates (e.g. when prefixing month with 0 while typing) – we want to ignore that and keep the previous input
                  if (e.target.value) {
                    updateValue(
                      'availableFrom',
                      dateToIsoString(setToFirstOfTheMonth(e.target.value))
                    )
                  }
                }}
                options={{ disabled: transaction.reconciled || false }}
              />
            ) : null}
          </FormFields>

          <div className="mt-8 button-group">
            <button type="submit" className="btn-primary">
              {t('save')}
            </button>
            {isPersisted ? (
              <>
                <Link
                  to={`/transactions/new?duplicateFrom=${transactionId}`}
                  className="btn-secondary"
                >
                  <DocumentDuplicateIcon className="icon-sm inline mr-1 relative bottom-0.5" />
                  {t('transactions.repeat')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('transactions.confirmDelete'))) {
                      transactionApi
                        .delete(transaction as Transaction)
                        .then(() => {
                          setNotification(t('deleteSuccess'))
                          navigate(-1)
                        })
                        .catch(err => {
                          setError(err.message)
                        })
                    }
                  }}
                  className="btn-secondary-red"
                >
                  <TrashIcon className="icon-red icon-sm inline mr-1 relative bottom-0.5" />
                  {t('transactions.delete')}
                </button>
              </>
            ) : (
              <Link to={-1 as any} className="btn-secondary">
                {t('cancel')}
              </Link>
            )}
          </div>
        </div>
      )}
    </form>
  )
}

export default TransactionForm

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LockClosedIcon } from '@heroicons/react/solid'
import { api } from '../lib/api/base'
import { dateFromIsoString, dateToIsoString } from '../lib/dates'
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
} from '../types'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import Autocomplete from './Autocomplete'

const transactionApi = api('transactions')
const accountApi = api('accounts')
const categoryApi = api('categories')

type Props = {
  budget: Budget
  accounts: Account[]
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
}

const TransactionForm = ({
  budget,
  accounts,
  transactions,
  setTransactions,
}: Props) => {
  const { t }: Translation = useTranslation()
  const { transactionId } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')

  const [groupedEnvelopes, setGroupedEnvelopes] = useState<
    { title?: string; items: Envelope[] }[]
  >([])
  const [transaction, setTransaction] = useState<
    UnpersistedTransaction | Transaction
  >({})
  const [sourceAccountToCreate, setSourceAccountToCreate] =
    useState<UnpersistedAccount>()
  const [destinationAccountToCreate, setDestinationAccountToCreate] =
    useState<UnpersistedAccount>()

  const isPersisted =
    typeof transactionId !== 'undefined' && transactionId !== 'new'

  useEffect(() => {
    const promises = [
      categoryApi.getAll(budget).then((data: Category[]) =>
        setGroupedEnvelopes(
          data.map(category => ({
            title: safeName(category, 'category', t('categories.category')),
            items: category.envelopes,
          }))
        )
      ),
    ]

    if (isPersisted) {
      promises.push(
        transactionApi.get(transactionId, budget).then(setTransaction)
      )
    }

    Promise.all(promises)
      .then(() => setError(''))
      .catch(err => {
        setError(err.message)
      })
  }, [budget, isPersisted, transactionId, t])

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
              result = transactionApi
                .update(transactionWithNewResources as Transaction)
                .then(updatedTransaction => {
                  setTransactions([
                    updatedTransaction,
                    ...transactions.filter(
                      transaction => transaction.id !== updatedTransaction.id
                    ),
                  ])
                })
            } else {
              result = transactionApi
                .create(transactionWithNewResources, budget)
                .then(newTransaction => {
                  setTransactions([newTransaction, ...transactions])
                })
            }

            return result.then(() => navigate(-1))
          })
          .catch(err => setError(err.message))
      }}
    >
      <div className="header">
        <h1>{t('transactions.transaction')}</h1>
        <div className="header--action">
          <Link to={-1 as any} className="header--action__secondary">
            {t('cancel')}
          </Link>
          <button type="submit">{t('save')}</button>
        </div>
      </div>

      <Error error={error} />

      {isPersisted && typeof transaction === 'undefined' ? (
        <LoadingSpinner />
      ) : (
        <>
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
                <LockClosedIcon className="icon inline mr-1" />
                {t('transactions.unlock')}
              </button>
              <small className="text-xs md:text-sm">
                {t('transactions.unlockBeforeEditingNote')}
              </small>
            </div>
          ) : null}

          <FormFields>
            <FormField
              type="text"
              name="note"
              label={t('transactions.note')}
              value={transaction.note || ''}
              onChange={e => updateValue('note', e.target.value)}
              options={{ disabled: transaction.reconciled || false }}
            />

            <FormField
              type="number"
              name="amount"
              label={t('transactions.amount')}
              value={transaction.amount || ''}
              onChange={e => updateValue('amount', Number(e.target.value))}
              options={{ disabled: transaction.reconciled || false }}
            >
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {budget.currency}
                </span>
              </div>
            </FormField>

            <FormField
              type="date"
              name="date"
              label={t('transactions.date')}
              value={dateFromIsoString(transaction.date || '')}
              onChange={e =>
                updateValue('date', dateToIsoString(e.target.value))
              }
              options={{ disabled: transaction.reconciled || false }}
            />

            <Autocomplete<Account>
              groups={accountGroups}
              allowNewCreation={true}
              itemLabel={account => safeName(account, 'account')}
              itemId={account => account.id || safeName(account, 'account')}
              label={t('transactions.sourceAccountId')}
              onChange={account => {
                if (!account.id) {
                  setSourceAccountToCreate(account)
                } else {
                  setSourceAccountToCreate(undefined)
                  updateValue('sourceAccountId', account.id)
                }
              }}
              value={
                (accounts.find(
                  account => account.id === transaction.sourceAccountId
                ) as Account) || sourceAccountToCreate
              }
              disabled={transaction.reconciled}
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
                } else {
                  setDestinationAccountToCreate(undefined)
                  updateValue('destinationAccountId', account.id)
                }
              }}
              value={
                (accounts.find(
                  account => account.id === transaction.destinationAccountId
                ) as Account) || destinationAccountToCreate
              }
              disabled={transaction.reconciled}
            />

            <Autocomplete<Envelope>
              groups={groupedEnvelopes}
              allowNewCreation={false}
              value={
                groupedEnvelopes
                  .flatMap(group => group.items)
                  .find(
                    envelope => envelope.id === transaction.envelopeId
                  ) as Envelope
              }
              label={t('transactions.envelopeId')}
              itemLabel={envelope => safeName(envelope, 'envelope')}
              itemId={envelope => envelope.id || safeName(envelope, 'envelope')}
              onChange={envelope => {
                updateValue('envelopeId', envelope.id)
              }}
            />
          </FormFields>

          {isPersisted ? (
            <div className="pt-5">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('transactions.confirmDelete'))) {
                    transactionApi
                      .delete(transaction as Transaction)
                      .then(() => {
                        setTransactions(
                          transactions.filter(
                            oldTransaction =>
                              oldTransaction.id !==
                              (transaction as Transaction).id
                          )
                        )
                        navigate(-1)
                      })
                      .catch(err => {
                        setError(err.message)
                      })
                  }
                }}
                className="btn-secondary"
              >
                {t('transactions.delete')}
              </button>
            </div>
          ) : null}
        </>
      )}
    </form>
  )
}

export default TransactionForm

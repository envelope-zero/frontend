import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getTransaction,
  deleteTransaction,
  updateTransaction,
  createTransaction,
} from '../lib/api/transactions'
import {
  Budget,
  Translation,
  Transaction,
  UnpersistedTransaction,
} from '../types'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'
import { LockClosedIcon } from '@heroicons/react/solid'

type Props = { budget: Budget }

const TransactionForm = ({ budget }: Props) => {
  const { t }: Translation = useTranslation()
  const { transactionId } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [transaction, setTransaction] = useState<
    UnpersistedTransaction | Transaction
  >({ amount: 0, destinationAccountId: 0, sourceAccountId: 0 })

  const isPersisted =
    typeof transactionId !== 'undefined' && transactionId !== 'new'

  useEffect(() => {
    if (isPersisted) {
      getTransaction(transactionId, budget)
        .then(data => {
          setTransaction(data)
          setError('')
        })
        .catch(err => {
          setError(err.message)
        })
    }
  }, [budget, isPersisted, transactionId])

  const updateValue = (key: keyof Transaction, value: any) => {
    setTransaction({ ...transaction, [key]: value })
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()

        let result
        if ('id' in transaction) {
          result = updateTransaction(transaction)
        } else {
          result = createTransaction(transaction, budget)
        }

        result.then(() => navigate(-1)).catch(err => setError(err.message))
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
              <button type="button" className="btn-secondary font-bold">
                <LockClosedIcon className="icon inline mr-1" />
                {t('transactions.unlock')}
              </button>
              <small className="text-xs md:text-sm">
                {t('transactions.unlockBeforeEditing')}
              </small>
            </div>
          ) : null}

          <div className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
              <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    {t('transactions.note')}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="note"
                        id="note"
                        value={transaction.note || ''}
                        onChange={e => updateValue('note', e.target.value)}
                        className="flex-1 block w-full min-w-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    {t('transactions.amount')}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2 relative">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        value={transaction.amount || 0}
                        onChange={e =>
                          updateValue('amount', Number(e.target.value))
                        }
                        className="flex-1 block w-full min-w-0 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                          {budget.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    {t('transactions.date')}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="date"
                        id="date"
                        value={transaction.date || ''}
                        onChange={e => updateValue('date', e.target.value)}
                        className="flex-1 block w-full min-w-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="sourceAccountId"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    {t('transactions.sourceAccountId')}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="sourceAccountId"
                        id="sourceAccountId"
                        value={transaction.sourceAccountId || ''}
                        onChange={e =>
                          updateValue('sourceAccountId', Number(e.target.value))
                        }
                        className="flex-1 block w-full min-w-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="destinationAccountId"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    {t('transactions.destinationAccountId')}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="destinationAccountId"
                        id="destinationAccountId"
                        value={transaction.destinationAccountId || ''}
                        onChange={e =>
                          updateValue(
                            'destinationAccountId',
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 block w-full min-w-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="envelopeId"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    {t('transactions.envelopeId')}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="envelopeId"
                        id="envelopeId"
                        value={transaction.envelopeId || ''}
                        onChange={e =>
                          updateValue('envelopeId', Number(e.target.value))
                        }
                        className="flex-1 block w-full min-w-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isPersisted ? (
            <div className="pt-5">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('transactions.confirmDelete'))) {
                    deleteTransaction(transaction as Transaction)
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

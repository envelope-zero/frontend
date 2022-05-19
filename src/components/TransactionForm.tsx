import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getTransaction,
  deleteTransaction,
  updateTransaction,
  createTransaction,
} from '../lib/api/transactions'
import { dateFromIsoString, dateToIsoString } from '../lib/date-helper'
import {
  Budget,
  Translation,
  Transaction,
  UnpersistedTransaction,
} from '../types'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'
import { LockClosedIcon } from '@heroicons/react/solid'
import FormFields from './FormFields'
import FormField from './FormField'

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

        if (transaction.reconciled) {
          setError(t('transactions.unlockBeforeEditingError'))
          return
        }

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
              value={transaction.amount || 0}
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

            <FormField
              type="text"
              name="sourceAccountId"
              label={t('transactions.sourceAccountId')}
              value={transaction.sourceAccountId || ''}
              onChange={e =>
                updateValue('sourceAccountId', Number(e.target.value))
              }
              options={{ disabled: transaction.reconciled || false }}
            />

            <FormField
              type="text"
              name="destinationAccountId"
              label={t('transactions.destinationAccountId')}
              value={transaction.destinationAccountId || ''}
              onChange={e =>
                updateValue('destinationAccountId', Number(e.target.value))
              }
              options={{ disabled: transaction.reconciled || false }}
            />

            <FormField
              type="text"
              name="envelopeId"
              label={t('transactions.envelopeId')}
              value={transaction.envelopeId || ''}
              onChange={e => updateValue('envelopeId', Number(e.target.value))}
              options={{ disabled: transaction.reconciled || false }}
            />
          </FormFields>

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

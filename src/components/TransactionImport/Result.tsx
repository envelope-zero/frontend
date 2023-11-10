import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid'
import {
  Account,
  Budget,
  Transaction,
  TransactionPreview,
  Translation,
  GroupedEnvelopes,
  Category,
  Envelope,
  UnpersistedAccount,
} from '../../types'
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import FormFields from '../FormFields'
import FormField from '../FormField'
import InputCurrency from '../InputCurrency'
import {
  dateFromIsoString,
  dateToIsoString,
  monthYearFromDate,
  setToFirstOfTheMonth,
} from '../../lib/dates'
import { api } from '../../lib/api/base'
import { safeName } from '../../lib/name-helper'
import Error from '../Error'
import Autocomplete from '../Autocomplete'
import InfoBox from '../InfoBox'
import { isIncome } from '../../lib/transaction-helper'
import isSupported from '../../lib/is-supported'

type Props = {
  accounts: Account[]
  transactions: TransactionPreview[]
  budget: Budget
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  setNotification: (notification: string) => void
  targetAccountId: string
}

const categoryApi = api('categories')
const accountApi = api('accounts')
const transactionApi = api('transactions')

const Result = (props: Props) => {
  const { budget, isLoading, setIsLoading, targetAccountId } = props

  const { t }: Translation = useTranslation()
  const navigate = useNavigate()

  const [accounts, setAccounts] = useState(props.accounts)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [transactions, setTransactions] = useState([...props.transactions])
  const [groupedEnvelopes, setGroupedEnvelopes] = useState<GroupedEnvelopes>([])
  const [error, setError] = useState('')
  const [sourceAccountToCreate, setSourceAccountToCreate] =
    useState<UnpersistedAccount>()
  const [destinationAccountToCreate, setDestinationAccountToCreate] =
    useState<UnpersistedAccount>()

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
    }

    categoryApi
      .getAll(budget)
      .then((data: Category[]) =>
        setGroupedEnvelopes(
          data.map(category => ({
            title: safeName(category, 'category', t('categories.category')),
            items: category.envelopes,
          }))
        )
      )
      .catch(err => setError(err.message))
      .then(() => {
        if (isLoading) {
          setIsLoading(false)
        }
      })
  }, [budget]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const transactionPreview = transactions[currentIndex]
    const { transaction } = transactionPreview

    if (!accounts.some(account => account.id === transaction.sourceAccountId)) {
      setSourceAccountToCreate({
        name: transactionPreview.sourceAccountName || '',
      })
    } else {
      setSourceAccountToCreate(undefined)
    }

    if (
      !accounts.some(account => account.id === transaction.destinationAccountId)
    ) {
      setDestinationAccountToCreate({
        name: transactionPreview.destinationAccountName || '',
      })
    } else {
      setDestinationAccountToCreate(undefined)
    }
  }, [currentIndex, accounts, transactions])

  const accountGroups = useCallback(() => {
    return [
      {
        title: t('accounts.internalAccounts'),
        items: accounts.filter(account => !account.external),
      },
      {
        title: t('accounts.externalAccounts'),
        items: accounts.filter(account => account.external),
      },
    ]
  }, [accounts]) // eslint-disable-line react-hooks/exhaustive-deps

  const previousIndex = useCallback(() => {
    let prevIndex = currentIndex - 1
    while (transactions[prevIndex]?.processed) {
      prevIndex--
    }
    return prevIndex
  }, [currentIndex, transactions])

  const currentTransaction = useCallback(() => {
    return transactions[currentIndex].transaction
  }, [currentIndex, transactions])

  const nextIndex = useCallback(() => {
    let index = currentIndex + 1
    while (transactions[index]?.processed) {
      index++
    }
    return index
  }, [currentIndex, transactions])

  const updateValue = (name: keyof Transaction, value: any) => {
    const tmpTransactions = [...transactions]
    tmpTransactions[currentIndex].transaction = {
      ...transactions[currentIndex].transaction,
      [name]: value,
    }
    setTransactions(tmpTransactions)
  }

  const updatePreviewValue = (name: keyof TransactionPreview, value: any) => {
    const tmpTransactions = [...transactions]
    tmpTransactions[currentIndex] = {
      ...tmpTransactions[currentIndex],
      [name]: value,
    }
    setTransactions(tmpTransactions)
  }

  const createTransaction = async () => {
    const transaction = currentTransaction()
    let { sourceAccountId, destinationAccountId } = transaction
    const accountCreations = []
    if (sourceAccountToCreate) {
      accountCreations.push(
        accountApi
          .create({ ...sourceAccountToCreate, external: true }, budget)
          .then(createdAccount => {
            sourceAccountId = createdAccount.id
            return createdAccount
          })
      )
    }
    if (destinationAccountToCreate) {
      accountCreations.push(
        accountApi
          .create({ ...destinationAccountToCreate, external: true }, budget)
          .then(createdAccount => {
            destinationAccountId = createdAccount.id
            return createdAccount
          })
      )
    }

    return Promise.all(accountCreations).then(createdAccounts => {
      if (createdAccounts.length > 0) {
        setAccounts([...accounts, ...createdAccounts])
      }
      transactionApi.create(
        { ...transaction, sourceAccountId, destinationAccountId },
        budget
      )
    })
  }

  const goToNextTransaction = () => {
    if (nextIndex() <= transactions.length - 1) {
      setCurrentIndex(nextIndex())
    } else if (previousIndex() >= 0) {
      setCurrentIndex(previousIndex())
    } else {
      props.setNotification(t('transactions.import.complete'))
      navigate('/transactions')
    }
  }

  const clearError = () => {
    if (error) {
      setError('')
    }
  }

  const hidePrevButton = previousIndex() < 0
  const hideNextButton = nextIndex() > transactions.length - 1

  return (
    <>
      <div className="header">
        <h1>{t('budgets.import.import')}</h1>
        <div className="header--action">
          <Link to={-1 as any} className="header--action__secondary">
            {t('cancel')}
          </Link>
        </div>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          createTransaction()
            .then(() => {
              updatePreviewValue('processed', true)
              props.setNotification(t('transactions.import.importSuccess'))
              clearError()
              goToNextTransaction()
            })
            .catch(err => {
              setError(err.message)
            })
        }}
      >
        <div className="w-full full-centered">
          <button
            type="button"
            title={t('transactions.import.previous')}
            disabled={hidePrevButton}
            className={`icon mr-4 ${hidePrevButton ? 'opacity-20' : ''}`}
            onClick={() => {
              clearError()
              setCurrentIndex(previousIndex())
            }}
          >
            <ChevronLeftIcon />
          </button>
          <span>
            {t('indexOfLength', {
              index: currentIndex + 1,
              length: transactions.length,
            })}
          </span>
          <button
            type="button"
            title={t('transactions.import.next')}
            disabled={hideNextButton}
            className={`icon ml-4 ${hideNextButton ? 'opacity-20' : ''}`}
            onClick={() => {
              clearError()
              setCurrentIndex(nextIndex())
            }}
          >
            <ChevronRightIcon />
          </button>
        </div>

        <div className="mt-2">
          <Error error={error} />
        </div>

        {transactions[currentIndex].duplicateTransactionIds.length > 0 && (
          <InfoBox text={t('transactions.import.duplicateDetected')} />
        )}

        <FormFields>
          <FormField
            type="text"
            name="note"
            label={t('transactions.note')}
            value={currentTransaction().note || ''}
            onChange={e => updateValue('note', e.target.value)}
          />

          <FormField
            type="number"
            name="amount"
            label={t('transactions.amount')}
            value={currentTransaction().amount ?? ''}
            onChange={e => updateValue('amount', e.target.value)}
            options={{ step: 'any' }}
          >
            <InputCurrency currency={budget.currency} />
          </FormField>

          <Autocomplete<Account>
            groups={accountGroups()}
            allowNewCreation={true}
            itemLabel={account => safeName(account, 'account')}
            itemId={account => account.id || safeName(account, 'account')}
            label={t('transactions.sourceAccountId')}
            onChange={account => {
              if (!account.id) {
                setSourceAccountToCreate(account)
                updateValue('sourceAccountId', undefined)
                updatePreviewValue('sourceAccountName', account.name || '')
              } else {
                setSourceAccountToCreate(undefined)
                updateValue('sourceAccountId', account.id)
              }
            }}
            value={
              (accounts.find(
                account => account.id === currentTransaction().sourceAccountId
              ) as Account) ||
              sourceAccountToCreate ||
              ''
            }
            disabled={currentTransaction().sourceAccountId === targetAccountId}
          />

          <Autocomplete<Account>
            groups={accountGroups()}
            allowNewCreation={true}
            itemLabel={account => safeName(account, 'account')}
            itemId={account => account.id || safeName(account, 'account')}
            label={t('transactions.destinationAccountId')}
            onChange={account => {
              if (!account.id) {
                setDestinationAccountToCreate(account)
                updateValue('destinationAccountId', undefined)
                updatePreviewValue('destinationAccountName', account.name || '')
              } else {
                setDestinationAccountToCreate(undefined)
                updateValue('destinationAccountId', account.id)
              }
            }}
            value={
              (accounts.find(
                account =>
                  account.id === currentTransaction().destinationAccountId
              ) as Account) ||
              destinationAccountToCreate ||
              ''
            }
            disabled={
              currentTransaction().destinationAccountId === targetAccountId
            }
          />

          <Autocomplete<Envelope>
            groups={groupedEnvelopes}
            allowNewCreation={false}
            emptyOption={t('envelopes.none')}
            value={
              (groupedEnvelopes
                .flatMap(group => group.items)
                .find(
                  envelope => envelope.id === currentTransaction().envelopeId
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
          />

          <FormField
            type="date"
            name="date"
            label={t('transactions.date')}
            value={dateFromIsoString(
              currentTransaction().date || new Date().toISOString()
            )}
            onChange={e => {
              // value is empty string for invalid dates (e.g. when prefixing month with 0 while typing) – we want to ignore that and keep the previous input
              if (e.target.value) {
                updateValue('date', dateToIsoString(e.target.value))
              }
            }}
          />

          {isIncome(currentTransaction(), accounts) ? (
            <FormField
              type={isSupported.inputTypeMonth() ? 'month' : 'date'}
              name="availableFrom"
              label={t('transactions.availableFrom')}
              note={`(${t('transactions.onlyRelevantForIncome')})`}
              tooltip={t('transactions.availableFromExplanation')}
              value={(isSupported.inputTypeMonth()
                ? (date: string) => monthYearFromDate(new Date(date))
                : (date: string) =>
                    setToFirstOfTheMonth(dateFromIsoString(date)))(
                currentTransaction().availableFrom ||
                  currentTransaction().date ||
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
            />
          ) : null}
        </FormFields>

        <div className="pt-6 gap-4 grid grid-cols-2">
          <button
            type="button"
            onClick={() => {
              updatePreviewValue('processed', true) // TODO: this might be problematic as soon as we introduce "import all" – we'll need to make sure these transactions are ignored
              props.setNotification(t('transactions.import.deleteSuccess'))
              clearError()
              goToNextTransaction()
            }}
            className="btn-secondary col-span-1 full-centered"
          >
            <TrashIcon className="icon-red icon-sm mr-1 relative bottom-0.5" />
            {t('delete')}
          </button>
          <button
            type="submit"
            className="btn-secondary link-blue col-span-1 full-centered"
          >
            <CheckCircleIcon className="icon-sm mr-1" />
            {t('import')}
          </button>
        </div>
      </form>
    </>
  )
}

export default Result

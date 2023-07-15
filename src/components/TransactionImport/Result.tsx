import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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
import { dateFromIsoString, dateToIsoString } from '../../lib/dates'
import { api } from '../../lib/api/base'
import { safeName } from '../../lib/name-helper'
import Error from '../Error'
import Autocomplete from '../Autocomplete'

type Props = {
  accounts: Account[]
  transactions: TransactionPreview[]
  budget: Budget
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  targetAccountId: string
}

const categoryApi = api('categories')

const Result = ({
  accounts,
  transactions,
  budget,
  isLoading,
  setIsLoading,
  targetAccountId,
}: Props) => {
  const { t }: Translation = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [groupedEnvelopes, setGroupedEnvelopes] = useState<GroupedEnvelopes>([])
  const [error, setError] = useState('')
  const [sourceAccountToCreate, setSourceAccountToCreate] =
    useState<UnpersistedAccount>()
  const [destinationAccountToCreate, setDestinationAccountToCreate] =
    useState<UnpersistedAccount>()

  const hidePrevButton = currentIndex <= 0
  const hideNextButton = currentIndex >= transactions.length - 1

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

  const currentTransaction = useCallback(() => {
    return transactions[currentIndex].transaction
  }, [currentIndex, transactions])

  const updateValue = (name: keyof Transaction, value: any) => {
    console.log(`let's pretend ${name} is ${value} now`)
  }

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

      <div className="w-full full-centered">
        <button
          type="button"
          title={t('transactions.import.previous')}
          disabled={hidePrevButton}
          className={`icon mr-4 ${hidePrevButton ? 'opacity-20' : ''}`}
          onClick={() => {
            setCurrentIndex(currentIndex - 1)
          }}
        >
          <ChevronLeftIcon />
        </button>
        {t('indexOfLength', {
          index: currentIndex + 1,
          length: transactions.length,
        })}
        <button
          type="button"
          title={t('transactions.import.next')}
          disabled={hideNextButton}
          className={`icon ml-4 ${hideNextButton ? 'opacity-20' : ''}`}
          onClick={() => {
            setCurrentIndex(currentIndex + 1)
          }}
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="mt-2">
        <Error error={error} />
      </div>

      {/* TODO: handle duplicates */}

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
      </FormFields>

      <div className="pt-6 gap-4 grid grid-cols-2">
        <button
          type="button"
          onClick={() => {
            // TODO
          }}
          className="btn-secondary col-span-1 full-centered"
        >
          <TrashIcon className="icon-red icon-sm mr-1 relative bottom-0.5" />
          {t('delete')}
        </button>
        <button
          type="button"
          onClick={() => {
            // TODO
            // notes:
            // remember sourceAccountToCreate & destinationAccountToCreate
            // make sure numbers in header stay the same but this transaction is skipped on navigation
          }}
          className="btn-secondary link-blue col-span-1 full-centered"
        >
          <CheckCircleIcon className="icon-sm mr-1" />
          {t('import')}
        </button>
      </div>
    </>
  )
}

export default Result

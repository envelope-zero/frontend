import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dateFromIsoString, dateToIsoString } from '../lib/dates'
import { safeName } from '../lib/name-helper'
import {
  Account,
  Budget,
  Envelope,
  GroupedEnvelopes,
  Translation,
} from '../types'
import Autocomplete from './Autocomplete'
import InputCurrency from './InputCurrency'

type Props = {
  budget: Budget
  accounts: Account[]
  groupedEnvelopes: GroupedEnvelopes
  searchParams: URLSearchParams
  onSubmit: (searchParams: URLSearchParams) => void
  hideFilters: () => void
}

const TransactionFilters = ({
  searchParams,
  onSubmit,
  hideFilters,
  budget,
  accounts,
  groupedEnvelopes,
}: Props) => {
  const { t }: Translation = useTranslation()
  const [filters, setFilters] = useState(Object.fromEntries(searchParams))

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

  const updateValue = (name: string, value?: string) => {
    if (typeof value === 'undefined' || value.trim() === '') {
      delete filters[name]
      setFilters({ ...filters })
    } else {
      setFilters({ ...filters, [name]: value })
    }
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSubmit(new URLSearchParams(filters))
        hideFilters()
      }}
      onReset={hideFilters}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="col-span-1">
          <label
            htmlFor="amountMoreOrEqual"
            className="form-field--label sm:mt-0 sm:pt-0"
          >
            {t('transactions.filters.amountMoreOrEqual')}
          </label>
          <div className="mt-1 input--inner">
            <input
              type="number"
              name="amountMoreOrEqual"
              id="amountMoreOrEqual"
              className="input"
              value={filters.amountMoreOrEqual || ''}
              onChange={e => updateValue('amountMoreOrEqual', e.target.value)}
            />
            <InputCurrency currency={budget.currency} />
          </div>
        </div>

        <div className="col-span-1">
          <label
            htmlFor="amountLessOrEqual"
            className="form-field--label sm:mt-0 sm:pt-0"
          >
            {t('transactions.filters.amountLessOrEqual')}
          </label>
          <div className="mt-1 input--inner">
            <input
              type="number"
              name="amountLessOrEqual"
              id="amountLessOrEqual"
              className="input"
              value={filters.amountLessOrEqual || ''}
              onChange={e => updateValue('amountLessOrEqual', e.target.value)}
            />
            <InputCurrency currency={budget.currency} />
          </div>
        </div>

        <div className="col-span-1">
          <Autocomplete<Account>
            emptyOption={t('showAll')}
            groups={accountGroups}
            itemLabel={account => safeName(account, 'account')}
            itemId={account => account.id}
            label={t('transactions.filters.account')}
            onChange={account => updateValue('account', account?.id)}
            value={
              (accounts.find(
                account => account.id === filters.account
              ) as Account) || null
            }
            wrapperClass=""
            labelClass="form-field--label sm:mt-0 sm:pt-0"
            inputWrapperClass="mt-1 input--outer"
          />
        </div>

        <div className="col-span-1">
          <Autocomplete<Envelope>
            emptyOption={t('showAll')}
            groups={groupedEnvelopes}
            itemLabel={envelope => safeName(envelope, 'envelope')}
            itemId={envelope => envelope?.id}
            label={t('transactions.filters.envelope')}
            onChange={envelope => updateValue('envelope', envelope?.id)}
            value={
              (groupedEnvelopes
                .flatMap(group => group.items)
                .find(
                  envelope => envelope.id === filters.envelope
                ) as Envelope) || null
            }
            wrapperClass=""
            labelClass="form-field--label sm:mt-0 sm:pt-0"
            inputWrapperClass="mt-1 input--outer"
          />
        </div>

        <div className="col-span-1">
          <label
            htmlFor="fromDate"
            className="form-field--label sm:mt-0 sm:pt-0"
          >
            {t('transactions.filters.fromDate')}
          </label>
          <div className="mt-1 input--inner">
            <input
              type="date"
              name="fromDate"
              id="fromDate"
              className="input"
              value={dateFromIsoString(filters.fromDate || '')}
              onChange={e =>
                updateValue('fromDate', dateToIsoString(e.target.value))
              }
            />
          </div>
        </div>

        <div className="col-span-1">
          <label
            htmlFor="untilDate"
            className="form-field--label sm:mt-0 sm:pt-0"
          >
            {t('transactions.filters.untilDate')}
          </label>
          <div className="mt-1 input--inner">
            <input
              type="date"
              name="untilDate"
              id="untilDate"
              className="input"
              value={dateFromIsoString(filters.untilDate || '')}
              onChange={e =>
                updateValue('untilDate', dateToIsoString(e.target.value))
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <button type="reset" className="btn-secondary sm:w-auto drop-shadow-sm">
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="btn-secondary link-blue sm:w-auto drop-shadow-sm"
        >
          {t('submit')}
        </button>
      </div>
    </form>
  )
}

export default TransactionFilters

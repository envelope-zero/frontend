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
import FormField from './FormField'

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
      className="card"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <FormField
          type="number"
          name="amountMoreOrEqual"
          label={t('transactions.filters.amountMoreOrEqual')}
          value={filters.amountMoreOrEqual || ''}
          onChange={e => updateValue('amountMoreOrEqual', e.target.value)}
        >
          <InputCurrency currency={budget.currency} />
        </FormField>

        <FormField
          type="number"
          name="amountLessOrEqual"
          label={t('transactions.filters.amountLessOrEqual')}
          value={filters.amountLessOrEqual || ''}
          onChange={e => updateValue('amountLessOrEqual', e.target.value)}
        >
          <InputCurrency currency={budget.currency} />
        </FormField>

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
        />

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
        />

        <FormField
          type="date"
          name="fromDate"
          label={t('transactions.filters.fromDate')}
          value={dateFromIsoString(filters.fromDate || '')}
          onChange={e =>
            updateValue('fromDate', dateToIsoString(e.target.value))
          }
        />

        <FormField
          type="date"
          name="untilDate"
          label={t('transactions.filters.untilDate')}
          value={dateFromIsoString(filters.untilDate || '')}
          onChange={e =>
            updateValue('untilDate', dateToIsoString(e.target.value))
          }
        />
      </div>

      <div className="button-group mt-4 gap-2">
        <button type="submit" className="btn-primary">
          {t('submit')}
        </button>
        <button type="reset" className="btn-secondary">
          {t('cancel')}
        </button>
      </div>
    </form>
  )
}

export default TransactionFilters

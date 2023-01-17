import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  BanknotesIcon,
  EnvelopeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import {
  Budget,
  Translation,
  Transaction,
  Account,
  FilterOptions,
  GroupedTransactions as GroupedTransactionsType,
  GroupedEnvelopes,
  Category,
} from '../types'
import { formatDate, formatMoney } from '../lib/format'
import { groupBy } from '../lib/array'
import { api } from '../lib/api/base'
import LoadingSpinner from './LoadingSpinner'
import GroupedTransactions from './GroupedTransactions'
import SearchBar from './SearchBar'
import { FunnelIcon } from '@heroicons/react/24/solid'
import TransactionFilters from './TransactionFilters'
import { safeName } from '../lib/name-helper'
import { XMarkIcon } from '@heroicons/react/20/solid'

const transactionApi = api('transactions')
const categoryApi = api('categories')

type Props = {
  budget: Budget
  accounts: Account[]
}

const egg = `
  <span class="trans">
    <span>T</span>
    <span>r</span>
    <span>a</span>
    <span>n</span>
    <span>s</span>
  </span>
`

const TransactionsList = ({ budget, accounts }: Props) => {
  const { t }: Translation = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [groupedEnvelopes, setGroupedEnvelopes] = useState<GroupedEnvelopes>([])
  const [groupedTransactions, setGroupedTransactions] =
    useState<GroupedTransactionsType>({})

  const activeFilters: FilterOptions = {
    account: searchParams.get('account') || undefined,
    envelope: searchParams.get('envelope') || undefined,
    amountMoreOrEqual: searchParams.get('amountMoreOrEqual') || undefined,
    amountLessOrEqual: searchParams.get('amountLessOrEqual') || undefined,
    fromDate: searchParams.get('fromDate') || undefined,
    untilDate: searchParams.get('untilDate') || undefined,
    note: searchParams.get('search') || undefined,
  }

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
    }

    Promise.all([
      transactionApi.getAll(budget, activeFilters),
      categoryApi.getAll(budget),
    ]).then(([transactions, categories]: [Transaction[], Category[]]) => {
      setGroupedTransactions(
        groupBy(transactions, ({ date }: Transaction) => formatDate(date))
      )
      setGroupedEnvelopes(
        categories.map(category => ({
          title: safeName(category, 'category', t('categories.category')),
          items: category.envelopes,
        }))
      )
      setIsLoading(false)
    })
  }, [budget, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayValue = (
    filter: keyof FilterOptions,
    value: string | boolean
  ) => {
    switch (filter) {
      case 'amountMoreOrEqual':
        return `≥ ${formatMoney(value as string, budget.currency, {
          signDisplay: 'never',
        })}`
      case 'amountLessOrEqual':
        return `≤ ${formatMoney(value as string, budget.currency, {
          signDisplay: 'never',
        })}`
      case 'account':
        return (
          <>
            <BanknotesIcon className="icon-red icon-sm inline mr-1" />
            {safeName(
              accounts.find(account => account.id === value),
              'account'
            )}
          </>
        )
      case 'envelope':
        const envelopes = groupedEnvelopes.reduce(
          (array: any, group: { items: any[] }) => [...array, ...group.items],
          []
        )

        return (
          <>
            <EnvelopeIcon className="icon-red icon-sm inline mr-1" />
            {safeName(
              envelopes.find(envelope => envelope.id === value),
              'envelope'
            )}
          </>
        )
      case 'fromDate':
        return `${t('from')} ${formatDate(value as string)}`
      case 'untilDate':
        return `${t('until')} ${formatDate(value as string)}`
      default:
        return value
    }
  }

  const heading = t('transactions.transactions')

  return (
    <>
      <div className="header">
        <h1>
          {heading.includes('Trans') ? (
            <span
              dangerouslySetInnerHTML={{
                __html: heading.replace('Trans', egg),
              }}
            ></span>
          ) : (
            heading
          )}
        </h1>
        <div className="header--action full-centered">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            title={t('filterResource', {
              resource: t('transactions.transactions'),
            })}
          >
            <FunnelIcon className="icon-red icon-sm" />
          </button>
          <Link to="/transactions/new" title={t('transactions.create')}>
            <PlusIcon className="icon-red" />
          </Link>
        </div>
      </div>

      {showFilters ? (
        <div className="mb-6">
          <TransactionFilters
            budget={budget}
            accounts={accounts}
            groupedEnvelopes={groupedEnvelopes}
            searchParams={searchParams}
            hideFilters={() => {
              setShowFilters(false)
            }}
            onSubmit={searchParams => {
              setSearchParams(searchParams)
            }}
          ></TransactionFilters>
        </div>
      ) : null}

      <SearchBar
        resourceLabel={t('transactions.transactions')}
        value={searchParams.get('search')}
        onSubmit={search => {
          searchParams.set('search', search)
          setSearchParams(searchParams)
        }}
      />

      {Object.values(activeFilters).some(value => !!value) ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {Object.keys(activeFilters).map(filter => {
            const value = activeFilters[filter as keyof FilterOptions]
            if (filter === 'note' || typeof value === 'undefined') {
              return null
            }

            const label = displayValue(filter as keyof FilterOptions, value)

            return (
              <button
                key={filter}
                className="rounded-full full-centered border border-red-800 bg-white px-2.5 py-1.5 text-sm font-medium text-red-800 hover:text-red-900 max-w-full truncate group"
                type="button"
                onClick={() => {
                  searchParams.delete(filter)
                  setSearchParams(searchParams)
                }}
                title={t('filters.removeFilter', {
                  filter: t(`transactions.filters.${filter}`),
                })}
              >
                {label}
                <XMarkIcon className="icon-sm ml-1 inline" />
              </button>
            )
          })}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSpinner />
      ) : Object.keys(groupedTransactions).length ? (
        <div className="bg-white sm:shadow overflow-hidden sm:rounded-md">
          <GroupedTransactions
            budget={budget}
            accounts={accounts}
            transactions={groupedTransactions}
          />
        </div>
      ) : (
        t('transactions.emptyList')
      )}
    </>
  )
}

export default TransactionsList

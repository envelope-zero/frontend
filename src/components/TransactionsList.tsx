import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  BanknotesIcon,
  DocumentArrowUpIcon,
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
import InfiniteScroll from './InfiniteScroll'

const transactionApi = api('transactions')
const categoryApi = api('categories')
const accountApi = api('accounts')

type Props = {
  budget: Budget
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

const batchSize = 50

const TransactionsList = ({ budget }: Props) => {
  const { t }: Translation = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
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
      loadTransactionBatch(0),
      categoryApi.getAll(budget).then((categories: Category[]) =>
        setGroupedEnvelopes(
          categories.map(category => ({
            title: safeName(category, 'category', t('categories.category')),
            items: category.envelopes,
          }))
        )
      ),
      accountApi.getAll(budget).then(setAccounts),
    ]).then(() => {
      setIsLoading(false)
    })
  }, [budget, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransactionBatch = (
    offset: number,
    appendTransactions: boolean = false
  ) => {
    return transactionApi
      .getBatch(budget, offset, batchSize, activeFilters)
      .then(transactions => {
        const allTransactions = appendTransactions
          ? [
              ...transactions,
              ...Object.values(groupedTransactions).flat(),
            ].sort((a: Transaction, b: Transaction) => {
              return Date.parse(b.date) - Date.parse(a.date)
            })
          : transactions
        setGroupedTransactions(
          groupBy(allTransactions, ({ date }: Transaction) => formatDate(date))
        )
        return transactions
      })
  }

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
            <BanknotesIcon className="icon-red icon-sm mr-1 inline" />
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
            <EnvelopeIcon className="icon-red icon-sm mr-1 inline" />
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
          <Link
            to="/transactions/import"
            title={t('transactions.import.importTransactions')}
          >
            <DocumentArrowUpIcon className="icon-red" />
          </Link>
          <Link to="/transactions/new" title={t('transactions.create')}>
            <PlusIcon className="icon-red" />
          </Link>
        </div>
      </div>

      <SearchBar
        resourceLabel={t('transactions.transactions')}
        value={searchParams.get('search')}
        onSubmit={search => {
          if (search) {
            searchParams.set('search', search)
            setSearchParams(searchParams)
          } else {
            searchParams.delete('search')
            setSearchParams(searchParams)
          }
        }}
      />

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {Object.values(activeFilters).some(
          value => typeof value !== 'undefined'
        ) ? (
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            title={t('filterResource', {
              resource: t('transactions.transactions'),
            })}
          >
            <FunnelIcon className="icon-red icon-sm" />
          </button>
        ) : (
          <button
            type="button"
            className="full-centered rounded-full  bg-red-800 px-2.5 py-1.5 text-sm text-gray-100"
            onClick={() => setShowFilters(!showFilters)}
            title={t('filterResource', {
              resource: t('transactions.transactions'),
            })}
          >
            <FunnelIcon className="icon-sm mr-1 inline" />
            {t('filterResource', {
              resource: t('transactions.transactions'),
            })}
          </button>
        )}

        {Object.keys(activeFilters).map(filter => {
          const value = activeFilters[filter as keyof FilterOptions]
          if (filter === 'note' || typeof value === 'undefined') {
            return null
          }

          const label = displayValue(filter as keyof FilterOptions, value)

          return (
            <button
              key={filter}
              className="full-centered group max-w-full truncate rounded-full border border-red-800 bg-white px-2.5 py-1.5 text-sm font-medium text-red-800 hover:text-red-900 dark:border-red-600 dark:bg-slate-800 dark:text-red-600"
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
            onSubmit={updatedSearchParams => {
              // prevent filters from updating search
              const search = searchParams.get('search')
              if (search) {
                updatedSearchParams.set('search', search)
              } else {
                updatedSearchParams.delete('search')
              }
              setSearchParams(updatedSearchParams)
            }}
          ></TransactionFilters>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSpinner />
      ) : Object.keys(groupedTransactions).length ? (
        <div className="card p-0">
          <InfiniteScroll
            batchSize={batchSize}
            onLoadMore={offset => {
              setIsLoadingMore(true)
              return loadTransactionBatch(offset, true).then(
                (transactions: Transaction[]) => {
                  setIsLoadingMore(false)
                  return transactions.length > 0
                }
              )
            }}
          >
            <GroupedTransactions
              budget={budget}
              accounts={accounts}
              transactions={groupedTransactions}
            />
            {isLoadingMore && <LoadingSpinner />}
          </InfiniteScroll>
        </div>
      ) : (
        t('transactions.emptyList')
      )}
    </>
  )
}

export default TransactionsList

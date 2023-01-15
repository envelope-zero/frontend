import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import {
  Budget,
  Translation,
  Transaction,
  Account,
  FilterOptions,
  GroupedTransactions as GroupedTransactionsType,
} from '../types'
import { formatDate } from '../lib/format'
import { groupBy } from '../lib/array'
import { api } from '../lib/api/base'
import LoadingSpinner from './LoadingSpinner'
import GroupedTransactions from './GroupedTransactions'
import SearchBar from './SearchBar'

const transactionApi = api('transactions')

type Props = {
  budget: Budget
  accounts: Account[]
}

const TransactionsList = ({ budget, accounts }: Props) => {
  const { t }: Translation = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [groupedTransactions, setGroupedTransactions] =
    useState<GroupedTransactionsType>({})

  useEffect(() => {
    const filterOptions: FilterOptions = {
      account: searchParams.get('account') || undefined,
      envelope: searchParams.get('envelope') || undefined,
      note: searchParams.get('search') || undefined,
    }

    if (!isLoading) {
      setIsLoading(true)
    }

    transactionApi.getAll(budget, filterOptions).then(transactions => {
      setGroupedTransactions(
        groupBy(transactions, ({ date }: Transaction) => formatDate(date))
      )
      setIsLoading(false)
    })
  }, [budget, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="header">
        <h1>{t('transactions.transactions')}</h1>
        <div className="header--action">
          {/* TODO: <FilterIcon className="icon-red" /> */}
          <Link to="/transactions/new" title={t('transactions.create')}>
            <PlusIcon className="icon-red" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : Object.keys(groupedTransactions).length ? (
        <>
          <SearchBar
            resourceLabel={t('transactions.transactions')}
            value={searchParams.get('search')}
            onSubmit={search => {
              searchParams.set('search', search)
              setSearchParams(searchParams)
            }}
          />
          <div className="bg-white sm:shadow overflow-hidden sm:rounded-md">
            <GroupedTransactions
              budget={budget}
              accounts={accounts}
              transactions={groupedTransactions}
            />
          </div>
        </>
      ) : (
        t('transactions.emptyList')
      )}
    </>
  )
}

export default TransactionsList

import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import {
  ApiObject,
  Translation,
  Transaction,
  Budget,
  Account,
  GroupedTransactions as GroupedTransactionsType,
} from '../types'
import Error from './Error'
import { api } from '../lib/api/base'
import { formatDate } from '../lib/format'
import { groupBy } from '../lib/array'
import GroupedTransactions from './GroupedTransactions'

const transactionApi = api('transactions')

type Props = {
  parent: ApiObject
  budget: Budget
  accounts: Account[]
  povFromAccount?: boolean
}

const LatestTransactions = ({
  parent,
  budget,
  accounts,
  povFromAccount,
}: Props) => {
  const { t }: Translation = useTranslation()

  const [error, setError] = useState('')
  const [groupedTransactions, setGroupedTransactions] =
    useState<GroupedTransactionsType>({})

  useEffect(() => {
    transactionApi
      .getAll(parent)
      .then(transactionData => {
        setGroupedTransactions(
          groupBy(transactionData, ({ date }: Transaction) => formatDate(date))
        )
        setError('')
      })
      .catch(err => {
        setError(err.message)
      })
  }, [parent])

  return (
    <>
      <Error error={error} />
      {Object.values(groupedTransactions).some(group => group.length > 0) ? (
        <GroupedTransactions
          budget={budget}
          transactions={groupedTransactions}
          accounts={accounts}
          parent={parent}
          povFromAccount={povFromAccount}
        />
      ) : (
        t('transactions.emptyList')
      )}
    </>
  )
}

export default LatestTransactions

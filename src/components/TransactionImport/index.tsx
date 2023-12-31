import { useEffect, useState } from 'react'
import { Account, Budget, TransactionPreview } from '../../types'
import Form from './Form'
import Result from './Result'
import { api } from '../../lib/api/base'
import LoadingSpinner from '../LoadingSpinner'

type Props = {
  budget: Budget
  setNotification: (notification: string) => void
}

const accountApi = api('accounts')

const TransactionImport = ({ budget, setNotification }: Props) => {
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<TransactionPreview[]>(
    JSON.parse(localStorage.getItem('importTransactions') || '[]')
  )
  const [targetAccountId, setTargetAccountId] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [possibleTargetAccounts, setPossibleTargetAccounts] = useState<
    Account[]
  >([])

  useEffect(() => {
    isLoading || setIsLoading(true)
    accountApi.getAll(budget).then((allAccounts: Account[]) => {
      setAccounts(allAccounts)
      setPossibleTargetAccounts(
        allAccounts.filter(account => !account.external && !account.archived)
      )
      setIsLoading(false)
    })
  }, [budget])

  if (isLoading) {
    return <LoadingSpinner />
  } else if (result.length === 0) {
    return (
      <Form
        accounts={possibleTargetAccounts}
        setResult={(newResult, targetAccountId) => {
          setResult(newResult)
          setTargetAccountId(targetAccountId)
        }}
      />
    )
  } else {
    return (
      <Result
        accounts={accounts}
        transactions={result}
        budget={budget}
        targetAccountId={targetAccountId}
        setNotification={setNotification}
      />
    )
  }
}

export default TransactionImport

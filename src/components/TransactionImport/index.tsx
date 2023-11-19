import { useEffect, useState } from 'react'
import { Account, Budget, TransactionPreview } from '../../types'
import Form from './Form'
import Result from './Result'
import { api } from '../../lib/api/base'

type Props = {
  budget: Budget
  setNotification: (notification: string) => void
}

const accountApi = api('accounts')

const TransactionImport = ({ budget, setNotification }: Props) => {
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<TransactionPreview[] | undefined>()
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
        allAccounts.filter(account => !account.external && !account.hidden)
      )
      setIsLoading(false)
    })
  }, [budget])

  if (typeof result === 'undefined') {
    return (
      <Form
        accounts={possibleTargetAccounts}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
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
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        targetAccountId={targetAccountId}
        setNotification={setNotification}
      />
    )
  }
}

export default TransactionImport

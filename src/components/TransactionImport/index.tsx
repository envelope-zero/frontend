import { useState } from 'react'
import { Account, Budget, TransactionPreview } from '../../types'
import Form from './Form'
import Result from './Result'

type Props = {
  accounts: Account[]
  budget: Budget
  setNotification: (notification: string) => void
}

const TransactionImport = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TransactionPreview[] | undefined>()
  const [targetAccountId, setTargetAccountId] = useState('')

  const possibleTargetAccounts = props.accounts.filter(
    account => !account.external && !account.hidden
  )

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
        accounts={props.accounts}
        transactions={result}
        budget={props.budget}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        targetAccountId={targetAccountId}
        setNotification={props.setNotification}
      />
    )
  }
}

export default TransactionImport

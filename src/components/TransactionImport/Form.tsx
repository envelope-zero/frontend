import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Account, TransactionPreview, Translation } from '../../types'
import { checkStatus, parseJSON } from '../../lib/fetch-helper'
import Error from '../Error'
import FormFields from '../FormFields'
import FormField from '../FormField'
import Autocomplete from '../Autocomplete'
import LoadingSpinner from '../LoadingSpinner'
import { safeName } from '../../lib/name-helper'

type Props = {
  accounts: Account[]
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  setResult: (result: TransactionPreview[], targetAccountId: string) => void
}

const Form = ({ accounts, isLoading, setIsLoading, setResult }: Props) => {
  const { t }: Translation = useTranslation()
  const [error, setError] = useState('')
  const [accountId, setAccountId] = useState('')

  return (
    <form
      encType="multipart/form-data"
      onSubmit={event => {
        event.preventDefault()

        setIsLoading(true)

        fetch(`/api/v1/import/ynab-import-preview?accountId=${accountId}`, {
          method: 'POST',
          body: new FormData(event.target as HTMLFormElement),
        })
          .then(checkStatus)
          .then(parseJSON)
          .then(body => {
            setIsLoading(false)
            if (error) {
              setError('')
            }
            setResult(body.data, accountId)
          })
          .catch(error => {
            setIsLoading(false)
            setError(error.message)
          })
      }}
    >
      <div className="header">
        <h1>{t('budgets.import.import')}</h1>
        <div className="header--action">
          <Link to={-1 as any} className="header--action__secondary">
            {t('cancel')}
          </Link>
          <button type="submit">{t('submit')}</button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Error error={error} />
          <p className="pt-4 whitespace-pre-line dark:text-gray-400">
            {t('transactions.import.description')}
          </p>
          <h2 className="mt-4">{t('transactions.import.howTo.title')}</h2>
          <ol className="list-decimal ml-4 pt-4 whitespace-pre-line dark:text-gray-400">
            {['download', 'parse', 'upload'].map(step => (
              <li
                key={step}
                dangerouslySetInnerHTML={{
                  __html: t(`transactions.import.howTo.${step}`),
                }}
              />
            ))}
          </ol>
          <FormFields>
            <Autocomplete<Account>
              groups={[{ items: accounts }]}
              allowNewCreation={false}
              itemLabel={account => safeName(account, 'account')}
              itemId={account => account.id}
              label={t('transactions.import.account')}
              onChange={account => {
                setAccountId(account.id)
              }}
              value={
                (accounts.find(
                  account => account.id === accountId
                ) as Account) || ''
              }
            />

            <FormField
              type="file"
              name="file"
              label={t('budgets.import.file')}
              options={{ required: true }}
            ></FormField>
          </FormFields>
        </>
      )}
    </form>
  )
}

export default Form

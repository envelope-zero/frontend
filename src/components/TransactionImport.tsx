import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Account, Translation } from '../types'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import { checkStatus, parseJSON } from '../lib/fetch-helper'
import LoadingSpinner from './LoadingSpinner'
import Autocomplete from './Autocomplete'
import { safeName } from '../lib/name-helper'

type Props = { accounts: Account[] }

const TransactionImport = (props: Props) => {
  const { t }: Translation = useTranslation()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [accountId, setAccountId] = useState('')

  const accounts = props.accounts.filter(
    account => !account.external && !account.hidden
  )

  return (
    <form
      encType="multipart/form-data"
      onSubmit={event => {
        event.preventDefault()

        setIsLoading(true)

        // TODO: parse through ynap (https://www.npmjs.com/package/ynap-parsers)

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
            console.log(body)
            // TODO
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
          <p
            className="pt-4 whitespace-pre-line dark:text-gray-400"
            dangerouslySetInnerHTML={{
              __html: t('transactions.import.ynapCredits'),
            }}
          ></p>
        </>
      )}
    </form>
  )
}

export default TransactionImport

import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Account, TransactionPreview, Translation } from '../../types'
import { parseFile } from '@envelope-zero/ynap-parsers'
import { checkStatus, parseJSON } from '../../lib/fetch-helper'
import Error from '../Error'
import FormFields from '../FormFields'
import FormField from '../FormField'
import Autocomplete from '../Autocomplete'
import LoadingSpinner from '../LoadingSpinner'
import { safeName } from '../../lib/name-helper'

type Props = {
  accounts: Account[]
  setResult: (result: TransactionPreview[], targetAccountId: string) => void
}

const Form = ({ accounts, setResult }: Props) => {
  const { t }: Translation = useTranslation()
  const [error, setError] = useState('')
  const [accountId, setAccountId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <form
      encType="multipart/form-data"
      onSubmit={event => {
        event.preventDefault()

        setIsLoading(true)
        const file = (event.target as any).file.files[0] // TODO: without `any`

        parseFile(file)
          .then(result => {
            // Get the data and transform it to FormData for the backend
            const data = new FormData()
            data.append(
              'file',
              new File([new Blob([result[0]?.data])], 'ynap-transactions.csv', {
                type: 'text/csv;charset=utf-8;',
              })
            )

            // Send the parsed file to the backend for processing
            fetch(`/api/v4/import/ynab-import-preview?accountId=${accountId}`, {
              method: 'POST',
              body: data,
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
          })
          .catch(error => {
            setIsLoading(false)

            // Set the appropriate error message
            if (
              error.message === 'This file has already been converted by YNAP.'
            ) {
              setError(t('transactions.import.alreadyConverted'))
            } else if (
              error.message === 'No parser is available for this file.'
            ) {
              setError(t('transactions.import.noParser'))
            } else {
              setError(error.message)
            }
          })
      }}
    >
      <div className="header">
        <h1>{t('budgets.import.import')}</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Error error={error} />
          <div className="card overflow-visible md:mt-4">
            <p
              className="mb-4 whitespace-pre-line dark:text-gray-400"
              dangerouslySetInnerHTML={{
                __html: t('transactions.import.description'),
              }}
            ></p>
            <FormFields className="grid-cols-2 space-y-6 gap-x-4 md:grid md:space-y-0 md:gap-y-6">
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
            <div className="button-group mt-10">
              <button type="submit" className="btn-primary">
                {t('submit')}
              </button>
              <Link to={-1 as any} className="btn-secondary">
                {t('cancel')}
              </Link>
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default Form

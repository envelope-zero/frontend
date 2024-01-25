import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Budget, Translation } from '../types'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import { checkStatus, parseJSON } from '../lib/fetch-helper'
import LoadingSpinner from './LoadingSpinner'

type Props = { selectBudget: (budget?: Budget) => void }

const BudgetImport = (props: Props) => {
  const { t }: Translation = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [budgetName, setBudgetName] = useState(
    t('budgets.import.importedBudget')
  )

  return (
    <form
      encType="multipart/form-data"
      onSubmit={event => {
        event.preventDefault()

        setIsLoading(true)
        fetch(`/api/v3/import/ynab4?budgetName=${budgetName}`, {
          method: 'POST',
          body: new FormData(event.target as HTMLFormElement),
        })
          .then(checkStatus)
          .then(parseJSON)
          .then(body => {
            props.selectBudget(body.data)
            navigate('/')
          })
          .catch(error => {
            setIsLoading(false)
            setError(error.message)
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

          <div className="card">
            <FormFields>
              <FormField
                type="text"
                name="budgetName"
                label={t('budgets.import.budgetName')}
                value={budgetName}
                onChange={e => setBudgetName(e.target.value)}
                options={{ required: true }}
              ></FormField>
              <FormField
                type="file"
                name="file"
                label={t('budgets.import.file')}
                options={{ required: true }}
              ></FormField>
            </FormFields>

            <p
              className="mt-8 whitespace-pre-line dark:text-gray-400"
              dangerouslySetInnerHTML={{
                __html: t('budgets.import.description'),
              }}
            ></p>
            <div className="button-group mt-4">
              <button type="submit" className="btn-primary">
                {t('save')}
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

export default BudgetImport

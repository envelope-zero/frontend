import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Translation,
  UnpersistedBudget,
  Budget,
  BudgetApiConnection,
} from '../types'
import connectBudgetApi, {
  updateBudget,
  deleteBudget,
} from '../lib/api/budgets'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import submitOnMetaEnter from '../lib/submit-on-meta-enter'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'

type BudgetFormProps = {
  selectBudget: (budget?: Budget) => void
  selectedBudget?: Budget
  hideHeading?: boolean
}

const BudgetForm = ({
  selectBudget,
  selectedBudget,
  hideHeading,
}: BudgetFormProps) => {
  const { t }: Translation = useTranslation()
  const params = useParams()
  const navigate = useNavigate()

  const budgetId = params.budgetId || selectedBudget?.id

  const [budget, setBudget] = useState<UnpersistedBudget | Budget>({})
  const [budgetApi, setBudgetApi] = useState<BudgetApiConnection>()
  const [error, setError] = useState('')

  const isPersisted = typeof budgetId !== 'undefined' && budgetId !== 'new'

  useEffect(() => {
    connectBudgetApi().then(api => {
      setBudgetApi(api)
      if (typeof selectedBudget !== 'undefined') {
        setBudget(selectedBudget)
      } else if (isPersisted) {
        api
          .getBudget(budgetId)
          .then(data => {
            setError('')
            setBudget(data)
          })
          .catch(err => {
            setError(err.message)
          })
      }
    })
  }, [budgetId, selectedBudget, isPersisted])

  const updateValue = (key: keyof Budget, value: any) => {
    setBudget({ ...budget, [key]: value })
  }

  const navigateToDashboard = (selectedBudget: Budget) => {
    setError('')
    selectBudget(selectedBudget)
    navigate('/')
  }

  return (
    <form
      onKeyDown={submitOnMetaEnter}
      onSubmit={e => {
        e.preventDefault()
        if (typeof budget === 'undefined') {
          return
        }

        if ('id' in budget) {
          updateBudget(budget)
            .then(navigateToDashboard)
            .catch(err => {
              setError(err.message)
            })
        } else {
          budgetApi
            ?.createBudget(budget)
            .then(navigateToDashboard)
            .catch(err => {
              setError(err.message)
            })
        }
      }}
    >
      <div className="header">
        <h1 className={hideHeading ? 'invisible' : ''}>
          {t('budgets.budget')}
        </h1>
        <div className="header--action">
          <Link to={-1 as any} className="header--action__secondary">
            {t('cancel')}
          </Link>
          <button type="submit">{t('save')}</button>
        </div>
      </div>

      <Error error={error} />

      {isPersisted ? null : (
        <>
          <h2>{t('budgets.createNew')}</h2>
          <Link
            to="/budget-import"
            className="text-sm link-blue flex align-center"
          >
            <DocumentArrowUpIcon className="icon-sm mr-1" />
            {t('budgets.import.importInstead')}
          </Link>
        </>
      )}

      <FormFields>
        <FormField
          type="text"
          name="name"
          label={t('budgets.name')}
          value={budget?.name || ''}
          onChange={e => updateValue('name', e.target.value)}
          options={{ autoFocus: true }}
        />

        <FormField
          type="text"
          name="currency"
          label={t('budgets.currency')}
          value={budget?.currency || ''}
          onChange={e => updateValue('currency', e.target.value)}
        />

        <div className="form-field--wrapper">
          <label htmlFor="note" className="form-field--label">
            {t('budgets.note')}
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <textarea
              id="note"
              name="note"
              rows={3}
              value={budget?.note || ''}
              onChange={e => updateValue('note', e.target.value)}
              className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
            />
          </div>
        </div>
      </FormFields>

      {isPersisted ? (
        <div className="pt-5">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t('budgets.confirmDelete'))) {
                deleteBudget(budget as Budget)
                  .then(() => {
                    selectBudget(undefined)
                    setError('')
                    navigate('/budgets')
                  })
                  .catch(err => {
                    setError(err.message)
                  })
              }
            }}
            className="box w-full text-red-800 py-2 px-4 text-sm font-medium hover:bg-gray-200"
          >
            {t('budgets.delete')}
          </button>
        </div>
      ) : null}
    </form>
  )
}

export default BudgetForm

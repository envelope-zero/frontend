import { useTranslation } from 'react-i18next'
import { Translation, Budget, Theme } from '../types'
import submitOnMetaEnter from '../lib/submit-on-meta-enter'
import { useState } from 'react'
import { updateBudget } from '../lib/api/budgets'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'

type Props = {
  budget: Budget
  setBudget: (budget?: Budget) => void
  theme: string
  setTheme: (theme: Theme) => void
  setNotification: (notification: string) => void
}

const Settings = ({
  budget,
  setBudget,
  theme,
  setTheme,
  setNotification,
}: Props) => {
  const { t }: Translation = useTranslation()
  const [tmpBudget, setTmpBudget] = useState(budget)
  const [error, setError] = useState('')

  return (
    <form
      onKeyDown={submitOnMetaEnter}
      onSubmit={e => {
        e.preventDefault()
        updateBudget(tmpBudget)
          .then(updatedBudget => {
            setBudget(updatedBudget)
            setNotification(t('changesSaved'))
          })
          .catch(err => setError(err.message))
      }}
    >
      <div className="header">
        <h1>{t('settings.settings')}</h1>
        <div className="header--action">
          <button type="submit">{t('save')}</button>
        </div>
      </div>

      <Error error={error} />

      <div>
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300 pl-4 pb-2">
          {t('settings.budget')}
        </h2>
        <div className="card">
          <FormFields>
            <FormField
              type="text"
              name="budget-name"
              label={t('budgets.name')}
              value={tmpBudget.name || ''}
              onChange={e =>
                setTmpBudget({ ...tmpBudget, name: e.target.value })
              }
            />
            <FormField
              type="text"
              name="budget-currency"
              label={t('budgets.currency')}
              value={tmpBudget.currency || ''}
              onChange={e =>
                setTmpBudget({ ...tmpBudget, currency: e.target.value })
              }
            />
            <div className="form-field--wrapper">
              <label htmlFor="budget-note" className="form-field--label">
                {t('budgets.note')}
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <textarea
                  id="budget-note"
                  name="budget-note"
                  rows={3}
                  value={tmpBudget.note || ''}
                  onChange={e =>
                    setTmpBudget({ ...tmpBudget, note: e.target.value })
                  }
                  className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
                />
              </div>
            </div>
          </FormFields>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300 pl-4 pb-2">
          {t('settings.app')}
        </h2>
        <div className="card">
          <FormFields>
            <div className="form-field--wrapper">
              <label htmlFor="theme" className="form-field--label">
                {t('settings.theme')}
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <select
                  id="theme"
                  name="theme"
                  value={theme}
                  onChange={e => {
                    if (['dark', 'light', 'default'].includes(e.target.value)) {
                      setTheme(e.target.value as Theme)
                    }
                  }}
                  className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
                >
                  <option value="default">
                    {t('settings.themes.default')}
                  </option>
                  <option value="dark">{t('settings.themes.dark')}</option>
                  <option value="light">{t('settings.themes.light')}</option>
                </select>
              </div>
            </div>
          </FormFields>
        </div>
      </div>
    </form>
  )
}

export default Settings

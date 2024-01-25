import { useTranslation } from 'react-i18next'
import { Translation, Budget, Theme } from '../types'
import submitOnMetaEnter from '../lib/submit-on-meta-enter'
import { useState } from 'react'
import { updateBudget } from '../lib/api/budgets'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import { Link } from 'react-router-dom'

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
      </div>

      <Error error={error} />

      <div className="space-y-10 divide-y divide-gray-900/10 dark:divide-gray-200/10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {t('settings.budget')}
            </h2>
          </div>

          <div className="card md:col-span-2">
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
              <div>
                <label htmlFor="budget-note" className="form-field--label">
                  {t('budgets.note')}
                </label>
                <div className="input--outer">
                  <textarea
                    id="budget-note"
                    name="budget-note"
                    rows={3}
                    value={tmpBudget.note || ''}
                    onChange={e =>
                      setTmpBudget({ ...tmpBudget, note: e.target.value })
                    }
                    className="input"
                  />
                </div>
              </div>
            </FormFields>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {t('settings.app')}
            </h2>
          </div>

          <div className="card md:col-span-2">
            <FormFields>
              <div>
                <label htmlFor="theme" className="form-field--label">
                  {t('settings.theme')}
                </label>
                <div className="input--outer">
                  <select
                    id="theme"
                    name="theme"
                    value={theme}
                    onChange={e => {
                      if (
                        ['dark', 'light', 'default'].includes(e.target.value)
                      ) {
                        setTheme(e.target.value as Theme)
                      }
                    }}
                    className="input"
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
      </div>

      <div className="button-group mt-10">
        <button type="submit" className="btn-primary">
          {t('save')}
        </button>
        <Link to={-1 as any} className="btn-secondary">
          {t('cancel')}
        </Link>
      </div>
    </form>
  )
}

export default Settings

import { useTranslation } from 'react-i18next'
import { Translation, Budget, Theme } from '../types'
import submitOnMetaEnter from '../lib/submit-on-meta-enter'
import { useState } from 'react'
import { updateBudget } from '../lib/api/budgets'
import Error from './Error'

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
        <div className="card pl-4">
          <dl className="divide-y divide-gray-200 dark:divide-gray-900">
            <div className="grid grid-cols-3 gap-4 py-1 pr-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <label htmlFor="budget-name">{t('budgets.name')}</label>
              </dt>
              <dd className="text-sm text-gray-900 col-span-2 mt-0">
                <input
                  className="settings-input"
                  type="text"
                  name="budget-name"
                  id="budget-name"
                  value={tmpBudget.name || ''}
                  onChange={e =>
                    setTmpBudget({ ...tmpBudget, name: e.target.value })
                  }
                />
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-1 pr-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <label htmlFor="budget-currency">{t('budgets.currency')}</label>
              </dt>
              <dd className="text-sm text-gray-900 col-span-2 mt-0">
                <input
                  className="settings-input"
                  type="text"
                  name="budget-currency"
                  id="budget-currency"
                  value={tmpBudget.currency || ''}
                  onChange={e =>
                    setTmpBudget({ ...tmpBudget, currency: e.target.value })
                  }
                />
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 pr-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                <label htmlFor="budget-note">{t('budgets.note')}</label>
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <textarea
                  id="budget-note"
                  name="budget-note"
                  rows={3}
                  value={tmpBudget.note || ''}
                  onChange={e =>
                    setTmpBudget({ ...tmpBudget, note: e.target.value })
                  }
                  className="input border-gray-200"
                />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300 pl-4 pb-2">
          {t('settings.app')}
        </h2>
        <div className="card pl-4">
          <dl className="divide-y divide-gray-200">
            <div className="grid grid-cols-3 gap-4 py-1 pr-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <label htmlFor="theme">{t('settings.theme')}</label>
              </dt>
              <dd className="text-sm text-gray-900 col-span-2 mt-0">
                <select
                  id="theme"
                  name="theme"
                  value={theme}
                  className="settings-input"
                  onChange={e => {
                    if (['dark', 'light', 'default'].includes(e.target.value)) {
                      setTheme(e.target.value as Theme)
                    }
                  }}
                >
                  <option value="default">
                    {t('settings.themes.default')}
                  </option>
                  <option value="dark">{t('settings.themes.dark')}</option>
                  <option value="light">{t('settings.themes.light')}</option>
                </select>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </form>
  )
}

export default Settings

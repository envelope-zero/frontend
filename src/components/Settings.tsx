import { useTranslation } from 'react-i18next'
import { Translation, Budget, Theme } from '../types'
import submitOnMetaEnter from '../lib/submit-on-meta-enter'
import { useEffect, useState } from 'react'
import { updateBudget } from '../lib/api/budgets'
import Error from './Error'
import FormFields from './FormFields'
import FormField from './FormField'
import Modal from './Modal'
import { Link } from 'react-router-dom'
import { api } from '../lib/api/base'
import { MatchRule } from '../types'
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const [tmpBudget, setTmpBudget] = useState(budget)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [openMatchRuleHelp, setOpenMatchRuleHelp] = useState(false)
  const [openUnsavedChanges, setOpenUnsavedChanges] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const matchRuleApi = api('matchRules')
  const [matchRules, setMatchRules] = useState<MatchRule[]>([])

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
    }
    matchRuleApi
      .getAll(budget)
      .then(data => {
        setMatchRules(data)
        setIsLoading(false)
      })
      .catch(err => setError(err.message))
  }, [budget])

  return (
    <form
      onKeyDown={submitOnMetaEnter}
      onChange={() => setUnsavedChanges(true)}
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

              <div>
                <div className="form-field--label">
                  {t('matchRules.matchRules')}
                  <button
                    type="button"
                    onClick={() => setOpenMatchRuleHelp(true)}
                    className="ml-1"
                  >
                    <span className="aria-hidden">
                      <QuestionMarkCircleIcon className="icon-xs" />
                    </span>
                    <span className="sr-only">{t('help')}</span>
                  </button>
                  <Modal
                    open={openMatchRuleHelp}
                    setOpen={open => setOpenMatchRuleHelp(open)}
                  >
                    <div className="absolute right-0 top-0 pr-4 pt-4">
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => {
                          setOpenMatchRuleHelp(false)
                          if (error) {
                            setError('')
                          }
                        }}
                      >
                        <span className="sr-only">{t('close')}</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mb-2 text-base font-semibold">
                      {t('matchRules.matchRules')}
                    </div>
                    <p className="text-sm">{t('matchRules.description')}</p>
                  </Modal>
                </div>
                <div>
                  {t('matchRules.count', {
                    count: matchRules.length,
                  })}
                  {' - '}
                  <Link
                    to={'match-rules'}
                    title={t('matchRules.edit')}
                    className="link-blue"
                    onClick={e => {
                      e.preventDefault()

                      if (unsavedChanges) {
                        setOpenUnsavedChanges(true)
                      } else {
                        navigate('match-rules')
                      }
                    }}
                  >
                    {t('edit')}
                  </Link>
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
        <Modal
          open={openUnsavedChanges}
          setOpen={open => setOpenUnsavedChanges(open)}
        >
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              onClick={() => {
                setOpenUnsavedChanges(false)
                if (error) {
                  setError('')
                }
              }}
            >
              <span className="sr-only">{t('close')}</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mb-2 text-base font-semibold">
            {t('unsavedChanges')}
          </div>
          <div>{t('discardUnsavedChanges')}</div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                navigate('match-rules')
              }}
              className="btn-secondary shadow-xs inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold sm:col-start-2"
            >
              {t('discard')}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenUnsavedChanges(false)
              }}
              className="btn-primary shadow-xs mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold sm:col-start-1 sm:mt-0"
            >
              {t('cancel')}
            </button>
          </div>
        </Modal>

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

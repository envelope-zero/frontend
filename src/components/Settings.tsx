import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Translation, Budget } from '../types'
import AppSettings from './AppSettings'
import BudgetForm from './BudgetForm'

const tabs = ['budget', 'app']

type Props = { budget: Budget; setBudget: (budget?: Budget) => void }

const Settings = ({ budget, setBudget }: Props) => {
  const { t }: Translation = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab =
    tabs.find(tab => tab === searchParams.get('tab')) || tabs[0]

  const renderSettings = (tab: string) => {
    switch (tab) {
      case 'budget':
        return (
          <BudgetForm
            selectedBudget={budget}
            selectBudget={setBudget}
            hideHeading={true}
          />
        )
      case 'app':
        return <AppSettings />
    }
  }

  return (
    <div>
      <div className="header">
        <h1>{t('settings.settings')}</h1>
      </div>

      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map(tab => (
              <a
                key={tab}
                href={`?tab=${tab}`}
                onClick={e => {
                  e.preventDefault()
                  searchParams.set('tab', tab)
                  setSearchParams(searchParams)
                }}
                className={`${
                  tab === currentTab
                    ? 'border-red-800 text-red-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                  w-1/4 pb-4 px-1 text-center border-b-2 font-medium text-sm flex-grow`}
                aria-current={tab === currentTab ? 'page' : undefined}
              >
                {t(`settings.${tab}`)}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {renderSettings(currentTab)}
    </div>
  )
}

export default Settings

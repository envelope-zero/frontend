import { useTranslation } from 'react-i18next'
import { Translation } from '../types'

type DashboardProps = { budgetId: number }

const Home = ({ budgetId }: DashboardProps) => {
  const { t }: Translation = useTranslation()

  return (
    <>
      <div className="header">
        <h1>
          {t('budgets.budget')} {budgetId}
        </h1>
        <div className="header--action">TODO</div>
      </div>
      <p>There should be some content here</p>
    </>
  )
}

export default Home

import { useTranslation } from 'react-i18next'

type DashboardProps = { budgetId: number }

const Home = ({ budgetId }: DashboardProps) => {
  const { t } = useTranslation()

  return (
    <>
      <h1>{budgetId}</h1>
    </>
  )
}

export default Home

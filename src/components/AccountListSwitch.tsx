import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Translation } from '../types'

type Props = { selected: 'internal' | 'external' }

const AccountListSwitch = ({ selected }: Props) => {
  const tabClasses = (isActive: boolean) =>
    `${
      isActive ? 'bg-white dark:bg-slate-600' : ''
    } text-sm text-center rounded-md p-1 grow`

  const { t }: Translation = useTranslation()

  return (
    <div className="box p-1 mb-6 flex dark:text-gray-100">
      <Link to="/own-accounts" className={tabClasses(selected === 'internal')}>
        {t('accounts.internalAccounts')}
      </Link>
      <Link
        to="/external-accounts"
        className={tabClasses(selected === 'external')}
      >
        {t('accounts.externalAccounts')}
      </Link>
    </div>
  )
}

export default AccountListSwitch

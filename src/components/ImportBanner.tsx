import { useTranslation } from 'react-i18next'
import { Translation } from '../types'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Link } from 'react-router-dom'

type Props = { hideBanner: () => void }

const ImportBanner = ({ hideBanner }: Props) => {
  const { t }: Translation = useTranslation()
  return (
    <div className="mb-8 bg-gray-200 md:mb-4 dark:bg-slate-700">
      <div className="mx-auto flex max-w-7xl items-center gap-x-6 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm leading-6 text-gray-900 dark:text-gray-100">
            {t('transactions.import.unfinishedImportInProgress')}
          </p>
          <Link
            to="/transactions/import"
            className="flex-none rounded-full bg-red-800 px-3.5 py-1 text-sm font-semibold text-gray-100 shadow-xs hover:bg-red-900 dark:hover:bg-red-700"
          >
            {t('transactions.import.resumeNow')}{' '}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
            onClick={() => {
              if (window.confirm(t('transactions.import.confirmCancel'))) {
                localStorage.removeItem('importTransactions')
                localStorage.removeItem('importIndex')
                hideBanner()
              }
            }}
            title={t('transactions.import.cancel')}
          >
            <XMarkIcon
              className="h-5 w-5 text-gray-900 dark:text-gray-100"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportBanner

import { useEffect, useState } from 'react'
import { PlusIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { Translation, Category, Budget, FilterOptions } from '../types'
import { api } from '../lib/api/base'
import Error from './Error'
import CategoryEnvelopes from './CategoryEnvelopes'

const categoryApi = api('categories')

type Props = { budget: Budget }

const EnvelopesList = ({ budget }: Props) => {
  const { t }: Translation = useTranslation()
  const [searchParams] = useSearchParams()
  const hidden = searchParams.get('hidden') === 'true'

  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const filter: FilterOptions = {}
    if (!hidden) {
      filter.hidden = false
    }

    categoryApi
      .getAll(budget, filter)
      .then(data => {
        setCategories(data)
        setError('')
      })
      .catch(err => {
        setError(err.message)
      })
  }, [budget, hidden])

  return (
    <>
      <div className="header">
        <h1>{t('envelopes.envelopes')}</h1>
        <div className="header--action">
          <Link to="new" title={t('envelopes.create')}>
            <PlusIcon className="icon-red" />
          </Link>
        </div>
      </div>

      <Error error={error} />

      {hidden ? (
        <div className="flex align-center justify-start link-blue pb-2">
          <Link to="/envelopes?hidden=false">
            <ChevronLeftIcon className="icon inline relative bottom-0.5" />
            {t('back')}
          </Link>
        </div>
      ) : (
        <div className="flex align-center justify-end link-blue pb-2">
          <Link to="/envelopes?hidden=true">
            {t('showArchived')}
            <ChevronRightIcon className="icon inline relative bottom-0.5" />
          </Link>
        </div>
      )}

      {categories.length ? (
        <div className="space-y-4">
          {categories
            .filter(
              category =>
                category.hidden === hidden ||
                category.envelopes.some(envelope => envelope.hidden === hidden)
            )
            .map(category => (
              <CategoryEnvelopes
                category={category}
                key={category.id}
                hidden={hidden}
              />
            ))}
        </div>
      ) : (
        <>
          <div>{t('envelopes.emptyList')}</div>
          <Link to="new" title={t('envelopes.create')}>
            <PlusCircleIcon className="icon-red icon-lg mx-auto mt-4" />
          </Link>
        </>
      )}
    </>
  )
}

export default EnvelopesList

import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Translation, Category, Budget } from '../types'
import { api } from '../lib/api/base'
import Error from './Error'
import CategoryEnvelopes from './CategoryEnvelopes'

const categoryApi = api('categories')

type Props = { budget: Budget }

const EnvelopesList = ({ budget }: Props) => {
  const { t }: Translation = useTranslation()

  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoryApi
      .getAll(budget)
      .then(data => {
        setCategories(data)
        setError('')
      })
      .catch(err => {
        setError(err.message)
      })
  }, [budget])

  return (
    <>
      <div className="header">
        <h1>{t('envelopes.envelopes')}</h1>
        <div className="header--action">
          <Link to="new">
            <PlusIcon className="icon" />
          </Link>
        </div>
      </div>

      <Error error={error} />

      <div className="space-y-4">
        {categories.map(category => (
          <CategoryEnvelopes category={category} key={category.id} />
        ))}
      </div>
    </>
  )
}

export default EnvelopesList

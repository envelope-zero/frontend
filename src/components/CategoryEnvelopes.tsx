import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Category, Translation } from '../types'
import { safeName } from '../lib/name-helper'
import { useTranslation } from 'react-i18next'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PencilIcon,
} from '@heroicons/react/20/solid'

const CategoryEnvelopes = ({ category }: { category: Category }) => {
  const { t }: Translation = useTranslation()

  const [showEnvelopes, setShowEnvelopes] = useState(true)

  return (
    <>
      <div
        className="box p-2 flex"
        onClick={() => {
          setShowEnvelopes(!showEnvelopes)
        }}
      >
        {showEnvelopes ? (
          <ChevronUpIcon className="h-6" />
        ) : (
          <ChevronDownIcon className="h-6" />
        )}

        <div className="grow">
          <span className={!category.name ? 'italic' : ''}>
            {safeName(category, 'category', t('categories.category'))}
          </span>

          {showEnvelopes && category.note ? (
            <div>
              <small className="text-gray-600">{category.note}</small>
            </div>
          ) : null}
        </div>

        <Link to={`/categories/${category.id}`}>
          <PencilIcon className="icon mr-2" />
        </Link>
      </div>

      {showEnvelopes ? (
        <div className="divide-y space-y-2 ml-4">
          {category.envelopes.map(envelope => (
            <Link
              to={envelope.id}
              key={envelope.id}
              className="flex justify-between pt-2 first:pt-0"
            >
              <span className={!envelope.name ? 'italic' : ''}>
                {safeName(envelope, 'envelope')}
              </span>
              <ChevronRightIcon className="h-6 mr-3" />
            </Link>
          ))}
        </div>
      ) : null}
    </>
  )
}

export default CategoryEnvelopes

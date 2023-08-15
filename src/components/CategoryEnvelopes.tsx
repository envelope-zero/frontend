import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Category, Translation } from '../types'
import { safeName } from '../lib/name-helper'
import { useTranslation } from 'react-i18next'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid'
import { PencilIcon } from '@heroicons/react/24/solid'
import { ArchiveBoxIcon } from '@heroicons/react/24/outline'

const CategoryEnvelopes = ({
  category,
  hidden,
}: {
  category: Category
  hidden: boolean
}) => {
  const { t }: Translation = useTranslation()

  const [showEnvelopes, setShowEnvelopes] = useState(true)

  return (
    <>
      <div
        className="box p-2 flex dark:text-gray-100"
        onClick={() => {
          setShowEnvelopes(!showEnvelopes)
        }}
      >
        {showEnvelopes ? (
          <ChevronUpIcon className="icon" />
        ) : (
          <ChevronDownIcon className="icon" />
        )}

        <div
          className={`grow ${
            showEnvelopes || ' whitespace-nowrap overflow-hidden text-ellipsis'
          }`}
        >
          <span className={!category.name ? 'italic' : ''}>
            {safeName(category, 'category', t('categories.category'))}
            {category.hidden ? (
              <ArchiveBoxIcon
                className="icon-sm inline link-blue ml-2 stroke-2"
                title={t('archived')}
              />
            ) : null}
          </span>

          {showEnvelopes && category.note ? (
            <div>
              <small className="text-gray-600 dark:text-gray-400">
                {category.note}
              </small>
            </div>
          ) : null}
        </div>

        <Link to={`/categories/${category.id}`} title={t('categories.edit')}>
          <PencilIcon className="icon-red icon-sm mx-2" />
        </Link>
      </div>

      {showEnvelopes ? (
        <div className="divide-y dark:divide-gray-900 space-y-2 ml-4">
          {category.envelopes
            .filter(
              envelope =>
                (hidden && category.hidden) || envelope.hidden === hidden
            )
            .map(envelope => (
              <Link
                to={envelope.id}
                key={envelope.id}
                className="flex justify-between pt-2 first:pt-0 dark:text-gray-300"
              >
                <span className={!envelope.name ? 'italic' : ''}>
                  {safeName(envelope, 'envelope')}
                  {envelope.hidden ? (
                    <ArchiveBoxIcon
                      className="icon-sm inline link-blue ml-2 stroke-2"
                      title={t('archived')}
                    />
                  ) : null}
                </span>
                <ChevronRightIcon className="h-6 mr-3 flex-shrink-0" />
              </Link>
            ))}
        </div>
      ) : null}
    </>
  )
}

export default CategoryEnvelopes

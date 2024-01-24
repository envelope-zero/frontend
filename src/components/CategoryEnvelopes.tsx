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
  archived,
}: {
  category: Category
  archived: boolean
}) => {
  const { t }: Translation = useTranslation()

  const [showEnvelopes, setShowEnvelopes] = useState(true)

  return (
    <>
      <div
        className={`flex bg-gray-50 dark:bg-gray-700 p-4 text-gray-500 dark:text-gray-100 cursor-pointer ${
          showEnvelopes ? 'border-y first:border-t-0' : ''
        } border-gray-200 dark:border-gray-900`}
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
            {category.archived ? (
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
        <div>
          {category.envelopes
            .filter(
              envelope =>
                (archived && category.archived) ||
                envelope.archived === archived
            )
            .map(envelope => (
              <Link
                to={envelope.id}
                key={envelope.id}
                className="relative px-6 py-5 flex justify-between items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className={!envelope.name ? 'italic' : ''}>
                  {safeName(envelope, 'envelope')}
                  {envelope.archived ? (
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

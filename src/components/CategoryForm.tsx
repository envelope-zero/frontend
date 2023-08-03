import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Budget, Category, Translation, UnpersistedCategory } from '../types'
import { api } from '../lib/api/base'
import Error from './Error'
import LoadingSpinner from './LoadingSpinner'
import FormFields from './FormFields'
import FormField from './FormField'
import ArchiveButton from './ArchiveButton'
import InfoBox from './InfoBox'
import { safeName } from '../lib/name-helper'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { TrashIcon } from '@heroicons/react/24/outline'
import submitOnMetaEnter from '../lib/submit-on-meta-enter'

const categoryApi = api('categories')

const CategoryForm = ({ budget }: { budget: Budget }) => {
  const { t }: Translation = useTranslation()
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [category, setCategory] = useState<Category | UnpersistedCategory>({})

  useEffect(() => {
    if (!categoryId) {
      navigate('/')
      return
    }

    categoryApi
      .get(categoryId, budget)
      .then(data => {
        setCategory(data)
        setError('')
      })
      .catch(err => setError(err.message))
  }, [budget, categoryId, navigate])

  const confirmDiscardingUnsavedChanges = (e: any) => {
    if (hasUnsavedChanges && !window.confirm(t('discardUnsavedChanges'))) {
      e.preventDefault()
    }
  }

  const updateValue = (key: keyof Category, value: any) => {
    setHasUnsavedChanges(true)
    setCategory({ ...category, [key]: value })
  }

  return (
    <form
      onKeyDown={submitOnMetaEnter}
      onSubmit={e => {
        e.preventDefault()

        categoryApi
          .update({ ...category, categoryId: categoryId })
          .then(() => navigate(-1))
          .catch(err => {
            setError(err.message)
          })
      }}
    >
      <div className="header">
        <h1>{t('categories.category')}</h1>
        <div className="header--action">
          <Link to={-1 as any} className="header--action__secondary">
            {t('cancel')}
          </Link>
          <button type="submit">{t('save')}</button>
        </div>
      </div>

      <Error error={error} />

      {typeof category === 'undefined' ? (
        <LoadingSpinner />
      ) : (
        <>
          {category.hidden ? (
            <InfoBox
              text={t('archivedObjectInformation', {
                object: t('categories.category'),
              })}
            />
          ) : null}
          <FormFields>
            <FormField
              type="text"
              name="name"
              label={t('categories.name')}
              value={category.name || ''}
              onChange={e => updateValue('name', e.target.value)}
              options={{ autoFocus: true }}
            />

            <div className="form-field--wrapper">
              <label htmlFor="note" className="form-field--label">
                {t('categories.note')}
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  value={category.note || ''}
                  onChange={e => updateValue('note', e.target.value)}
                  className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
                />
              </div>
            </div>
          </FormFields>

          <div className="pt-5 space-y-3">
            <ArchiveButton
              resource={category as Category}
              resourceTypeTranslation={t('categories.category')}
              apiConnection={categoryApi}
              onSuccess={data => {
                setCategory(data)
                if (error) {
                  setError('')
                }
              }}
              onError={setError}
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('categories.confirmDelete'))) {
                  categoryApi
                    .delete(category as Category)
                    .then(() => {
                      navigate(-1)
                    })
                    .catch(err => {
                      setError(err.message)
                    })
                }
              }}
              className="btn-secondary"
            >
              <TrashIcon className="icon-red icon-sm inline mr-1 relative bottom-0.5" />
              {t('categories.delete')}
            </button>
          </div>

          <div className="pt-8">
            <h2>{t('categories.envelopes')}</h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-900">
              {'envelopes' in category ? (
                category.envelopes.map(envelope => {
                  return (
                    <li key={envelope.id}>
                      <Link
                        onClick={confirmDiscardingUnsavedChanges}
                        to={`/envelopes/${envelope.id}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="px-2 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium truncate dark:text-gray-300 ${
                                envelope.name ? '' : 'italic'
                              }`}
                            >
                              {safeName(envelope, 'envelope')}
                            </p>

                            <div className={'flex w-5'}>
                              <ChevronRightIcon className="text-gray-900 dark:text-gray-300" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })
              ) : (
                <LoadingSpinner />
              )}
            </ul>
          </div>
        </>
      )}
    </form>
  )
}

export default CategoryForm

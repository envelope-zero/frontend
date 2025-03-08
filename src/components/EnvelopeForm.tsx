import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api/base'
import { safeName } from '../lib/name-helper'
import submitOnMetaEnter from '../lib/submit-on-meta-enter'
import {
  Budget,
  Envelope,
  UnpersistedEnvelope,
  Translation,
  UnpersistedCategory,
  Category,
} from '../types'
import Autocomplete from './Autocomplete'
import Error from './Error'
import FormField from './FormField'
import FormFields from './FormFields'
import LoadingSpinner from './LoadingSpinner'
import ArchiveButton from './ArchiveButton'
import InfoBox from './InfoBox'

const envelopeApi = api('envelopes')
const categoryApi = api('categories')

type Props = { budget: Budget }

const EnvelopeForm = ({ budget }: Props) => {
  const { t }: Translation = useTranslation()
  const { envelopeId } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [envelope, setEnvelope] = useState<UnpersistedEnvelope | Envelope>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryToCreate, setCategoryToCreate] =
    useState<UnpersistedCategory>()

  const isPersisted = typeof envelopeId !== 'undefined' && envelopeId !== 'new'

  useEffect(() => {
    const promises = [categoryApi.getAll(budget).then(setCategories)]

    if (isPersisted) {
      promises.push(envelopeApi.get(envelopeId, budget).then(setEnvelope))
    }

    Promise.all(promises)
      .then(() => setError(''))
      .catch(err => setError(err.message))
  }, [budget, isPersisted, envelopeId])

  const updateValue = (key: keyof Envelope, value: any) => {
    setHasUnsavedChanges(true)
    setEnvelope({ ...envelope, [key]: value })
  }

  const confirmDiscardingUnsavedChanges = (e: any) => {
    if (hasUnsavedChanges && !window.confirm(t('discardUnsavedChanges'))) {
      e.preventDefault()
    }
  }

  const createNewCategory = async () => {
    if (!categoryToCreate) {
      return envelope.categoryId
    }
    return categoryApi
      .create(categoryToCreate, budget)
      .then(newCategory => newCategory.id)
  }

  return (
    <form
      onKeyDown={submitOnMetaEnter}
      onSubmit={e => {
        e.preventDefault()

        createNewCategory()
          .then(categoryId => {
            if ('id' in envelope) {
              envelopeApi
                .update({ ...envelope, categoryId: categoryId })
                .then(() => navigate(-1))
                .catch(err => {
                  setError(err.message)
                })
            } else {
              envelopeApi
                .create({ ...envelope, categoryId: categoryId }, budget)
                .then(() => navigate(-1))
                .catch(err => {
                  setError(err.message)
                })
            }
          })
          .catch(err => setError(err.message))
      }}
    >
      <div className="header">
        <h1>{t('envelopes.envelope')}</h1>
      </div>

      <Error error={error} />

      {isPersisted && typeof envelope === 'undefined' ? (
        <LoadingSpinner />
      ) : (
        <>
          {envelope.archived ? (
            <InfoBox
              text={t('archivedObjectInformation', {
                object: t('envelopes.envelope'),
              })}
            />
          ) : null}

          {isPersisted && (
            <Link
              onClick={confirmDiscardingUnsavedChanges}
              to={`/transactions?envelope=${envelopeId}`}
              className="link-blue flex items-center justify-end py-4"
            >
              {t('transactions.latest')}
              <ChevronRightIcon className="inline h-6" />
            </Link>
          )}
          <div className="card">
            <FormFields className="grid-cols-2 gap-x-4 space-y-6 md:grid md:gap-y-6 md:space-y-0">
              <FormField
                type="text"
                name="name"
                label={t('envelopes.name')}
                value={envelope.name || ''}
                onChange={e => updateValue('name', e.target.value)}
                options={{ autoFocus: true }}
              />

              <Autocomplete<Category>
                groups={[{ items: categories }]}
                allowNewCreation={true}
                value={
                  (categoryToCreate ||
                    categories.find(
                      category => category.id === envelope.categoryId
                    )) as Category
                }
                label={t('envelopes.category')}
                itemLabel={category =>
                  safeName(category, 'category', t('categories.category'))
                }
                itemId={category =>
                  category.id ||
                  safeName(category, 'category', t('categories.category'))
                }
                onChange={category => {
                  if (!category) {
                    // This should not happen by user interaction, but can happen programatically, e.g. with cypresses "clear()"
                    return
                  } else if (!category.id) {
                    setCategoryToCreate(category)
                  } else {
                    setCategoryToCreate(undefined)
                    updateValue('categoryId', category.id)
                  }
                }}
              />

              <div className="col-span-full">
                <label htmlFor="note" className="form-field--label">
                  {t('accounts.note')}
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={envelope?.note || ''}
                    onChange={e => updateValue('note', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </FormFields>

            {/* TODO: balance per month */}

            <div className="button-group mt-8">
              <button type="submit" className="btn-primary">
                {t('save')}
              </button>
              {isPersisted ? (
                <>
                  <ArchiveButton
                    resource={envelope as Envelope}
                    resourceTypeTranslation={t('envelopes.envelope')}
                    apiConnection={envelopeApi}
                    onSuccess={data => {
                      setEnvelope(data)
                      if (error) {
                        setError('')
                      }
                    }}
                    onError={setError}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(t('envelopes.confirmDelete'))) {
                        envelopeApi
                          .delete(envelope as Envelope)
                          .then(() => {
                            navigate(-1)
                          })
                          .catch(err => {
                            setError(err.message)
                          })
                      }
                    }}
                    className="btn-secondary-red"
                  >
                    <TrashIcon className="icon-red icon-sm relative bottom-0.5 mr-1 inline" />
                    {t('envelopes.delete')}
                  </button>
                </>
              ) : (
                <Link to={-1 as any} className="btn-secondary">
                  {t('cancel')}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default EnvelopeForm

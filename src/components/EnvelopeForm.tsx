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
        <div className="header--action">
          <Link to={-1 as any} className="header--action__secondary">
            {t('cancel')}
          </Link>
          <button type="submit">{t('save')}</button>
        </div>
      </div>

      <Error error={error} />

      {isPersisted && typeof envelope === 'undefined' ? (
        <LoadingSpinner />
      ) : (
        <>
          {envelope.hidden ? (
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
              className="flex items-center justify-end link-blue"
            >
              {t('transactions.latest')}
              <ChevronRightIcon className="inline h-6" />
            </Link>
          )}

          <FormFields>
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
                if (!category.id) {
                  setCategoryToCreate(category)
                } else {
                  setCategoryToCreate(undefined)
                  updateValue('categoryId', category.id)
                }
              }}
            />

            <div className="form-field--wrapper">
              <label htmlFor="note" className="form-field--label">
                {t('accounts.note')}
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  value={envelope?.note || ''}
                  onChange={e => updateValue('note', e.target.value)}
                  className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
                />
              </div>
            </div>
          </FormFields>

          {/* TODO: balance per month */}

          {isPersisted ? (
            <div className="pt-5 space-y-3">
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
                className="btn-secondary"
              >
                <TrashIcon className="icon-red icon-sm inline mr-1 relative bottom-0.5" />
                {t('envelopes.delete')}
              </button>
            </div>
          ) : null}
        </>
      )}
    </form>
  )
}

export default EnvelopeForm

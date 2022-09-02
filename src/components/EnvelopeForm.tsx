import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api/base'
import { safeName } from '../lib/name-helper'
import {
  Account,
  Budget,
  Envelope,
  UnpersistetEnvelope,
  Translation,
  UnpersistedCategory,
  Category,
} from '../types'
import Autocomplete from './Autocomplete'
import Error from './Error'
import FormField from './FormField'
import FormFields from './FormFields'
import LatestTransactions from './LatestTransactions'
import LoadingSpinner from './LoadingSpinner'
import RemainingHeightContainer from './RemainingHeightContainer'

const envelopeApi = api('envelopes')
const categoryApi = api('categories')

type Props = { budget: Budget; accounts: Account[] }

const EnvelopeForm = ({ budget, accounts }: Props) => {
  const { t }: Translation = useTranslation()
  const { envelopeId } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [envelope, setEnvelope] = useState<UnpersistetEnvelope | Envelope>({})
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
          <FormFields>
            <FormField
              type="text"
              name="name"
              label={t('envelopes.name')}
              value={envelope.name || ''}
              onChange={e => updateValue('name', e.target.value)}
            />

            <Autocomplete<Category>
              groups={[{ items: categories }]}
              allowNewCreation={true}
              value={
                (categories.find(
                  category => category.id === envelope.categoryId
                ) as Category) || categoryToCreate
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
            <div className="pt-5">
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
                {t('envelopes.delete')}
              </button>
            </div>
          ) : null}

          {'links' in envelope ? (
            <div className="pt-8">
              <RemainingHeightContainer>
                <div className="flex justify-between">
                  <h2>{t('transactions.transactions')}</h2>
                  <Link
                    onClick={confirmDiscardingUnsavedChanges}
                    to={`/transactions?envelope=${envelope.id}`}
                    className="flex items-center link-blue"
                  >
                    {t('seeAll')} <ChevronRightIcon className="inline h-6" />
                  </Link>
                </div>
                <LatestTransactions
                  accounts={accounts}
                  parent={envelope}
                  budget={budget}
                />
              </RemainingHeightContainer>
            </div>
          ) : null}
        </>
      )}
    </form>
  )
}

export default EnvelopeForm

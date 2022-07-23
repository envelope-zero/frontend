import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Budget, Category, Translation } from '../types'
import { api } from '../lib/api/base'
import Error from './Error'
import LoadingSpinner from './LoadingSpinner'
import FormFields from './FormFields'
import FormField from './FormField'

const categoryApi = api('categories')

const CategoryForm = ({ budget }: { budget: Budget }) => {
  const { t }: Translation = useTranslation()
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [category, setCategory] = useState<Category | undefined>()

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

  return (
    <form
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
          <FormFields>
            <FormField
              type="text"
              name="name"
              label={t('categories.name')}
              value={category.name || ''}
              onChange={e => setCategory({ ...category, name: e.target.value })}
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
                  onChange={e =>
                    setCategory({ ...category, note: e.target.value })
                  }
                  className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
                />
              </div>
            </div>
          </FormFields>

          <div className="pt-5">
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
              {t('categories.delete')}
            </button>
          </div>

          {/* TODO: list envelopes */}
        </>
      )}
    </form>
  )
}

export default CategoryForm

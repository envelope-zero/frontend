import { useTranslation } from 'react-i18next'
import { Translation, Budget } from '../types'
import { useEffect, useState } from 'react'
import {
  ArrowLongDownIcon,
  ArrowLongRightIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Bars2Icon } from '@heroicons/react/24/solid'
import Error from './Error'
import FormField from './FormField'
import { api } from '../lib/api/base'
import { MatchRule, Account } from '../types'
import { ReactSortable } from 'react-sortablejs'
import Autocomplete from './Autocomplete'
import { safeName } from '../lib/name-helper'
import LoadingSpinner from './LoadingSpinner'

const matchRuleApi = api('matchRules')
const accountApi = api('accounts')

type Props = {
  budget: Budget
  setNotification: (notification: string) => void
}

const MatchRuleList = ({ budget, setNotification }: Props) => {
  const { t }: Translation = useTranslation()

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hideHelp, setHideHelp] = useState(true)

  const [matchRules, setMatchRules] = useState<MatchRule[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [toDelete, setToDelete] = useState<MatchRule[]>([])
  const accountGroups = [
    {
      title: t('accounts.internalAccounts'),
      items: accounts.filter(account => !account.external),
    },
    {
      title: t('accounts.externalAccounts'),
      items: accounts.filter(account => account.external),
    },
  ]

  const addMatchRule = () => {
    // The ID we set here is needed for uniqueness in the sortable list, but ignored later on when we actually send the data to the backend.
    // The priority is in order from top to bottom and can be 0, so we can just use the length of the matchRules.
    //
    // We also set the links to a dummy value since we only need them for match rules loaded from the backend
    setMatchRules([
      { id: matchRules.length.toString(), links: {} },
      ...matchRules,
    ])
  }

  // To delete a rule when saving, we add it to the toDelete array
  const deleteMatchRule = async (id: string) => {
    const ruleIndex = matchRules.findIndex(rule => rule.id === id)
    setToDelete([...toDelete, matchRules[ruleIndex]])
  }

  const saveMatchRules = async () => {
    const updatedMatchRules: MatchRule[] = []
    const errors: string[] = []

    const requests = matchRules.map((rule, index) => {
      // If the rule is missing an account ID or a match, it is invalid, so we discard it
      if (!rule.accountId || !rule.match) {
        errors.push(
          t('matchRules.invalid', {
            match: rule.match || '',
            account: rule.accountId || '',
          })
        )

        // Push the rule back to the rules after saving, so that it can be fixed
        updatedMatchRules.push(rule)
        return true
      }

      if (rule.createdAt) {
        // createdAt is set by the backend, so this is an existing rule that needs to be updated
        rule.priority = index

        return matchRuleApi
          .update(rule)
          .then(updatedRule => {
            updatedMatchRules.push(updatedRule)
          })
          .catch(err => errors.push(err.message))
      } else {
        // This is a new rule, it needs to be created
        rule.priority = index
        return matchRuleApi
          .create(rule, budget)
          .then(newRule => {
            updatedMatchRules.push(newRule)
          })
          .catch(err => errors.push(err.message))
      }
    })

    // Add all rules that should be deleted to the request list
    toDelete.forEach(rule => {
      // Rules that have not been created yet are skipped, since they will be gone with the re-render anyways
      if (rule.createdAt) {
        requests.push(
          matchRuleApi.delete(rule).catch(err => errors.push(err.message))
        )
      }
    })

    // After saving, the list of rules to delete should be empty again.
    setToDelete([])

    await Promise.all(requests)

    setMatchRules(updatedMatchRules.sort((a, b) => a.priority - b.priority))

    if (errors.length > 0) {
      setError(errors.join(', '))
    } else {
      setNotification(t('changesSaved'))
      setError('')
    }
  }

  // Delete matchRule when it is added to toDelete
  useEffect(() => {
    setMatchRules(matchRules.filter(matchRule => !toDelete.includes(matchRule)))
  }, [toDelete])

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
    }

    const promises = [
      matchRuleApi.getAll(budget).then(matchRules => {
        setMatchRules(matchRules)

        if (matchRules.length == 0) {
          setHideHelp(false)
        }
      }),
      accountApi.getAll(budget).then(setAccounts),
    ]

    Promise.all(promises)
      .then(() => setError(''))
      .catch(err => {
        setError(err.message)
      })
      .then(() => setIsLoading(false))
  }, [budget])

  return (
    <>
      <div className="header mb-4">
        <h1>{t('matchRules.matchRules')}</h1>

        <div className="header--action full-centered">
          <button onClick={() => setHideHelp(!hideHelp)} title={t('help')}>
            <QuestionMarkCircleIcon className="icon-sm" />
          </button>

          <button onClick={() => addMatchRule()} title={t('matchRules.add')}>
            <PlusIcon className="icon-sm" />
          </button>

          <button
            onClick={() => saveMatchRules()}
            title={t('save')}
            className="btn-primary hidden sm:block"
            type="submit"
          >
            {t('save')}
          </button>
        </div>
      </div>

      <Error error={error} />

      <button
        onClick={() => saveMatchRules()}
        title={t('save')}
        className="btn-primary mb-3 sm:hidden"
        type="submit"
      >
        {t('save')}
      </button>

      <div className={`card my-4 p-4 ${hideHelp && 'hidden'}`}>
        <p className="whitespace-pre-line dark:text-gray-400">
          {t('matchRules.help')}
          <button
            onClick={() => setHideHelp(!hideHelp)}
            title={t('hide')}
            className="btn-secondary mt-4 md:hidden"
          >
            {t('hide')}
          </button>
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : matchRules.length > 0 ? (
        <ReactSortable
          list={matchRules}
          setList={setMatchRules}
          className="card w-full divide-y divide-dashed divide-gray-600 overflow-visible text-left sm:space-y-1 sm:divide-none"
          handle=".handler"
        >
          {matchRules.map(matchRule => (
            <div
              className="group flex w-full flex-wrap items-center gap-x-1 gap-y-4 py-4 sm:gap-x-3 sm:gap-y-2 sm:py-2"
              key={matchRule.id}
            >
              <div>
                <Bars2Icon className="icon-sm handler cursor-grab" />
              </div>
              <div className="flex flex-grow flex-col items-center space-y-1 sm:flex-row sm:gap-x-2">
                <div className="flex-grow">
                  <FormField
                    inputWrapperClass="mt-0"
                    name="match"
                    label={t('matchRules.match')}
                    labelClass="sr-only"
                    type="text"
                    value={matchRule.match ?? ''}
                    onChange={match => {
                      const newMatchRules = [...matchRules]
                      const ruleIndex = matchRules.findIndex(
                        rule => rule.id === matchRule.id
                      )
                      newMatchRules[ruleIndex].match = match.target.value
                      setMatchRules(newMatchRules)
                    }}
                  />
                </div>
                <div className="hidden sm:block">
                  <ArrowLongRightIcon className="icon-sm" />
                </div>
                <div className="sm:hidden">
                  <ArrowLongDownIcon className="icon-sm" />
                </div>
                <div className="flex-grow">
                  <Autocomplete<Account>
                    inputWrapperClass="relative mt-0"
                    groups={accountGroups}
                    allowNewCreation={false}
                    itemLabel={account => safeName(account, 'account')}
                    itemId={account => account.id}
                    label={t('accounts.account')}
                    labelClass="sr-only"
                    onChange={account => {
                      let newMatchRules = [...matchRules]
                      const ruleIndex = matchRules.findIndex(
                        rule => rule.id === matchRule.id
                      )
                      newMatchRules[ruleIndex].accountId = account.id
                      setMatchRules(newMatchRules)
                    }}
                    value={
                      (accounts.find(
                        account => account.id === matchRule.accountId
                      ) as Account) || ''
                    }
                  />
                </div>
              </div>
              <button
                title={t('delete')}
                onClick={() => deleteMatchRule(matchRule.id)}
              >
                <TrashIcon className="icon-sm icon-red sm:invisible group-hover:visible" />
              </button>
            </div>
          ))}
        </ReactSortable>
      ) : (
        <div>{t('matchRules.emptyList')}</div>
      )}
    </>
  )
}

export default MatchRuleList

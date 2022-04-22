import { Budget } from '../types'

const getBudgets = async () => {
  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/budgets`)
    .then(res => res.json())
    .then((data: { data: Budget[] }) => data.data)
}

const getBudget = async (id: string) => {
  return {
    id: 3,
    createdAt: '2022-04-21T20:14:44.166976142Z',
    updatedAt: '2022-04-22T12:45:14.027518488Z',
    name: 'Morre',
    note: 'and this one even has a note (not description, oops)',
    currency: '€',
  }
}

export { getBudgets, getBudget }

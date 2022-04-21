const getBudgets = async () => {
  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/budgets`)
    .then(res => res.json())
    .then(data => data.data)
}

export default getBudgets

type ApiLinks = { [key: string]: string }

export type Translation = { t: (key: string) => string }

export type UnpersistedBudget = {
  name?: string
  currency?: string
  note?: string
}

export type Budget = UnpersistedBudget & { id: number; links: ApiLinks }

export type UnpersistedAccount = {
  balance?: number
  reconciledBalance?: number
  external?: boolean
  name?: string
  note?: string
  onBudget?: boolean
}

export type BudgetApiConnection = {
  updateBudget: (budget: Budget) => Promise<Budget>
  deleteBudget: (budget: Budget) => void
  getBudgets: () => Promise<Budget[]>
  getBudget: (id: number | string) => Promise<Budget>
  createBudget: (data: UnpersistedBudget) => Promise<Budget>
}

export type Account = UnpersistedAccount & {
  id: number
  budgetId: number
  links: ApiLinks
}

export type ApiResponse<T> = {
  data?: T
  error?: any // TODO
}

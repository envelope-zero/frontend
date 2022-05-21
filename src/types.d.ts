type ApiLinks = { [key: string]: string }

// Example for a UUID: 6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b
type UUID = string

export type Translation = { t: (key: string) => string }

export type UnpersistedBudget = {
  name?: string
  currency?: string
  note?: string
}

export type Budget = UnpersistedBudget & { id: UUID; links: ApiLinks }

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
  getBudget: (id: UUID | string) => Promise<Budget>
  createBudget: (data: UnpersistedBudget) => Promise<Budget>
}

export type Account = UnpersistedAccount & {
  id: UUID
  budgetId: UUID
  links: ApiLinks
}

export type ApiResponse<T> = {
  data?: T
  error?: string
}

export type UnpersistedTransaction = {
  amount?: number
  date?: string
  reconciled?: boolean
  note?: string
  destinationAccountId?: UUID
  sourceAccountId?: UUID
  envelopeId?: number
}

export type Transaction = UnpersistedTransaction & {
  id: UUID
  amount: number
  date: string
  destinationAccountId: UUID
  sourceAccountId: UUID
  budgetId: UUID
  links: ApiLinks
}

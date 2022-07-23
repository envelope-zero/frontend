type ApiLinks = { [key: string]: string }

// Example for a UUID: 6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b
type UUID = string

export type Translation = {
  t: (key: string, params?: { [key: string]: string }) => string
}

export type UnpersistedBudget = {
  name?: string
  currency?: string
  note?: string
}

export type Budget = UnpersistedBudget &
  ApiObject & {
    balance: number
  }

export type UnpersistedAccount = {
  external?: boolean
  name?: string
  note?: string
  onBudget?: boolean
}

export type BudgetApiConnection = {
  updateBudget: (budget: Budget) => Promise<Budget>
  deleteBudget: (budget: Budget) => void
  getBudgets: () => Promise<Budget[]>
  getBudget: (id: UUID) => Promise<Budget>
  createBudget: (data: UnpersistedBudget) => Promise<Budget>
}

export type Account = UnpersistedAccount &
  ApiObject & {
    balance: number
    reconciledBalance: number
    budgetId: UUID
  }

export type ApiResponse<T> = {
  data?: T
  error?: string
}

export type ApiObject = {
  id: UUID
  links: ApiLinks
}

export type UnpersistedTransaction = {
  amount?: number
  date?: string
  reconciled?: boolean
  note?: string
  destinationAccountId?: UUID
  sourceAccountId?: UUID
  envelopeId?: UUID
}

export type Transaction = UnpersistedTransaction &
  ApiObject & {
    amount: number
    date: string
    destinationAccountId: UUID
    sourceAccountId: UUID
    budgetId: UUID
  }

export type Category = ApiObject & {
  budgetId: UUID
  name: string
  note: string
  envelopes: Envelope[]
}

export type UnpersistetEnvelope = {
  name?: string
  note?: string
  categoryId?: UUID
}

export type Envelope = UnpersistetEnvelope &
  ApiObject & {
    name: string
    note: string
    categoryId: UUID
  }

type ApiLinks = { [key: string]: string }

// Example for a UUID: 6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b
type UUID = string

export type Translation = {
  t: (key: string, params?: { [key: string]: string | number }) => string
}

export type UnpersistedBudget = {
  name?: string
  currency?: string
  note?: string
}

export type Budget = UnpersistedBudget &
  ApiObject & {
    balance: string
  }

export type UnpersistedAccount = {
  external?: boolean
  name?: string
  note?: string
  onBudget?: boolean
  initialBalance?: string
  initialBalanceDate?: string
  hidden?: boolean
}

export type ApiConnection<T> = {
  getAll: (parent: ApiObject, filterOptions: FilterOptions) => Promise<T>
  get: (id: UUID, parent: ApiObject) => Promise<T>
  update: (object: T, url?: string) => Promise<T>
  create: (object: T, budget: Budget, url?: string) => Promise<T>
  delete: (
    object: ApiObject | undefined,
    options: { url?: string }
  ) => Promise<T>
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
    balance: string
    reconciledBalance: string
    budgetId: UUID
    recentEnvelopes: Envelope[]
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
  amount?: string
  date?: string
  reconciled?: boolean
  note?: string
  destinationAccountId?: UUID
  sourceAccountId?: UUID
  envelopeId?: UUID
}

export type Transaction = UnpersistedTransaction &
  ApiObject & {
    amount: string
    date: string
    destinationAccountId: UUID
    sourceAccountId: UUID
    budgetId: UUID
  }

export type GroupedTransactions = {
  [key: string]: Transaction[]
}

export type UnpersistedCategory = {
  name?: string
  note?: string
  hidden?: boolean
}

export type Category = UnpersistedCategory &
  ApiObject & {
    budgetId: UUID
    name: string
    note: string
    envelopes: Envelope[]
  }

export type CategoryMonth = Omit<Category, 'envelopes'> & {
  envelopes: EnvelopeMonth[]
  spent: string
  allocation: string
  balance: string
}

export type UnpersistedEnvelope = {
  name?: string
  note?: string
  categoryId?: UUID
  hidden?: boolean
}

export type Envelope = UnpersistedEnvelope &
  ApiObject & {
    name: string
    note: string
    categoryId: UUID
  }

export type EnvelopeMonth = Envelope & {
  allocation: string
  balance: string
  spent: string
  month: string
}

export type BudgetMonth = ApiObject & {
  name: string
  month: string // e.g. '2022-09-01T00:00:00Z' for the whole month of September 2022
  allocation: string
  spent: string
  income: string
  available: string
  balance: string
  categories: CategoryMonth[]
}

export type ArchivableResource = Account | Category | Envelope

export type FilterOptions = {
  account?: string
  envelope?: string
  external?: boolean
  hidden?: boolean
}

export type Translation = { t: (key: string) => string }

export type UnpersistedBudget = {
  name?: string
  currency?: string
  note?: string
}

export type Budget = UnpersistedBudget & {
  id: number
}

export type Account = {
  id: number
  budgetId: number
  balance?: number
  reconciledBalance?: number
  external?: true
  name?: string
  note?: string
  onBudget?: boolean
}

export type ApiResponse<T> = {
  data: T
  links?: { [key: string]: string }
}

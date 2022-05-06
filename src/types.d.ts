export type Translation = { t: (key: string) => string }

export type UnpersistedBudget = {
  name?: string
  currency?: string
  note?: string
}

export type Budget = UnpersistedBudget & {
  id: number
}

export type ApiResponse<T> = {
  data: T
  links?: { [key: string]: string }
}

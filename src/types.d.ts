export type Translation = { t: (key: string) => string }

export type Budget = {
  id: number
  name?: string
  currency?: string
  note?: string
}

import { Account } from '../types'
import { Translation } from '../types'

export const valueOrDefault = (customValue: any, defaultValue: any) => {
  if (typeof customValue === 'undefined') {
    return defaultValue
  }
  return customValue
}

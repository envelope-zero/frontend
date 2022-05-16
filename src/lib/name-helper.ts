import i18n from '../i18n'

const safeName = (object: any, type: string) => {
  return object?.name || `${i18n.t('untitled')} ${i18n.t(`${type}s.${type}`)}`
}

export { safeName }

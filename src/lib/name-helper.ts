import i18n from '../i18n'

const safeName = (object: any, type: string, translationOverride?: string) => {
  return (
    object?.name ||
    `${i18n.t('untitled')} ${translationOverride || i18n.t(`${type}s.${type}`)}`
  )
}

export { safeName }

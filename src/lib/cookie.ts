const get = (key: string) => {
  return document.cookie
    ?.replaceAll('; ', ';')
    .split(';')
    ?.find(row => row.startsWith(`${key}=`))
    ?.split('=')[1]
}

const set = (key: string, value: string) => {
  if (typeof get(key) !== 'undefined') {
    erase(key)
  }
  document.cookie = `${key}=${value}; SameSite=Strict`
}

const erase = (key: string) => {
  document.cookie = key + '=; Max-Age=-99999999; SameSite=Strict'
}

const cookie = {
  get,
  set,
  erase,
}

export default cookie

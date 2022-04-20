const cookie = {
  get: (key: string) => {
    return document.cookie
      ?.split(';')
      ?.find(row => row.startsWith(`${key}=`))
      ?.split('=')[1]
  },
  set: (key: string, value: string) => {
    document.cookie = `${key}=${value}`
  },
}

export default cookie

const submitOnMetaEnter = (e: React.KeyboardEvent<HTMLFormElement>) => {
  if (e.code === 'Enter' && (e.metaKey || e.ctrlKey)) {
    const target = e.target as HTMLInputElement
    target?.form?.requestSubmit()
  }
}

export default submitOnMetaEnter

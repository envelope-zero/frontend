const InputCurrency = (props: { currency?: string }) => {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
        {props.currency || ''}
      </span>
    </div>
  )
}

export default InputCurrency

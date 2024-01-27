const LoadingSpinner = () => {
  return (
    <div className="flex w-full justify-center p-4" id="loading">
      <div
        style={{ borderTopColor: 'transparent' }}
        className="h-8 w-8 animate-spin rounded-full border-4 border-dotted border-gray-600 dark:border-gray-400"
      ></div>
    </div>
  )
}

export default LoadingSpinner

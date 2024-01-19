import { useEffect, useState } from 'react'

type Props = {
  children: React.ReactNode
  batchSize: number
  onLoadMore: (offset: number) => Promise<boolean>
}

const InfiniteScroll = ({ children, batchSize, onLoadMore }: Props) => {
  const [batchOffset, setBatchOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // load more items whenever batchOffset is changed
  useEffect(() => {
    // don't run on initial render or when there are no more items to load
    if (batchOffset !== 0 && hasMore) {
      onLoadMore(batchOffset).then(setHasMore)
    }
  }, [batchOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  const onScroll = () => {
    const scrollTop = document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight

    if (scrollTop + clientHeight >= scrollHeight) {
      setBatchOffset(batchOffset + batchSize)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  })

  return children
}

export default InfiniteScroll

import { useEffect, useState } from 'react'

// 비동기 함수 하나의 { data, loading, error, reload } 를 관리 (deps 가 바뀌거나 reload() 하면 다시 호출)
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: '' }))
    fn()
      .then((data) => alive && setState({ data, loading: false, error: '' }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { ...state, reload: () => setTick((t) => t + 1) }
}

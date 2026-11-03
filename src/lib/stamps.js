import { useCallback, useSyncExternalStore } from 'react'

// 올레 코스 스탬프: 이 브라우저에만 저장돼요 (localStorage). 같은 화면의 여러 컴포넌트가 함께 바뀌게 외부 저장소 방식으로 구독해요.
const KEY = 'tamna-olle-stamps'
const listeners = new Set()
let cache = null

function read() {
  if (cache) return cache
  try { cache = JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { cache = [] }
  return cache
}
function write(list) {
  cache = list
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* 저장이 막혀 있어도 화면에서는 동작해요 */ }
  listeners.forEach((fn) => fn())
}
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }

export function useStamps() {
  const stamps = useSyncExternalStore(subscribe, read, () => [])
  const toggle = useCallback((no) => {
    const cur = read()
    write(cur.includes(no) ? cur.filter((n) => n !== no) : [...cur, no])
  }, [])
  return { stamps, has: (no) => stamps.includes(no), toggle }
}

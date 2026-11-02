import { useEffect, useState } from 'react'
import { fetchWeather } from '../api/client'

export function useWeather(place = '제주시') {
  const [state, setState] = useState({ slots: [], loading: true, error: '' })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: '' }))
    fetchWeather(place)
      .then((slots) => alive && setState({ slots, loading: false, error: '' }))
      .catch((e) => alive && setState({ slots: [], loading: false, error: e.message }))
    return () => { alive = false }
  }, [place, tick])
  return { ...state, reload: () => setTick((t) => t + 1) }
}

import { useEffect, useState } from 'react'
import { fetchHeritage, fetchPlaces, fetchSnowCctv } from '../api/client'
import { SPOTS } from '../data/spots'
import { spotSetsOf } from '../data/themes'
import { olleRoutes } from '../data/olle'
import { heritageToPins, spotToPins, tourToPins } from '../lib/pins'

// 테마 하나로 공공 API 2개(관광·유산)를 동시에 호출하고, 테마 고정 핀(오름·4·3 희생지)을 더해 3D 핀 목록으로 돌려줍니다.
export function useThemePins(theme) {
  const [state, setState] = useState({ pins: [], routes: [], loading: true, error: '' })

  useEffect(() => {
    let alive = true
    const seen = new Set() // 같은 장소가 두 묶음에 있으면 먼저 나온 묶음(신화·설화)만 표시
    const spots = spotSetsOf(theme).flatMap((s) => spotToPins(SPOTS[s.key], s.color, s.label)).filter((p) => !seen.has(p.title) && seen.add(p.title))
    const routes = theme.routes === 'olle' ? olleRoutes() : []
    if (theme.cctv) { // 도로 CCTV: 적설 감시 CCTV 위치를 핀으로
      setState({ pins: [], routes: [], loading: true, error: '' })
      fetchSnowCctv()
        .then((list) => alive && setState({ pins: list.map((c) => ({ key: `cctv-${c.id}`, source: 'cctv', id: `cctv-${c.id}`, title: c.name, sub: '제주시 적설 감시 CCTV', url: c.url, lat: c.lat, lng: c.lng, color: theme.color, label: 'CCTV' })), routes: [], loading: false, error: '' }))
        .catch((e) => alive && setState({ pins: [], routes: [], loading: false, error: e.message }))
      return () => { alive = false }
    }
    setState({ pins: spots, routes, loading: !theme.spotsOnly, error: '' }) // 고정 핀은 API 를 기다리지 않고 바로 표시
    if (theme.spotsOnly) return () => { alive = false } // 4·3 은 희생지 핀만 표시 (관광·유산 API 결과는 섞지 않음)
    // noHeritage 테마(오름)는 국가유산(파란 핀)을 섞지 않음
    Promise.allSettled([fetchPlaces(theme.keyword, '', 100), theme.noHeritage ? Promise.resolve([]) : fetchHeritage(theme.heritageKeyword)]) .then(([tour, heri]) => {
      if (!alive) return
      setState({
        routes,
        loading: false,
        pins: [
          ...spots,
          ...(tour.status === 'fulfilled' ? tourToPins(tour.value) : []),
          ...(heri.status === 'fulfilled' ? heritageToPins(heri.value) : []),
        ],
        error: !spots.length && tour.status === 'rejected' && heri.status === 'rejected' ? tour.reason.message : '',
      })
    })
    return () => { alive = false }
  }, [theme.keyword, theme.heritageKeyword, theme.spots, theme.spotsOnly, theme.spotSets, theme.noHeritage, theme.routes, theme.cctv])

  return state
}

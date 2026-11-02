import { useState } from 'react'
import Chips from '../components/Chips'
import ItemCard from '../components/ItemCard'
import { ApiError, Empty, Loading } from '../components/Status'
import { fetchHeritage, fetchPlaces } from '../api/client'
import { PLACE_TYPES, themeOf } from '../data/themes'
import { useAsync } from '../hooks/useAsync'
import { useWeather } from '../hooks/useWeather'
import { fieldVerdict, hourLabel, weatherIcon } from '../lib/weather'
import { useAppStore } from '../store/useAppStore'

// 주제별 정보 (옛 이름: 소재 키트) = 한 테마를 3개 공공 API 로 입체적으로 살펴보는 화면
//   ① 뿌리(국가유산청) ② 보러 갈 곳(한국관광공사) ③ 답사 날씨(기상청)
export default function Kit() {
  const { themeKey, setThemeKey, addNote } = useAppStore()
  const theme = themeOf(themeKey)
  const [type, setType] = useState('14')
  const [place, setPlace] = useState('서귀포시')

  const heritage = useAsync(() => fetchHeritage(theme.heritageKeyword), [theme.heritageKeyword])
  const places = useAsync(() => fetchPlaces(theme.keyword, type), [theme.keyword, type])
  const weather = useWeather(place)
  const verdict = fieldVerdict(weather.slots)

  return (
    <div className="page">
      <header className="page-head">
        <h1><i className="bi bi-box2-heart" />주제별 정보</h1>
        <p className="muted">오름·신화·4·3 같은 주제를 고르면 역사 배경, 가볼 만한 곳, 날씨를 한 번에 보여줘요.</p>
        <Chips value={theme.key} onChange={setThemeKey} />
      </header>

      <section className="kit-hero glass" style={{ '--c': theme.color }}>
        <div>
          <h2><i className={`bi bi-${theme.icon}`} />{theme.label}</h2>
          <p>{theme.blurb}</p>
          {theme.sensitive && <p className="notice"><i className="bi bi-heart-pulse" />민감한 역사예요. 확인된 사실만 쓰고, 추모와 존중의 톤을 지켜 주세요.</p>}
        </div>
        <div>
          <div className="eyebrow">이런 작업으로 이어져요</div>
          <ul className="ideas">{theme.ideas.map((t) => <li key={t}><i className="bi bi-lightbulb" />{t}</li>)}</ul>
        </div>
      </section>

      <section className="kit-block">
        <div className="block-head">
          <h2><i className="bi bi-cloud-sun" />답사 날씨</h2>
          <div className="seg">
            {['제주시', '서귀포시'].map((p) => (
              <button key={p} type="button" className={place === p ? 'on' : ''} onClick={() => setPlace(p)}>{p}</button>
            ))}
          </div>
        </div>
        {weather.loading ? <Loading text="기상청 예보 확인 중…" /> : weather.error ? <ApiError error={weather.error} onRetry={weather.reload} /> : (
          <>
            {verdict && <div className={`verdict ${verdict.tone}`}><i className={`bi bi-${verdict.icon}`} />{verdict.text}</div>}
            <div className="slots">
              {weather.slots.map((w) => (
                <div key={w.time} className="slot">
                  <span className="muted">{hourLabel(w.time)}</span>
                  <i className={`bi bi-${weatherIcon(w)}`} />
                  <strong>{w.temp}℃</strong>
                  <small>{w.rain !== '없음' ? w.rain : w.sky}</small>
                  <div className="pop" title={`강수확률 ${w.pop}%`}><span style={{ width: `${w.pop}%` }} /></div>
                  <small className="muted">{w.pop}%</small>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="kit-block">
        <div className="block-head">
          <h2><i className="bi bi-bank2" />소재의 뿌리 · 국가유산</h2>
        </div>
        <ApiError error={heritage.error} onRetry={heritage.reload} />
        {heritage.loading || heritage.error ? (heritage.loading ? <Loading /> : null) : !heritage.data?.length ? (
          <Empty text={`‘${theme.heritageKeyword || theme.label}’ 관련 국가유산 검색 결과가 없어요.`} />
        ) : (
          <div className="cards">
            {heritage.data.map((h) => (
              <ItemCard key={h.id} tone="heritage" title={h.name} subtitle={h.city} badge={h.kind}
                onSave={() => addNote({ source: 'heritage', id: h.id, title: h.name })} />
            ))}
          </div>
        )}
      </section>

      <section className="kit-block">
        <div className="block-head">
          <h2><i className="bi bi-geo-alt" />직접 보러 갈 곳</h2>
          <div className="seg">
            {Object.entries(PLACE_TYPES).map(([v, label]) => (
              <button key={v} type="button" className={type === v ? 'on' : ''} onClick={() => setType(v)}>{label}</button>
            ))}
          </div>
        </div>
        <ApiError error={places.error} onRetry={places.reload} />
        {places.loading || places.error ? (places.loading ? <Loading /> : null) : !places.data?.length ? (
          <Empty text={`‘${theme.keyword || '제주'}’ ${PLACE_TYPES[type]} 검색 결과가 없어요. 다른 분류를 눌러 보세요.`} />
        ) : (
          <div className="cards">
            {places.data.map((p) => (
              <ItemCard key={p.id} title={p.title} subtitle={p.addr} image={p.image} badge={PLACE_TYPES[p.type]}
                onSave={() => addNote({ source: 'tour', id: p.id, title: p.title })} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

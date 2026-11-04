import { fetchNews } from '../../api/client'
import { useAsync } from '../../hooks/useAsync'
import { ApiError, Empty, Loading } from '../Status'

// 오늘의 제주 뉴스: 제주 지역 언론사 6곳의 공개 RSS 최신 기사 제목. 누르면 해당 언론사 기사로 이동해요.
const ago = (at) => {
  const m = Math.max(0, Math.round((Date.now() - at) / 60000))
  return m < 60 ? `${m || 1}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`
}

export default function NewsFeed() {
  const st = useAsync(fetchNews, [])
  if (st.loading) return <Loading text="제주 뉴스를 불러오는 중…" />
  if (st.error) return <ApiError error={st.error} onRetry={st.reload} />
  if (!st.data.items.length) return <Empty text="불러온 뉴스가 없어요." />
  return (
    <>
      <ul className="news-list">
        {st.data.items.map((n) => (
          <li key={n.link}>
            <a href={n.link} target="_blank" rel="noreferrer">{n.title}</a>
            <span className="muted small">{n.source}{n.at ? ` · ${ago(n.at)}` : ''}</span>
          </li>
        ))}
      </ul>
      <p className="muted small">제주일보·제민일보·제주의소리·헤드라인제주·뉴제주일보·제주투데이가 공개한 최신 기사 제목이에요. 5분마다 새로 불러오고, 누르면 각 언론사 기사로 이동해요.</p>
    </>
  )
}

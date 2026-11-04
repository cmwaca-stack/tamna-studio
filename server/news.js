// 오늘의 제주 뉴스 — 제주 지역 언론사 6곳이 공개한 RSS(전체 기사)를 모아 최신순으로 보여 줘요. 제목과 원문 링크만 쓰고, 기사 본문은 가져오지 않아요.
import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false })
const FEEDS = [
  ['제주일보', 'https://www.jejunews.com/rss/allArticle.xml'],
  ['제민일보', 'https://www.jemin.com/rss/allArticle.xml'],
  ['제주의소리', 'https://www.jejusori.net/rss/allArticle.xml'],
  ['헤드라인제주', 'https://www.headlinejeju.co.kr/rss/allArticle.xml'],
  ['뉴제주일보', 'https://www.newsjeju.net/rss/allArticle.xml'],
  ['제주투데이', 'https://www.ijejutoday.com/rss/allArticle.xml'],
]
let cache = null // 5분 보관

const toList = (v) => (!v ? [] : Array.isArray(v) ? v : [v])
const clean = (s) => String(s ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()

async function readFeed([source, url]) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (TamnaStudio)' }, signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`${source} ${res.status}`)
  const xml = parser.parse(await res.text())
  return toList(xml?.rss?.channel?.item).map((it) => ({
    title: clean(it.title), link: clean(it.link), source, at: Date.parse(it.pubDate ?? it['dc:date'] ?? '') || 0,
  })).filter((x) => x.title && /^https?:/.test(x.link))
}

export async function getNews() {
  if (cache && Date.now() - cache.at < 5 * 60e3) return cache.data
  const results = await Promise.allSettled(FEEDS.map(readFeed))
  const items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
  if (!items.length) throw new Error('제주 언론사 뉴스를 불러오지 못했어요')
  const seen = new Set()
  const data = {
    sources: results.filter((r) => r.status === 'fulfilled').length,
    items: items.filter((x) => (seen.has(x.title) ? false : seen.add(x.title))).sort((a, b) => b.at - a.at).slice(0, 40),
  }
  cache = { at: Date.now(), data }
  return data
}

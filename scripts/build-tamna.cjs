// 제주특별자치도 "탐나는전 가맹점 데이터"(data.go.kr 15157894, 2026-03-31 기준 CSV, EUC-KR)를 사이트용 public/tamna.json 으로 줄여요.
// 실행: node scripts/build-tamna.cjs <내려받은 csv 경로>
const fs = require('fs')
const path = require('path')
const src = process.argv[2]
if (!src) { console.log('사용법: node scripts/build-tamna.cjs <csv>'); process.exit(1) }
const text = new TextDecoder('euc-kr').decode(fs.readFileSync(src))

// 따옴표 안의 쉼표·줄바꿈을 지키는 간단한 CSV 읽기
function parse(t) {
  const rows = []; let row = [], cur = '', q = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.length > 1 || row[0]) rows.push(row); row = [] }
    else cur += c
  }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  return rows
}
const [head, ...body] = parse(text)
console.log('열', head.join(' | '), '/ 행', body.length)

const cats = []
const catIdx = (n) => { const k = n.trim() || '기타'; let i = cats.indexOf(k); if (i < 0) { cats.push(k); i = cats.length - 1 } return i }
const seen = new Set()
const rows = []
for (const r of body) {
  const [name, addr, cat, cash, qr, kid] = r.map((x) => x.trim())
  if (!name || !addr) continue
  const key = `${name}|${addr}`
  if (seen.has(key)) continue
  seen.add(key)
  // 주소 앞의 '제주특별자치도 ' 는 빼서 파일을 줄여요. 비트: 1 캐시백·인센티브, 2 QR, 4 아동건강체험활동비
  rows.push([name, addr.replace(/^제주특별자치도\s*/, ''), catIdx(cat), (cash === 'Y' ? 1 : 0) | (qr === 'Y' ? 2 : 0) | (kid === 'Y' ? 4 : 0)])
}
const out = { asOf: '2026-03-31', source: '제주특별자치도 탐나는전 가맹점 데이터 (공공데이터포털 15157894)', cats, rows }
fs.writeFileSync(path.join(__dirname, '..', 'public', 'tamna.json'), JSON.stringify(out))
const count = (f) => rows.filter(f).length
console.log('가맹점', rows.length, '/ 업종', cats.length, cats.join(','), '/ 캐시백', count((r) => r[3] & 1), '/ QR', count((r) => r[3] & 2), '/ 아동', count((r) => r[3] & 4))
console.log('크기', (fs.statSync(path.join(__dirname, '..', 'public', 'tamna.json')).size / 1e6).toFixed(2), 'MB')

// 카카오(다음)지도 링크. 이름에 / , : < > ? # 같은 글자가 있으면 카카오가 오류 페이지(404·502)로 보내서, 이름을 안전하게 다듬어 써요.
export const mapName = (t) => String(t ?? '').replace(/[/,:;?#%<>()[\]《》「」『』〈〉"'“”‘’]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40) || '장소'
export const mapLink = (name, lat, lng) => `https://map.kakao.com/link/map/${encodeURIComponent(mapName(name))},${lat},${lng}`
export const mapSearch = (q) => `https://map.kakao.com/?q=${encodeURIComponent(q)}`

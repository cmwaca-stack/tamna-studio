// 카카오 지도 SDK 를 한 번만 불러와요. 키: .env.local 의 VITE_KAKAO_JS_KEY
export const KAKAO_KEY = import.meta.env.VITE_KAKAO_JS_KEY

let loader = null
export function loadKakao() {
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    if (window.kakao?.maps?.load) { window.kakao.maps.load(() => resolve(window.kakao)); return }
    const s = document.createElement('script')
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`
    s.async = true
    s.referrerPolicy = 'no-referrer' // 이 사이트 화면에서 보내는 Referer 때문에 카카오가 스크립트를 거절하는 경우가 있어 보내지 않아요
    s.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    s.onerror = () => { loader = null; reject(new Error('카카오 지도 프로그램(sdk.js)을 받지 못했어요 — 키·사이트 주소 등록 또는 광고 차단 확인')) }
    document.head.appendChild(s)
  })
  return loader
}

export const NO_KEY_HELP = '카카오 개발자 사이트(developers.kakao.com)의 내 앱 → 플랫폼 키에서 JavaScript 키를 복사해 .env.local 에 VITE_KAKAO_JS_KEY=키값 으로 넣고 서버를 다시 켜세요. (사이트 주소 등록도 필요해요)'

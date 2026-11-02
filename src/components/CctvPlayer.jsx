import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

// CCTV 영상: .m3u8(HLS) 스트림을 재생. 재생이 안 되면 새 창 링크로 열 수 있게 함
export default function CctvPlayer({ url }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    setFailed(false)
    if (v.canPlayType('application/vnd.apple.mpegurl')) { v.src = url; return }
    if (!Hls.isSupported()) { setFailed(true); return }
    const hls = new Hls()
    const timer = setTimeout(() => { if (v.readyState < 2) setFailed(true) }, 12000) // 12초 안에 안 나오면 안내
    hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) setFailed(true) })
    hls.loadSource(url)
    hls.attachMedia(v)
    return () => { clearTimeout(timer); hls.destroy() }
  }, [url])
  return (
    <div className="cctv-player">
      <video ref={ref} controls muted autoPlay playsInline />
      {failed && <p className="notice"><i className="bi bi-exclamation-triangle" />영상 서버가 응답하지 않아요(점검 중이거나 제주 외 접속을 막을 수 있어요). <a href="https://www.jejuits.go.kr" target="_blank" rel="noreferrer">제주 교통정보센터에서 보기</a></p>}
    </div>
  )
}

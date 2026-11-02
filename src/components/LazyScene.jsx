import { Component, lazy, Suspense } from 'react'

// three.js 는 무거우니 3D 화면이 필요할 때만 불러옵니다 (첫 로딩 속도 ↑)
const Scene3D = lazy(() => import('./Scene3D'))

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed
      ? <div className="scene-fallback"><i className="bi bi-exclamation-octagon" /><p>3D 화면을 그리지 못했어요.<br />브라우저의 하드웨어 가속(WebGL)을 확인해 보세요.</p></div>
      : this.props.children
  }
}

export default function LazyScene(props) {
  return (
    <SceneBoundary>
      <Suspense fallback={<div className="scene-fallback"><i className="bi bi-hourglass-split" /><p>3D 제주를 불러오는 중…</p></div>}>
        <Scene3D {...props} />
      </Suspense>
    </SceneBoundary>
  )
}

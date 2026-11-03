import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page narrow center">
      <i className="bi bi-compass big" />
      <h1>길을 잃었어요</h1>
      <p className="muted">주소가 없는 페이지예요. 홈에서 다시 출발해 보세요.</p>
      <Link to="/" className="btn btn-primary">홈으로 돌아가기</Link>
    </div>
  )
}

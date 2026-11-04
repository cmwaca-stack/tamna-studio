import { useState } from 'react'
import { shipCompany } from '../../data/shipCompanies'

// 선사 공식 마크 (없거나 불러오지 못하면 이름 첫 글자)
export default function CompanyMark({ name }) {
  const [broken, setBroken] = useState(false)
  const logo = shipCompany(name)?.logo
  if (!logo || broken) return <span className="amark amark-fallback" aria-hidden="true">{String(name ?? '?').replace(/\(주\)/, '').trim().charAt(0)}</span>
  return <img className="smark" src={logo} alt="" height="20" loading="lazy" onError={() => setBroken(true)} />
}

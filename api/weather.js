import { getWeather, getWeatherAll } from '../server/weather.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=900')
    const data = req.query.place === 'all' ? await getWeatherAll() : await getWeather({ place: req.query.place })
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

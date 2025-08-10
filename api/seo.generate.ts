import { logEvent } from '../lib/events'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { keyword, city, service } = req.body

      // Generate fake URL for stub
      const slug = `${service.replace(/\s+/g, '-')}-${city.toLowerCase()}-${keyword.replace(/\s+/g, '-')}`
      const url = `https://example.com/${slug}`

      await logEvent('seo.generated', {
        keyword,
        city,
        service,
        url
      })

      res.json({ url, status: 'generated' })
    } catch (error) {
      await logEvent('error', { route: '/api/seo.generate', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

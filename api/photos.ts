import { supabaseAdmin } from '../lib/supabase'
import { logEvent } from '../lib/events'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { lead_id } = req.query
      
      const { data: photos, error } = await supabaseAdmin
        .from('photos')
        .select('*')
        .eq('lead_id', lead_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      res.json(photos)
    } catch (error) {
      await logEvent('error', { route: '/api/photos', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { lead_id, urls } = req.body

      const photoInserts = urls.map(url => ({
        lead_id,
        url,
        ai_notes: null
      }))

      const { data: photos, error } = await supabaseAdmin
        .from('photos')
        .insert(photoInserts)
        .select()

      if (error) throw error

      await logEvent('photos.uploaded', { count: urls.length }, lead_id)
      res.json(photos)
    } catch (error) {
      await logEvent('error', { route: '/api/photos', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

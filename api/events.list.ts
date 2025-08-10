import { supabaseAdmin } from '../lib/supabase'
import { logEvent } from '../lib/events'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { lead_id, type } = req.query

      let query = supabaseAdmin
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (lead_id) {
        query = query.eq('lead_id', lead_id)
      }

      if (type) {
        query = query.eq('type', type)
      }

      const { data: events, error } = await query

      if (error) throw error
      res.json(events)
    } catch (error) {
      await logEvent('error', { route: '/api/events.list', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

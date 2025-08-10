import { supabaseAdmin } from '../lib/supabase'
import { logEvent } from '../lib/events'
import { listMessages } from '../lib/twilio'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { lead_id } = req.query

      // Get lead with conversation_sid
      const { data: lead, error: leadError } = await supabaseAdmin
        .from('leads')
        .select('conversation_sid')
        .eq('id', lead_id)
        .single()

      if (leadError) throw leadError

      let messages = []

      // Try to get messages from Twilio first
      if (lead.conversation_sid) {
        try {
          messages = await listMessages(lead.conversation_sid)
        } catch (twilioError) {
          console.error('Twilio error, falling back to database:', twilioError)
        }
      }

      // Fallback to database messages
      if (messages.length === 0) {
        const { data: dbMessages, error: msgError } = await supabaseAdmin
          .from('messages')
          .select('*')
          .eq('lead_id', lead_id)
          .order('created_at', { ascending: true })

        if (msgError) throw msgError
        messages = dbMessages
      }

      res.json(messages)
    } catch (error) {
      await logEvent('error', { route: '/api/conversations.get', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

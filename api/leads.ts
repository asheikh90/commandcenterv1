import { supabaseAdmin } from '../lib/supabase'
import { logEvent } from '../lib/events'
import { getOrCreateConversation } from '../lib/twilio'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: leads, error } = await supabaseAdmin
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      res.json(leads)
    } catch (error) {
      await logEvent('error', { route: '/api/leads', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, phone, vehicle, source, city } = req.body

      // Upsert lead by phone
      const { data: lead, error } = await supabaseAdmin
        .from('leads')
        .upsert({
          name,
          phone,
          vehicle,
          source,
          city
        }, {
          onConflict: 'phone',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) throw error

      // Create conversation if missing
      if (!lead.conversation_sid) {
        try {
          const conversationSid = await getOrCreateConversation(phone)
          await supabaseAdmin
            .from('leads')
            .update({ conversation_sid: conversationSid })
            .eq('id', lead.id)
          
          lead.conversation_sid = conversationSid
        } catch (twilioError) {
          console.error('Twilio error:', twilioError)
          // Continue without conversation_sid
        }
      }

      await logEvent('lead.created', { source }, lead.id)
      res.json(lead)
    } catch (error) {
      await logEvent('error', { route: '/api/leads', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

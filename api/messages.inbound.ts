import { supabaseAdmin } from '../lib/supabase'
import { logEvent } from '../lib/events'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // TODO: Verify Twilio signature
      const { From, Body, ConversationSid } = req.body

      // Find or create lead by phone
      const { data: lead, error: leadError } = await supabaseAdmin
        .from('leads')
        .upsert({
          name: 'Inbound Lead',
          phone: From,
          vehicle: 'Unknown',
          source: 'sms',
          city: process.env.SHOP_CITY || 'Philadelphia',
          conversation_sid: ConversationSid
        }, {
          onConflict: 'phone',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (leadError) throw leadError

      // Save message
      const { error: msgError } = await supabaseAdmin
        .from('messages')
        .insert({
          lead_id: lead.id,
          direction: 'inbound',
          channel: 'sms',
          body: Body
        })

      if (msgError) throw msgError

      await logEvent('msg.inbound', { body: Body.substring(0, 100) }, lead.id)
      res.status(200).send('OK')
    } catch (error) {
      await logEvent('error', { route: '/api/messages.inbound', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

import { supabaseAdmin } from '../lib/supabase'
import { logEvent } from '../lib/events'
import { getOrCreateConversation, sendMessage } from '../lib/twilio'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { lead_id, body } = req.body

      // Get lead info
      const { data: lead, error: leadError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', lead_id)
        .single()

      if (leadError) throw leadError

      // Ensure conversation exists
      let conversationSid = lead.conversation_sid
      if (!conversationSid) {
        conversationSid = await getOrCreateConversation(lead.phone)
        await supabaseAdmin
          .from('leads')
          .update({ conversation_sid: conversationSid })
          .eq('id', lead_id)
      }

      // Send message via Twilio
      await sendMessage(conversationSid, body)

      // Log message in database
      const { error: msgError } = await supabaseAdmin
        .from('messages')
        .insert({
          lead_id,
          direction: 'outbound',
          channel: 'sms',
          body
        })

      if (msgError) throw msgError

      await logEvent('msg.outbound', { body: body.substring(0, 100) }, lead_id)
      res.json({ success: true })
    } catch (error) {
      await logEvent('error', { route: '/api/messages.send', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

import { supabaseAdmin } from './supabase'

export async function logEvent(type: string, payload: any, leadId?: string) {
  try {
    const { error } = await supabaseAdmin
      .from('events')
      .insert({
        type,
        payload,
        lead_id: leadId || null
      })

    if (error) {
      console.error('Failed to log event:', error)
    }
  } catch (error) {
    console.error('Error logging event:', error)
  }
}

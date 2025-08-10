import { supabaseAdmin } from '../lib/supabase'
import { logEvent } from '../lib/events'
import { describeDamage, writeReply } from '../lib/llm'
import { calculateEstimate } from '../lib/estimate'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { lead_id } = req.query
      
      const { data: quotes, error } = await supabaseAdmin
        .from('quotes')
        .select('*')
        .eq('lead_id', lead_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      res.json(quotes)
    } catch (error) {
      await logEvent('error', { route: '/api/quotes.draft', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { lead_id, imageUrls, system, size, panelsHint } = req.body

      // Analyze damage if images provided
      let damageInfo = {
        panels: panelsHint || 3,
        rust: false,
        bumper: true,
        notes: []
      }

      if (imageUrls && imageUrls.length > 0) {
        try {
          damageInfo = await describeDamage(imageUrls)
        } catch (error) {
          console.error('AI analysis failed, using defaults:', error)
        }
      }

      // Determine prep flags
      const prepFlags = []
      if (damageInfo.panels >= 4) prepFlags.push('sealer')
      if (damageInfo.panels >= 6) prepFlags.push('whole-car-sand')

      // Calculate estimate
      const estimate = calculateEstimate({
        size: size || 'car',
        system: system || 'single-stage',
        panels: damageInfo.panels,
        rust: damageInfo.rust,
        bumper: damageInfo.bumper,
        prepFlags
      })

      // Insert quote
      const { data: quote, error } = await supabaseAdmin
        .from('quotes')
        .insert({
          lead_id,
          low: estimate.low,
          high: estimate.high,
          system,
          prep_flags: prepFlags,
          rationale: estimate.rationale,
          upsells: estimate.upsells,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      // Generate draft reply
      const draftText = await writeReply({
        low: estimate.low,
        high: estimate.high,
        rationale: estimate.rationale,
        upsells: estimate.upsells,
        city: process.env.SHOP_CITY || 'Philadelphia',
        phone: process.env.SHOP_PHONE || '267-212-1034'
      })

      await logEvent('quote.drafted', { 
        quote_id: quote.id, 
        low: estimate.low, 
        high: estimate.high 
      }, lead_id)

      res.json({ quote, draft_text: draftText })
    } catch (error) {
      await logEvent('error', { route: '/api/quotes.draft', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

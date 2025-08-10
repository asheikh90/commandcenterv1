import { supabaseAdmin } from '../lib/supabase'
import { logEvent } from '../lib/events'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const importData = req.body
      let success = 0
      let errors = 0

      for (const item of importData) {
        try {
          // Create/update lead
          const { data: lead, error: leadError } = await supabaseAdmin
            .from('leads')
            .upsert({
              name: item.name,
              phone: item.phone,
              vehicle: item.vehicle,
              source: 'ccc',
              city: process.env.SHOP_CITY || 'Philadelphia'
            }, {
              onConflict: 'phone',
              ignoreDuplicates: false
            })
            .select()
            .single()

          if (leadError) throw leadError

          // Add photos if provided
          if (item.photos && item.photos.length > 0) {
            const photoInserts = item.photos.map(url => ({
              lead_id: lead.id,
              url,
              ai_notes: null
            }))

            await supabaseAdmin
              .from('photos')
              .insert(photoInserts)
          }

          // Create draft quote
          await supabaseAdmin
            .from('quotes')
            .insert({
              lead_id: lead.id,
              low: 1200,
              high: 1800,
              system: 'single-stage',
              prep_flags: ['sealer'],
              rationale: ['CCC import estimate'],
              upsells: ['Headlight restore $150'],
              status: 'draft'
            })

          success++
        } catch (error) {
          console.error('Import error for item:', item, error)
          errors++
        }
      }

      await logEvent('ccc.imported', { 
        count: importData.length, 
        success, 
        errors 
      })

      res.json({ count: importData.length, success, errors })
    } catch (error) {
      await logEvent('error', { route: '/api/ccc.import', message: error.message })
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

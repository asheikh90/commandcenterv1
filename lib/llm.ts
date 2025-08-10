import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function describeDamage(imageUrls: string[]) {
  try {
    const messages = [
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: 'Analyze these vehicle damage photos and return ONLY a JSON object with: panels (number of damaged panels), rust (boolean), bumper (boolean), notes (array of strings describing damage). Be precise and factual.'
          },
          ...imageUrls.map(url => ({
            type: 'image_url' as const,
            image_url: { url }
          }))
        ]
      }
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
      max_tokens: 500
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    return JSON.parse(content)
  } catch (error) {
    console.error('Error analyzing damage:', error)
    // Return fallback data
    return {
      panels: 3,
      rust: false,
      bumper: true,
      notes: ['Unable to analyze photos automatically']
    }
  }
}

export async function writeReply(ctx: {
  low: number
  high: number
  rationale: string[]
  upsells: string[]
  city: string
  phone: string
}) {
  try {
    const prompt = `Write a friendly, transparent quote message for a collision repair customer. Include:
    - Price range: $${ctx.low}-$${ctx.high}
    - Why this price: ${ctx.rationale.join(', ')}
    - Available add-ons: ${ctx.upsells.join(', ')}
    - End with: "Want me to text this from ${ctx.phone} and lock a spot?"
    
    Keep it conversational and advisory. Mention sanding helps paint stick and sealer prevents checkerboard look when relevant.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    })

    return response.choices[0]?.message?.content || `Most jobs like this run $${ctx.low}–$${ctx.high}. ${ctx.rationale.join(' ')} Want me to text this from ${ctx.phone} and lock a spot?`
  } catch (error) {
    console.error('Error writing reply:', error)
    return `Most jobs like this run $${ctx.low}–$${ctx.high}. ${ctx.rationale.join(' ')} Want me to text this from ${ctx.phone} and lock a spot?`
  }
}

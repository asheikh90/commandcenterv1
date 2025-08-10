interface EstimateInput {
  size: 'car' | 'truck' | 'xl' | 'van'
  system: 'single-stage' | 'bc-cc'
  panels: number
  rust: boolean
  bumper: boolean
  prepFlags: string[]
}

interface EstimateOutput {
  low: number
  high: number
  rationale: string[]
  upsells: string[]
}

export function calculateEstimate(input: EstimateInput): EstimateOutput {
  let low = 0
  let high = 0
  const rationale: string[] = []
  const upsells = ['Headlight restore $150', 'Trim blackout $200']

  // Base pricing
  if (input.system === 'single-stage') {
    low = 599
    high = 599
    rationale.push('Single-stage paint system')

    // Prep flags
    if (input.prepFlags.includes('whole-car-sand')) {
      low += 250
      high += 250
      rationale.push('Whole car sanding so the new paint sticks to the old')
    }
    
    if (input.prepFlags.includes('sealer')) {
      low += 379
      high += 379
      rationale.push('Sealer so it doesn\'t look like a checkerboard')
    }

    // Panel adjustment
    const panelAdj = Math.min(900, input.panels * 150)
    low += panelAdj
    high += panelAdj
    if (panelAdj > 0) {
      rationale.push(`${input.panels} panels need attention`)
    }

    // Ensure minimums
    low = Math.max(1100, low)
    high = Math.max(1500, high)
    
    // Typical target range
    if (high < 2000) high = Math.min(2000, high + 300)
  } else {
    // bc-cc system
    low = 1500
    high = 2000
    rationale.push('Factory-like basecoat/clearcoat system')

    if (input.prepFlags.includes('extra-coats')) {
      high += 400
      rationale.push('Extra coats for premium finish')
    }
  }

  // Size adjustments
  if (input.size === 'van' || input.size === 'xl') {
    low += 300
    high += 1000
    rationale.push('Oversize vehicle adjustment')
  }

  // Damage adjustments
  if (input.rust) {
    const rustAdj = Math.floor(Math.random() * 450) + 150 // 150-600
    low += rustAdj
    high += rustAdj
    rationale.push('Rust treatment required')
  }

  if (input.bumper) {
    const bumperAdj = Math.floor(Math.random() * 350) + 250 // 250-600
    low += bumperAdj
    high += bumperAdj
    rationale.push('Bumper repair/refinish')
  }

  return { low, high, rationale, upsells }
}

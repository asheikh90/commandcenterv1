import React, { useState } from 'react'
import { Upload, Calculator, Send } from 'lucide-react'

export default function Quote() {
  const [formData, setFormData] = useState({
    phone: '',
    vehicle: '',
    system: 'single-stage',
    size: 'car'
  })
  const [photos, setPhotos] = useState([])
  const [quote, setQuote] = useState(null)
  const [draftText, setDraftText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    // In a real app, you'd upload to Supabase storage here
    const photoUrls = files.map(file => URL.createObjectURL(file))
    setPhotos(photoUrls)
  }

  const generateQuote = async () => {
    setLoading(true)
    try {
      // First create/find lead
      const leadResponse = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Quote Request',
          phone: formData.phone,
          vehicle: formData.vehicle,
          source: 'quote-tool',
          city: 'Philadelphia'
        })
      })
      
      const lead = await leadResponse.json()

      // Generate quote
      const quoteResponse = await fetch('/api/quotes.draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          imageUrls: photos,
          system: formData.system,
          size: formData.size,
          panelsHint: 3
        })
      })

      const result = await quoteResponse.json()
      setQuote(result.quote)
      setDraftText(result.draft_text)
    } catch (error) {
      console.error('Failed to generate quote:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendQuote = async () => {
    if (!quote || !draftText) return

    setLoading(true)
    try {
      const response = await fetch('/api/messages.send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: quote.lead_id,
          body: draftText
        })
      })

      if (response.ok) {
        alert('Quote sent successfully!')
        // Reset form
        setFormData({ phone: '', vehicle: '', system: 'single-stage', size: 'car' })
        setPhotos([])
        setQuote(null)
        setDraftText('')
      }
    } catch (error) {
      console.error('Failed to send quote:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quote Engine</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote Form */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (267) 212-1034"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle
              </label>
              <input
                type="text"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2020 Honda Civic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paint System
              </label>
              <select
                name="system"
                value={formData.system}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="single-stage">Single-Stage</option>
                <option value="bc-cc">Basecoat/Clear</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Size
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="car">Car</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="xl">XL Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Damage Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  Click to upload photos
                </label>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
              </div>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Damage ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={generateQuote}
              disabled={loading || !formData.phone || !formData.vehicle}
              className="btn-primary w-full flex items-center justify-center"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Draft Quote'}
            </button>
          </div>
        </div>

        {/* Quote Preview */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quote Preview</h2>
          
          {quote ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-green-600">
                    ${quote.low} - ${quote.high}
                  </span>
                  <span className="text-sm text-gray-500">{formData.system}</span>
                </div>
                
                {quote.rationale && quote.rationale.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1">Why this price:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {quote.rationale.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {quote.upsells && quote.upsells.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Add-ons available:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {quote.upsells.map((upsell, index) => (
                        <li key={index}>• {upsell}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {draftText && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message Preview:</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-gray-700">{draftText}</p>
                  </div>
                </div>
              )}

              <button
                onClick={sendQuote}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Approve & Text
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Fill out the form and click "Draft Quote" to see preview
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

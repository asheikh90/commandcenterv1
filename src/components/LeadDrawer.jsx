import React, { useState, useEffect } from 'react'
import { X, Image, DollarSign, Send } from 'lucide-react'

export default function LeadDrawer({ lead, onClose, onUpdate }) {
  const [photos, setPhotos] = useState([])
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lead) {
      fetchLeadData()
    }
  }, [lead])

  const fetchLeadData = async () => {
    try {
      // Fetch photos and quotes for this lead
      const [photosRes, quotesRes] = await Promise.all([
        fetch(`/api/photos?lead_id=${lead.id}`),
        fetch(`/api/quotes?lead_id=${lead.id}`)
      ])
      
      const photosData = await photosRes.json()
      const quotesData = await quotesRes.json()
      
      setPhotos(photosData)
      setQuotes(quotesData)
    } catch (error) {
      console.error('Failed to fetch lead data:', error)
    }
  }

  const handleDraftQuote = async () => {
    setLoading(true)
    try {
      const imageUrls = photos.map(p => p.url)
      const response = await fetch('/api/quotes.draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          imageUrls,
          system: 'single-stage',
          size: 'car'
        })
      })
      
      if (response.ok) {
        await fetchLeadData()
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to draft quote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendDraft = async (quote) => {
    setLoading(true)
    try {
      const response = await fetch('/api/messages.send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          body: `Most jobs like this run $${quote.low}–$${quote.high}. ${quote.rationale.join(' ')} Want me to text this from 267-212-1034 and lock a spot?`
        })
      })
      
      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Lead Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-full pb-20">
          {/* Lead Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {lead.name}</p>
              <p><span className="font-medium">Phone:</span> {lead.phone}</p>
              <p><span className="font-medium">Vehicle:</span> {lead.vehicle}</p>
              <p><span className="font-medium">Source:</span> {lead.source}</p>
              <p><span className="font-medium">City:</span> {lead.city}</p>
            </div>
          </div>

          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt="Damage"
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Latest Quote */}
          {quotes.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Latest Quote
              </h3>
              {quotes.map((quote) => (
                <div key={quote.id} className="border rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">${quote.low} - ${quote.high}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      quote.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>System:</strong> {quote.system}</p>
                    {quote.rationale && quote.rationale.length > 0 && (
                      <div>
                        <strong>Why:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {quote.rationale.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {quote.status === 'draft' && (
                    <button
                      onClick={() => handleSendDraft(quote)}
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Draft
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleDraftQuote}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Drafting...' : 'Draft Quote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

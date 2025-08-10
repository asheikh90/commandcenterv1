import React, { useState, useEffect } from 'react'
import { Search, Plus, ExternalLink } from 'lucide-react'

export default function SEO() {
  const [pages, setPages] = useState([])
  const [formData, setFormData] = useState({
    keyword: '',
    city: 'Philadelphia',
    service: 'collision repair'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/events?type=seo.generated')
      const events = await response.json()
      setPages(events.map(event => ({
        title: `${event.payload.service} in ${event.payload.city} - ${event.payload.keyword}`,
        url: event.payload.url,
        status: 'generated',
        created_at: event.created_at
      })))
    } catch (error) {
      console.error('Failed to fetch SEO pages:', error)
    }
  }

  const generatePage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seo.generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchPages()
        setFormData({ keyword: '', city: 'Philadelphia', service: 'collision repair' })
      }
    } catch (error) {
      console.error('Failed to generate SEO page:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">SEO Console</h1>
        <div className="text-sm text-gray-500">
          Landing page generator (stub)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate Form */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Generate Page
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Keyword
              </label>
              <input
                type="text"
                value={formData.keyword}
                onChange={(e) => setFormData({...formData, keyword: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="auto body shop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="collision repair">Collision Repair</option>
                <option value="auto body">Auto Body</option>
                <option value="paint work">Paint Work</option>
                <option value="dent repair">Dent Repair</option>
              </select>
            </div>

            <button
              onClick={generatePage}
              disabled={loading || !formData.keyword}
              className="btn-primary w-full flex items-center justify-center"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Page'}
            </button>
          </div>
        </div>

        {/* Generated Pages */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Generated Pages</h2>
            
            {pages.length > 0 ? (
              <div className="space-y-3">
                {pages.map((page, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{page.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{page.url}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            page.status === 'generated' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {page.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(page.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 ml-4">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No pages generated yet. Create your first SEO page!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

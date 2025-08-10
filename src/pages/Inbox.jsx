import React, { useState, useEffect } from 'react'
import { Phone, Calendar, Eye } from 'lucide-react'
import LeadDrawer from '../components/LeadDrawer'

export default function Inbox() {
  const [leads, setLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true
    return lead.status === filter
  })

  const filters = [
    { key: 'all', label: 'All Leads' },
    { key: 'draft', label: 'Needs Reply' },
    { key: 'sent', label: 'Sent' },
    { key: 'approved', label: 'Approved' },
    { key: 'booked', label: 'Booked' }
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <div className="flex space-x-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === f.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="table-row">
                  <td className="py-3 px-4 font-medium text-gray-900">{lead.name}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {lead.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{lead.vehicle}</td>
                  <td className="py-3 px-4 text-gray-600">{lead.source}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      lead.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={fetchLeads}
        />
      )}
    </div>
  )
}

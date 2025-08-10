import React, { useState, useEffect } from 'react'
import { Send, Paperclip } from 'lucide-react'

export default function Conversations() {
  const [leads, setLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    if (selectedLead) {
      fetchMessages(selectedLead.id)
    }
  }, [selectedLead])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      setLeads(data)
      if (data.length > 0 && !selectedLead) {
        setSelectedLead(data[0])
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    }
  }

  const fetchMessages = async (leadId) => {
    try {
      const response = await fetch(`/api/conversations/${leadId}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedLead) return

    setLoading(true)
    try {
      const response = await fetch('/api/messages.send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          body: newMessage
        })
      })

      if (response.ok) {
        setNewMessage('')
        await fetchMessages(selectedLead.id)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickReplies = [
    "Budget single-stage or factory-like basecoat/clear?",
    "We can hold a spot for Tuesday — want me to lock it in?",
    "Thanks for the photos! Let me get you a quote."
  ]

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="overflow-y-auto">
          {leads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedLead?.id === lead.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{lead.name}</h3>
                  <p className="text-sm text-gray-600">{lead.phone}</p>
                  <p className="text-sm text-gray-500 mt-1">{lead.vehicle}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(lead.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {selectedLead ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white">
              <h2 className="font-semibold text-gray-900">{selectedLead.name}</h2>
              <p className="text-sm text-gray-600">{selectedLead.phone} • {selectedLead.vehicle}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{message.body}</p>
                    <p className={`text-xs mt-1 ${
                      message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(reply)}
                    className="text-sm bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="btn-primary"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

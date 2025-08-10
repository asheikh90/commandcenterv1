import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Check, X, AlertCircle } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    approvalMode: 'draft',
    shopName: 'Collision Club',
    shopCity: 'Philadelphia',
    shopPhone: '267-212-1034'
  })
  const [healthChecks, setHealthChecks] = useState({
    supabase: 'checking',
    twilio: 'checking',
    openai: 'checking'
  })
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    loadSettings()
    runHealthChecks()
    setWebhookUrl(`${window.location.origin}/api/messages.inbound`)
  }, [])

  const loadSettings = async () => {
    // In a real app, load from database
    setSettings({
      approvalMode: import.meta.env.VITE_APPROVAL_MODE || 'draft',
      shopName: import.meta.env.VITE_SHOP_NAME || 'Collision Club',
      shopCity: import.meta.env.VITE_SHOP_CITY || 'Philadelphia',
      shopPhone: import.meta.env.VITE_SHOP_PHONE || '267-212-1034'
    })
  }

  const runHealthChecks = async () => {
    // Simulate health checks
    setTimeout(() => {
      setHealthChecks({
        supabase: 'success',
        twilio: 'success',
        openai: 'success'
      })
    }, 2000)
  }

  const saveSettings = async () => {
    try {
      // In a real app, save to database
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />
      case 'error':
        return <X className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Connected'
      case 'error':
        return 'Error'
      default:
        return 'Checking...'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center">
        <SettingsIcon className="w-6 h-6 mr-2" />
        Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Mode
              </label>
              <select
                value={settings.approvalMode}
                onChange={(e) => setSettings({...settings, approvalMode: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft (Manual approval)</option>
                <option value="auto">Auto-send</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Draft mode requires manual approval before sending quotes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name
              </label>
              <input
                type="text"
                value={settings.shopName}
                onChange={(e) => setSettings({...settings, shopName: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop City
              </label>
              <input
                type="text"
                value={settings.shopCity}
                onChange={(e) => setSettings({...settings, shopCity: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Phone
              </label>
              <input
                type="tel"
                value={settings.shopPhone}
                onChange={(e) => setSettings({...settings, shopPhone: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={saveSettings}
              className="btn-primary w-full"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Health Checks */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">System Health</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <div className="font-medium text-gray-900">Supabase</div>
                  <div className="text-sm text-gray-600">Database & Storage</div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthChecks.supabase)}
                  <span className="text-sm">{getStatusText(healthChecks.supabase)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <div className="font-medium text-gray-900">Twilio</div>
                  <div className="text-sm text-gray-600">SMS & Conversations</div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthChecks.twilio)}
                  <span className="text-sm">{getStatusText(healthChecks.twilio)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <div className="font-medium text-gray-900">OpenAI</div>
                  <div className="text-sm text-gray-600">AI Vision & Text</div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthChecks.openai)}
                  <span className="text-sm">{getStatusText(healthChecks.openai)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook URL */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Twilio Webhook</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inbound Message Webhook URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(webhookUrl)}
                    className="btn-secondary rounded-l-none"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Paste this URL in your Twilio Conversations webhook settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

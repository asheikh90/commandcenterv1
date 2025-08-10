import React, { useState, useEffect } from 'react'
import { Upload, Download, CheckCircle, AlertCircle } from 'lucide-react'

export default function CCC() {
  const [imports, setImports] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchImports()
  }, [])

  const fetchImports = async () => {
    try {
      const response = await fetch('/api/events?type=ccc.imported')
      const events = await response.json()
      setImports(events.map(event => ({
        id: event.id,
        count: event.payload.count || 0,
        success: event.payload.success || 0,
        errors: event.payload.errors || 0,
        created_at: event.created_at
      })))
    } catch (error) {
      console.error('Failed to fetch imports:', error)
    }
  }

  const runImport = async () => {
    setLoading(true)
    try {
      // Dummy payload for stub
      const dummyData = [
        {
          name: 'John Smith',
          phone: '+12671234567',
          vehicle: '2019 Toyota Camry',
          photos: ['https://example.com/photo1.jpg'],
          meta: { claim_number: 'CCC123456' }
        },
        {
          name: 'Jane Doe',
          phone: '+12677654321',
          vehicle: '2021 Honda Accord',
          photos: ['https://example.com/photo2.jpg'],
          meta: { claim_number: 'CCC789012' }
        }
      ]

      const response = await fetch('/api/ccc.import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dummyData)
      })

      if (response.ok) {
        await fetchImports()
      }
    } catch (error) {
      console.error('Failed to run import:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">CCC Importer</h1>
        <div className="text-sm text-gray-500">
          Batch import from CCC (stub)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Controls */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Import Data
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Connects to CCC API</li>
                <li>• Imports claims with photos</li>
                <li>• Creates leads automatically</li>
                <li>• Generates draft quotes</li>
              </ul>
            </div>

            <button
              onClick={runImport}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Importing...' : 'Run Import Now'}
            </button>

            <div className="text-xs text-gray-500">
              Last successful import: Never
            </div>
          </div>
        </div>

        {/* Import History */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Import History</h2>
            
            {imports.length > 0 ? (
              <div className="space-y-3">
                {imports.map((importRecord) => (
                  <div key={importRecord.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {importRecord.errors > 0 ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {importRecord.count} records processed
                          </div>
                          <div className="text-sm text-gray-600">
                            {importRecord.success} successful, {importRecord.errors} errors
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(importRecord.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No imports yet. Run your first import to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

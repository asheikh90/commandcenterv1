import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Users, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Pulse() {
  const [kpis, setKpis] = useState({
    newLeads: 0,
    quotesSent: 0,
    approvals: 0,
    booked: 0,
    estimatedRevenue: 0
  })
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchKPIs()
    fetchChartData()
  }, [])

  const fetchKPIs = async () => {
    try {
      // In a real app, these would be calculated from actual data
      setKpis({
        newLeads: 12,
        quotesSent: 8,
        approvals: 5,
        booked: 3,
        estimatedRevenue: 7500
      })
    } catch (error) {
      console.error('Failed to fetch KPIs:', error)
    }
  }

  const fetchChartData = async () => {
    // Mock data for the last 7 days
    const data = [
      { date: '2024-01-01', leads: 2, quotes: 1, approvals: 1 },
      { date: '2024-01-02', leads: 3, quotes: 2, approvals: 0 },
      { date: '2024-01-03', leads: 1, quotes: 1, approvals: 1 },
      { date: '2024-01-04', leads: 4, quotes: 2, approvals: 2 },
      { date: '2024-01-05', leads: 2, quotes: 2, approvals: 1 },
      { date: '2024-01-06', leads: 0, quotes: 0, approvals: 0 },
      { date: '2024-01-07', leads: 3, quotes: 1, approvals: 0 }
    ]
    setChartData(data)
  }

  const kpiCards = [
    {
      title: 'New Leads (7d)',
      value: kpis.newLeads,
      icon: Users,
      color: 'blue',
      change: '+15%'
    },
    {
      title: 'Quotes Sent',
      value: kpis.quotesSent,
      icon: TrendingUp,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Approvals',
      value: kpis.approvals,
      icon: CheckCircle,
      color: 'purple',
      change: '+25%'
    },
    {
      title: 'Estimated Revenue',
      value: `$${kpis.estimatedRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'yellow',
      change: '+12%'
    }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mission Pulse</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className={`text-sm font-medium ${
                    kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change} from last week
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  kpi.color === 'blue' ? 'bg-blue-100' :
                  kpi.color === 'green' ? 'bg-green-100' :
                  kpi.color === 'purple' ? 'bg-purple-100' :
                  'bg-yellow-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    kpi.color === 'blue' ? 'text-blue-600' :
                    kpi.color === 'green' ? 'text-green-600' :
                    kpi.color === 'purple' ? 'text-purple-600' :
                    'text-yellow-600'
                  }`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Activity Trend (Last 7 Days)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="New Leads"
              />
              <Line 
                type="monotone" 
                dataKey="quotes" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Quotes Sent"
              />
              <Line 
                type="monotone" 
                dataKey="approvals" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Approvals"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Conversion Rates</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lead to Quote</span>
              <span className="font-medium">67%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quote to Approval</span>
              <span className="font-medium">63%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approval to Booking</span>
              <span className="font-medium">60%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Average Values</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quote Value</span>
              <span className="font-medium">$1,875</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Response Time</span>
              <span className="font-medium">12 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Close Rate</span>
              <span className="font-medium">25%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

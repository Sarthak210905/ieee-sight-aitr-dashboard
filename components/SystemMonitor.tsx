'use client'

import { useEffect, useState } from 'react'
import { Activity, Database, Users, TrendingUp, AlertTriangle } from 'lucide-react'

interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down'
  apiLatency: number
  activeUsers: number
  errorRate: number
}

export default function SystemMonitor() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const start = performance.now()
      const response = await fetch('/api/health')
      const latency = performance.now() - start
      
      const data = await response.json()
      
      setHealth({
        database: data.database?.status || 'unknown',
        apiLatency: latency,
        activeUsers: data.activeUsers || 0,
        errorRate: data.errorRate || 0
      })
    } catch (error) {
      console.error('Health check failed:', error)
      setHealth({
        database: 'down',
        apiLatency: 0,
        activeUsers: 0,
        errorRate: 100
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Activity className="text-ieee-blue" />
        System Health
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Database Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database size={20} />
            <span className="font-semibold">Database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              health?.database === 'healthy' ? 'bg-green-500' :
              health?.database === 'degraded' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm capitalize">{health?.database}</span>
          </div>
        </div>

        {/* API Latency */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <span className="font-semibold">Latency</span>
          </div>
          <p className={`text-lg font-bold ${
            (health?.apiLatency || 0) < 500 ? 'text-green-600' :
            (health?.apiLatency || 0) < 1000 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {health?.apiLatency.toFixed(0)}ms
          </p>
        </div>

        {/* Active Users */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} />
            <span className="font-semibold">Active Users</span>
          </div>
          <p className="text-lg font-bold text-ieee-blue">
            {health?.activeUsers || 0}
          </p>
        </div>

        {/* Error Rate */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} />
            <span className="font-semibold">Error Rate</span>
          </div>
          <p className={`text-lg font-bold ${
            (health?.errorRate || 0) < 1 ? 'text-green-600' :
            (health?.errorRate || 0) < 5 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {health?.errorRate.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}

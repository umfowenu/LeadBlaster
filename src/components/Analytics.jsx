import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChecklistStore } from '../stores/checklistStore'
import { ArrowLeft, Eye, Mail, TrendingUp } from 'lucide-react'

function Analytics() {
  const { id } = useParams()
  const { setCurrentChecklist, currentChecklist, analytics } = useChecklistStore()

  useEffect(() => {
    if (id) {
      setCurrentChecklist(id)
    }
  }, [id])

  if (!currentChecklist) {
    return <div>Loading...</div>
  }

  const stats = analytics[id] || { views: 0, optIns: 0 }
  const conversionRate = stats.views > 0 ? ((stats.optIns / stats.views) * 100).toFixed(1) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">{currentChecklist.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.views}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Email Opt-ins</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.optIns}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Checklist Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Categories</h3>
              <div className="space-y-2">
                {currentChecklist.categories.map((category) => (
                  <div key={category.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.items.length} items</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Settings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Theme Mode:</span>
                  <span className="capitalize">{currentChecklist.theme.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Color:</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: currentChecklist.theme.primaryColor }}
                    />
                    <span>{currentChecklist.theme.primaryColor}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Font Size:</span>
                  <span className="capitalize">{currentChecklist.theme.fontSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Opt-in Gate:</span>
                  <span>{currentChecklist.optInEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Call to Action:</span>
                  <span>{currentChecklist.callToAction.text ? 'Configured' : 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Analytics Note</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Analytics are tracked when users view your checklist in preview mode or through exported versions.
                Views are incremented each time someone loads the checklist, and opt-ins are tracked when the opt-in form is submitted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

import React from 'react'
import { Link } from 'react-router-dom'
import { useChecklistStore } from '../stores/checklistStore'
import { Plus, Edit, Eye, BarChart3, Trash2, Download } from 'lucide-react'

function Dashboard() {
  const { checklists, deleteChecklist, analytics } = useChecklistStore()

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteChecklist(id)
    }
  }

  const handleExport = (checklist) => {
    // This will be implemented in the export functionality
    alert(`Export functionality for "${checklist.name}" will be implemented`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your checklist applications</p>
        </div>
        <Link
          to="/builder"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Checklist
        </Link>
      </div>

      {checklists.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No checklists yet</h3>
          <p className="mt-2 text-gray-500">Get started by creating your first checklist application.</p>
          <Link
            to="/builder"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Checklist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklists.map((checklist) => (
            <div key={checklist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {checklist.bannerImage && (
                <img
                  src={checklist.bannerImage}
                  alt={checklist.name}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {checklist.name}
                    </h3>
                    {checklist.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {checklist.description}
                      </p>
                    )}
                  </div>
                  {checklist.logo && (
                    <img
                      src={checklist.logo}
                      alt="Logo"
                      className="ml-3 h-8 w-8 rounded object-cover"
                    />
                  )}
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>{checklist.categories.length} categories</span>
                  <span className="mx-2">•</span>
                  <span>
                    {checklist.categories.reduce((total, cat) => total + cat.items.length, 0)} items
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>Views: {analytics[checklist.id]?.views || 0}</span>
                  <span>Opt-ins: {analytics[checklist.id]?.optIns || 0}</span>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      to={`/builder/${checklist.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                    <Link
                      to={`/preview/${checklist.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Link>
                    <Link
                      to={`/analytics/${checklist.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <BarChart3 className="mr-1 h-3 w-3" />
                      Analytics
                    </Link>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExport(checklist)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Export
                    </button>
                    <button
                      onClick={() => handleDelete(checklist.id, checklist.name)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard

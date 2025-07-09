import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChecklistStore } from '../stores/checklistStore'
import { ArrowLeft, ExternalLink, Play } from 'lucide-react'
import ChecklistRenderer from './ChecklistRenderer'

function PreviewMode() {
  const { id } = useParams()
  const { setCurrentChecklist, currentChecklist, trackView } = useChecklistStore()

  useEffect(() => {
    if (id) {
      setCurrentChecklist(id)
      trackView(id)
    }
  }, [id])

  if (!currentChecklist) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to={`/builder/${id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Preview Mode</h1>
        </div>
        <div className="text-sm text-gray-500">
          This is how your checklist will appear to users
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ChecklistRenderer checklist={currentChecklist} isPreview={true} />
      </div>
    </div>
  )
}

export default PreviewMode

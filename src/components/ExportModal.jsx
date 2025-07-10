import React, { useState } from 'react'
import { Download, Chrome, Smartphone, Loader2, CheckCircle, AlertCircle, X, FolderOpen } from 'lucide-react'
import { exportAsChromeExtension } from '../services/chromeExtensionExporter'

function ExportModal({ checklist, onClose }) {
  const [exportType, setExportType] = useState('chrome')
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState(null)

  const exportOptions = [
    {
      id: 'chrome',
      name: 'Chrome Extension',
      icon: Chrome,
      description: 'Package as a Chrome extension for easy access',
      available: true
    },
    {
      id: 'android',
      name: 'Android WebView',
      icon: Smartphone,
      description: 'Coming soon - Android app wrapper',
      available: false
    }
  ]

  const handleExport = async () => {
    if (exportType === 'chrome') {
      setIsExporting(true)
      setExportResult(null)
      
      try {
        const result = await exportAsChromeExtension(checklist)
        setExportResult(result)
      } catch (error) {
        setExportResult({
          success: false,
          error: error.message
        })
      } finally {
        setIsExporting(false)
      }
    }
  }

  const openDownloadsFolder = () => {
    window.open('chrome://downloads/', '_blank')
  }

  const selectedOption = exportOptions.find(opt => opt.id === exportType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Export Checklist</h2>
                <p className="text-sm text-gray-600">{checklist.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3 mb-6">
            {exportOptions.map((option) => {
              const Icon = option.icon
              return (
                <div
                  key={option.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                    exportType === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : option.available
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  onClick={() => option.available && setExportType(option.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded ${
                      exportType === option.id
                        ? 'bg-blue-100'
                        : option.available
                        ? 'bg-gray-100'
                        : 'bg-gray-200'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        exportType === option.id
                          ? 'text-blue-600'
                          : option.available
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        option.available ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {option.name}
                      </h3>
                      <p className={`text-sm ${
                        option.available ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                    {exportType === option.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedOption?.id === 'chrome' && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Features:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Popup interface accessible from toolbar</li>
                <li>• Persistent progress tracking</li>
                <li>• Offline functionality</li>
              </ul>
            </div>
          )}

          {exportResult && (
            <div className={`mb-6 p-4 border rounded-md ${
              exportResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {exportResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${
                    exportResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {exportResult.success ? 'Export Successful!' : 'Export Failed'}
                  </h4>
                  <p className={`text-sm ${
                    exportResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {exportResult.success
                      ? `File: ${exportResult.filename}`
                      : exportResult.error
                    }
                  </p>
                  {exportResult.success && (
                    <div className="mt-3">
                      <p className="text-sm text-green-700 mb-2">
                        Saved to your Downloads folder
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={openDownloadsFolder}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 transition-colors"
                        >
                          <FolderOpen className="h-3 w-3" />
                          Open Downloads
                        </button>
                        <div className="text-xs text-green-600">
                          <p className="font-medium mb-1">Install:</p>
                          <p>1. Extract ZIP → 2. chrome://extensions/ → 3. Developer mode → 4. Load unpacked</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={isExporting}
            >
              Close
            </button>
            <button
              onClick={handleExport}
              disabled={!selectedOption?.available || isExporting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {selectedOption?.name}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportModal

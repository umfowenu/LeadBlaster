import React from 'react'
import { useChecklistStore } from '../stores/checklistStore'

function ThemeCustomizer() {
  const { currentChecklist, updateChecklist } = useChecklistStore()

  if (!currentChecklist) return null

  const handleThemeUpdate = (updates) => {
    updateChecklist(currentChecklist.id, {
      theme: { ...currentChecklist.theme, ...updates }
    })
  }

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Mode</h3>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              value="light"
              checked={currentChecklist.theme.mode === 'light'}
              onChange={(e) => handleThemeUpdate({ mode: e.target.value })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Light Mode</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              value="dark"
              checked={currentChecklist.theme.mode === 'dark'}
              onChange={(e) => handleThemeUpdate({ mode: e.target.value })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Dark Mode</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Color</h3>
        <div className="grid grid-cols-4 gap-3">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => handleThemeUpdate({ primaryColor: color.value })}
              className={`flex items-center space-x-2 p-3 rounded-lg border-2 ${
                currentChecklist.theme.primaryColor === color.value
                  ? 'border-gray-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color.value }}
              />
              <span className="text-sm font-medium">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Font Size</h3>
        <div className="flex space-x-4">
          {['small', 'medium', 'large'].map((size) => (
            <label key={size} className="flex items-center">
              <input
                type="radio"
                name="fontSize"
                value={size}
                checked={currentChecklist.theme.fontSize === size}
                onChange={(e) => handleThemeUpdate({ fontSize: e.target.value })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{size}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
        <div 
          className={`p-6 rounded-lg border-2 ${
            currentChecklist.theme.mode === 'dark' 
              ? 'bg-gray-900 text-white border-gray-700' 
              : 'bg-white text-gray-900 border-gray-200'
          }`}
        >
          <h4 
            className={`font-bold mb-4 ${
              currentChecklist.theme.fontSize === 'small' ? 'text-lg' :
              currentChecklist.theme.fontSize === 'large' ? 'text-2xl' : 'text-xl'
            }`}
            style={{ color: currentChecklist.theme.primaryColor }}
          >
            Sample Category
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className={
                currentChecklist.theme.fontSize === 'small' ? 'text-sm' :
                currentChecklist.theme.fontSize === 'large' ? 'text-lg' : 'text-base'
              }>
                Sample checklist item
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className={
                currentChecklist.theme.fontSize === 'small' ? 'text-sm' :
                currentChecklist.theme.fontSize === 'large' ? 'text-lg' : 'text-base'
              }>
                Another checklist item
              </span>
            </div>
          </div>
          <button
            className={`mt-4 px-4 py-2 rounded text-white font-medium ${
              currentChecklist.theme.fontSize === 'small' ? 'text-sm' :
              currentChecklist.theme.fontSize === 'large' ? 'text-lg' : 'text-base'
            }`}
            style={{ backgroundColor: currentChecklist.theme.primaryColor }}
          >
            Sample Call to Action
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeCustomizer

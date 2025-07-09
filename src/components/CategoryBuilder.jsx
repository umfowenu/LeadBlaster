import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useChecklistStore } from '../stores/checklistStore'
import { Plus, Trash2, Edit, Video, List, FileText, ChevronDown, ChevronRight, X, Save, Upload, Clipboard } from 'lucide-react'

function CategoryBuilder() {
  const { 
    currentChecklist, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    updateItem,
    deleteItem,
    updateChecklist
  } = useChecklistStore()
  
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [addingItemToCategory, setAddingItemToCategory] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [showJsonUpload, setShowJsonUpload] = useState(false)
  const [jsonImportMode, setJsonImportMode] = useState('file') // 'file' or 'paste'
  const [jsonPasteValue, setJsonPasteValue] = useState('')
  
  const categoryForm = useForm()
  const editForm = useForm()
  const itemForm = useForm()

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const handleAddCategory = (data) => {
    if (!data.name?.trim()) return
    const newCategoryId = addCategory(data.name.trim())
    categoryForm.reset()
    // Auto-expand new category
    setExpandedCategories(prev => ({ ...prev, [newCategoryId]: true }))
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category.id)
    editForm.setValue('categoryName', category.name)
  }

  const handleUpdateCategory = (data) => {
    updateCategory(editingCategory, { name: data.categoryName })
    setEditingCategory(null)
    editForm.reset()
  }

  const handleDeleteCategory = (categoryId, categoryName) => {
    if (confirm(`Delete category "${categoryName}" and all its items?`)) {
      deleteCategory(categoryId)
    }
  }

  const handleStartAddItem = (categoryId) => {
    setAddingItemToCategory(categoryId)
    itemForm.reset()
    itemForm.setValue('itemName', '')
    itemForm.setValue('itemDescription', '')
    itemForm.setValue('itemVideo', '')
    itemForm.setValue('itemBullets', '')
  }

  const handleAddItem = (data) => {
    if (!data.itemName?.trim()) return

    const bulletPoints = data.itemBullets
      ? data.itemBullets.split('\n').filter(point => point.trim())
      : []

    const newItem = {
      id: Date.now().toString(),
      name: data.itemName.trim(),
      description: data.itemDescription || '',
      videoUrl: data.itemVideo || '',
      bulletPoints,
      completed: false
    }

    // Add to store
    const { currentChecklist } = useChecklistStore.getState()
    const updatedCategories = currentChecklist.categories.map(category =>
      category.id === addingItemToCategory
        ? { ...category, items: [...category.items, newItem] }
        : category
    )
    
    useChecklistStore.getState().updateChecklist(currentChecklist.id, { categories: updatedCategories })
    
    setAddingItemToCategory(null)
    itemForm.reset()
  }

  const handleCancelAddItem = () => {
    setAddingItemToCategory(null)
    itemForm.reset()
  }

  const handleEditItem = (categoryId, item) => {
    setEditingItem({ categoryId, itemId: item.id })
    editForm.setValue('itemName', item.name)
    editForm.setValue('itemDescription', item.description || '')
    editForm.setValue('itemVideo', item.videoUrl || '')
    editForm.setValue('itemBullets', item.bulletPoints.join('\n'))
  }

  const handleUpdateItem = (data) => {
    const bulletPoints = data.itemBullets
      ? data.itemBullets.split('\n').filter(point => point.trim())
      : []
    
    updateItem(editingItem.categoryId, editingItem.itemId, {
      name: data.itemName,
      description: data.itemDescription || '',
      videoUrl: data.itemVideo || '',
      bulletPoints
    })
    setEditingItem(null)
    editForm.reset()
  }

  const handleDeleteItem = (categoryId, itemId, itemName) => {
    if (confirm(`Delete item "${itemName}"?`)) {
      deleteItem(categoryId, itemId)
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    editForm.reset()
  }

  const processJsonData = (jsonData) => {
    // Validate JSON structure
    if (!jsonData.categories || !Array.isArray(jsonData.categories)) {
      throw new Error('Invalid JSON: Missing or invalid "categories" array')
    }

    // Transform JSON to our internal structure
    const transformedCategories = jsonData.categories.map((category, catIndex) => {
      if (!category.name || !Array.isArray(category.items)) {
        throw new Error(`Invalid category structure at index ${catIndex}`)
      }

      return {
        id: `cat_${Date.now()}_${catIndex}`,
        name: category.name,
        items: category.items.map((item, itemIndex) => {
          if (!item.text) {
            throw new Error(`Invalid item structure in category "${category.name}" at index ${itemIndex}`)
          }

          return {
            id: `item_${Date.now()}_${catIndex}_${itemIndex}`,
            name: item.text,
            description: '',
            videoUrl: '',
            bulletPoints: Array.isArray(item.details) ? item.details : [],
            completed: false
          }
        })
      }
    })

    // Update current checklist
    const updates = {
      categories: transformedCategories
    }

    // Update title and description if provided
    if (jsonData.title) {
      updates.name = jsonData.title
    }
    if (jsonData.description) {
      updates.description = jsonData.description
    }

    updateChecklist(currentChecklist.id, updates)

    // Auto-expand all categories
    const expandedState = {}
    transformedCategories.forEach(cat => {
      expandedState[cat.id] = true
    })
    setExpandedCategories(expandedState)

    setShowJsonUpload(false)
    setJsonPasteValue('')
    alert('JSON data imported successfully!')
  }

  const handleJsonUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result)
        processJsonData(jsonData)
      } catch (error) {
        alert(`Error parsing JSON file: ${error.message}`)
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

  const handleJsonPaste = () => {
    if (!jsonPasteValue.trim()) {
      alert('Please paste JSON data first')
      return
    }

    try {
      const jsonData = JSON.parse(jsonPasteValue)
      processJsonData(jsonData)
    } catch (error) {
      alert(`Error parsing JSON: ${error.message}`)
    }
  }

  const handleCloseJsonUpload = () => {
    setShowJsonUpload(false)
    setJsonPasteValue('')
    setJsonImportMode('file')
  }

  if (!currentChecklist) return null

  return (
    <div className="space-y-6">
      {/* Header with JSON Upload */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Categories & Items</h2>
        <button
          onClick={() => setShowJsonUpload(!showJsonUpload)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md"
        >
          <Upload size={14} className="mr-1" />
          📤 Upload JSON
        </button>
      </div>

      {/* JSON Upload Section */}
      {showJsonUpload && (
        <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Import JSON Data</h3>
            <button
              onClick={handleCloseJsonUpload}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Import checklist data from JSON. This will overwrite the current categories and items.
          </p>

          {/* Import Mode Toggle */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setJsonImportMode('file')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                jsonImportMode === 'file'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload size={14} className="inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setJsonImportMode('paste')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                jsonImportMode === 'paste'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clipboard size={14} className="inline mr-2" />
              Paste JSON
            </button>
          </div>

          {/* File Upload Mode */}
          {jsonImportMode === 'file' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}

          {/* Paste Mode */}
          {jsonImportMode === 'paste' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste JSON Data
              </label>
              <textarea
                value={jsonPasteValue}
                onChange={(e) => setJsonPasteValue(e.target.value)}
                rows={8}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                placeholder='Paste your JSON here, e.g.:
{
  "title": "My Checklist",
  "categories": [
    {
      "name": "Category 1",
      "items": [
        {
          "text": "Item name",
          "details": ["Detail 1", "Detail 2"]
        }
      ]
    }
  ]
}'
              />
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleJsonPaste}
                  disabled={!jsonPasteValue.trim()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md"
                >
                  <Clipboard size={14} className="mr-2" />
                  Import JSON
                </button>
                <button
                  onClick={() => setJsonPasteValue('')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Format Guide */}
          <details className="mb-4">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              📋 Expected JSON Format
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "title": "Your Checklist Title",
  "description": "Optional description",
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "text": "Item name",
          "details": [
            "Detail point 1",
            "Detail point 2"
          ]
        }
      ]
    }
  ]
}`}
            </pre>
          </details>
        </div>
      )}

      {/* Add Category Form */}
      <div className="bg-blue-50 border-2 border-dashed border-blue-300 p-6 rounded-lg">
        <form onSubmit={categoryForm.handleSubmit(handleAddCategory)} className="flex space-x-3">
          <input
            {...categoryForm.register('name', { required: true })}
            type="text"
            placeholder="Add new category (e.g., Channel Setup, Video Optimization)"
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </button>
        </form>
      </div>

      {/* Categories Tree */}
      <div className="space-y-4">
        {currentChecklist.categories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Category Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              {editingCategory === category.id ? (
                <form onSubmit={editForm.handleSubmit(handleUpdateCategory)} className="flex items-center space-x-3">
                  <input
                    {...editForm.register('categoryName', { required: true })}
                    type="text"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Save size={12} className="mr-1" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null)
                      editForm.reset()
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <X size={12} className="mr-1" />
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedCategories[category.id] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <span className="text-sm text-gray-500">
                      ({category.items.length} {category.items.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartAddItem(category.id)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded"
                    >
                      <Plus size={12} className="mr-1" />
                      Add Item
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Edit category"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Category Items */}
            {expandedCategories[category.id] && (
              <div className="p-4">
                {/* Add Item Form (Inline) */}
                {addingItemToCategory === category.id && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4 border-2 border-green-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Item</h4>
                    <form onSubmit={itemForm.handleSubmit(handleAddItem)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name *
                        </label>
                        <input
                          {...itemForm.register('itemName', { required: true })}
                          type="text"
                          placeholder="e.g., Create a keyword-rich channel description"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          {...itemForm.register('itemDescription')}
                          rows={2}
                          placeholder="Brief description of what this item involves"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Video URL (Optional)
                        </label>
                        <input
                          {...itemForm.register('itemVideo')}
                          type="url"
                          placeholder="YouTube/Vimeo URL"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Details (One per line)
                        </label>
                        <textarea
                          {...itemForm.register('itemBullets')}
                          rows={5}
                          placeholder="Include 1–2 main keywords naturally&#10;Describe the value your channel offers&#10;Keep it under 1000 characters"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Each line will become a bullet point detail
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                        >
                          <Save size={14} className="mr-1" />
                          Add Item
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAddItem}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        >
                          <X size={14} className="mr-1" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {category.items.length === 0 && addingItemToCategory !== category.id ? (
                  <div className="text-center py-8 text-gray-500">
                    <List className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm">No items in this category yet.</p>
                    <button
                      onClick={() => handleStartAddItem(category.id)}
                      className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md"
                    >
                      <Plus size={14} className="mr-1" />
                      Add First Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={item.id} className="border-l-4 border-blue-200 pl-4">
                        {editingItem?.itemId === item.id ? (
                          /* Item Edit Form */
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <form onSubmit={editForm.handleSubmit(handleUpdateItem)} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Item Name *
                                </label>
                                <input
                                  {...editForm.register('itemName', { required: true })}
                                  type="text"
                                  placeholder="e.g., Create a keyword-rich channel description"
                                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description (Optional)
                                </label>
                                <textarea
                                  {...editForm.register('itemDescription')}
                                  rows={2}
                                  placeholder="Brief description of what this item involves"
                                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Video URL (Optional)
                                </label>
                                <input
                                  {...editForm.register('itemVideo')}
                                  type="url"
                                  placeholder="YouTube/Vimeo URL"
                                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Details (One per line)
                                </label>
                                <textarea
                                  {...editForm.register('itemBullets')}
                                  rows={5}
                                  placeholder="Include 1–2 main keywords naturally&#10;Describe the value your channel offers&#10;Keep it under 1000 characters"
                                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                  Each line will become a bullet point detail
                                </p>
                              </div>

                              <div className="flex space-x-2">
                                <button
                                  type="submit"
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                  <Save size={14} className="mr-1" />
                                  Save Item
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                  <X size={14} className="mr-1" />
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          /* Item Display */
                          <div className="group">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <div className="flex space-x-1">
                                    {item.description && (
                                      <FileText size={12} className="text-gray-500" title="Has description" />
                                    )}
                                    {item.videoUrl && (
                                      <Video size={12} className="text-blue-500" title="Has video" />
                                    )}
                                    {item.bulletPoints.length > 0 && (
                                      <List size={12} className="text-green-500" title="Has details" />
                                    )}
                                  </div>
                                </div>

                                {/* Item Details */}
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                )}

                                {item.videoUrl && (
                                  <div className="mb-2">
                                    <a 
                                      href={item.videoUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                      📹 Watch Video
                                    </a>
                                  </div>
                                )}

                                {/* Bullet Points */}
                                {item.bulletPoints.length > 0 && (
                                  <ul className="ml-4 space-y-1">
                                    {item.bulletPoints.map((point, pointIndex) => (
                                      <li key={pointIndex} className="text-sm text-gray-700 flex items-start">
                                        <span className="text-blue-500 mr-2 mt-1 text-xs">•</span>
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>

                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditItem(category.id, item)}
                                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                  title="Edit item"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(category.id, item.id, item.name)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Delete item"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentChecklist.categories.length === 0 && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <List className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="mb-4">Start by creating your first category above or upload JSON data</p>
          <p className="text-sm text-gray-400">Example: Channel Setup → Create channel description → Include keywords naturally</p>
        </div>
      )}
    </div>
  )
}

export default CategoryBuilder

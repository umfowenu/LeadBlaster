import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useChecklistStore } from '../stores/checklistStore'
import { Plus, Trash2, Edit, Video, List } from 'lucide-react'

function CategoryBuilder() {
  const { 
    currentChecklist, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    addItem,
    updateItem,
    deleteItem
  } = useChecklistStore()
  
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  const handleAddCategory = (data) => {
    addCategory(data.name)
    reset()
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category.id)
    setValue('categoryName', category.name)
  }

  const handleUpdateCategory = (data) => {
    updateCategory(editingCategory, { name: data.categoryName })
    setEditingCategory(null)
    reset()
  }

  const handleDeleteCategory = (categoryId, categoryName) => {
    if (confirm(`Delete category "${categoryName}" and all its items?`)) {
      deleteCategory(categoryId)
    }
  }

  const handleAddItem = (categoryId, data) => {
    addItem(categoryId, data.itemName)
    reset()
  }

  const handleEditItem = (categoryId, item) => {
    setEditingItem({ categoryId, itemId: item.id })
    setValue('itemName', item.name)
    setValue('itemVideo', item.videoUrl)
    setValue('itemBullets', item.bulletPoints.join('\n'))
  }

  const handleUpdateItem = (data) => {
    const bulletPoints = data.itemBullets
      ? data.itemBullets.split('\n').filter(point => point.trim())
      : []
    
    updateItem(editingItem.categoryId, editingItem.itemId, {
      name: data.itemName,
      videoUrl: data.itemVideo || '',
      bulletPoints
    })
    setEditingItem(null)
    reset()
  }

  const handleDeleteItem = (categoryId, itemId, itemName) => {
    if (confirm(`Delete item "${itemName}"?`)) {
      deleteItem(categoryId, itemId)
    }
  }

  if (!currentChecklist) return null

  return (
    <div className="space-y-8">
      {/* Add Category Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
        <form onSubmit={handleSubmit(handleAddCategory)} className="flex space-x-3">
          <input
            {...register('name', { required: true })}
            type="text"
            placeholder="Category name"
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {currentChecklist.categories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              {editingCategory === category.id ? (
                <form onSubmit={handleSubmit(handleUpdateCategory)} className="flex-1 flex space-x-3">
                  <input
                    {...register('categoryName', { required: true })}
                    type="text"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null)
                      reset()
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="p-4">
              {/* Add Item Form */}
              <form
                onSubmit={handleSubmit((data) => handleAddItem(category.id, data))}
                className="mb-4 flex space-x-3"
              >
                <input
                  {...register('itemName', { required: true })}
                  type="text"
                  placeholder="Add new item"
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </button>
              </form>

              {/* Items List */}
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-md p-3">
                    {editingItem?.itemId === item.id ? (
                      <form onSubmit={handleSubmit(handleUpdateItem)} className="space-y-3">
                        <input
                          {...register('itemName', { required: true })}
                          type="text"
                          placeholder="Item name"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <input
                          {...register('itemVideo')}
                          type="url"
                          placeholder="Video URL (YouTube/Vimeo)"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <textarea
                          {...register('itemBullets')}
                          rows={3}
                          placeholder="Bullet points (one per line)"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(null)
                              reset()
                            }}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <div className="flex space-x-2">
                            {item.videoUrl && (
                              <Video size={16} className="text-blue-500" />
                            )}
                            {item.bulletPoints.length > 0 && (
                              <List size={16} className="text-green-500" />
                            )}
                            <button
                              onClick={() => handleEditItem(category.id, item)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(category.id, item.id, item.name)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {item.videoUrl && (
                          <p className="text-sm text-blue-600 mb-1">
                            Video: {item.videoUrl}
                          </p>
                        )}
                        
                        {item.bulletPoints.length > 0 && (
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {item.bulletPoints.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentChecklist.categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <List className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No categories yet. Add your first category above.</p>
        </div>
      )}
    </div>
  )
}

export default CategoryBuilder

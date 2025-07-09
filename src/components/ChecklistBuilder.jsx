import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useChecklistStore } from '../stores/checklistStore'
import { Save, Eye, Plus, Trash2, Settings, Image, Video, Link as LinkIcon } from 'lucide-react'
import CategoryBuilder from './CategoryBuilder'
import ThemeCustomizer from './ThemeCustomizer'

function ChecklistBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    currentChecklist, 
    createChecklist, 
    updateChecklist, 
    setCurrentChecklist,
    createTempChecklist,
    saveTempChecklist,
    clearTempChecklist,
    isCurrentChecklistTemp,
    checklists 
  } = useChecklistStore()
  
  const [activeTab, setActiveTab] = useState('basic')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm()

  // Watch form values to detect changes
  const watchedValues = watch()

  useEffect(() => {
    if (id && id !== 'new') {
      // Editing existing checklist
      setCurrentChecklist(id)
      setHasUnsavedChanges(false)
      setIsLoading(false)
    } else if (id === 'new') {
      // Creating new checklist - create temp checklist
      createTempChecklist()
      setHasUnsavedChanges(false)
      setIsLoading(false)
    }
  }, [id, setCurrentChecklist, createTempChecklist])

  useEffect(() => {
    if (currentChecklist) {
      setValue('name', currentChecklist.name)
      setValue('description', currentChecklist.description)
      setValue('logo', currentChecklist.logo)
      setValue('bannerImage', currentChecklist.bannerImage)
      setValue('callToActionText', currentChecklist.callToAction.text)
      setValue('callToActionLink', currentChecklist.callToAction.link)
      setValue('optInEnabled', currentChecklist.optInEnabled)
      setValue('optInFormHtml', currentChecklist.optInFormHtml)
    }
  }, [currentChecklist, setValue])

  // Track form changes
  useEffect(() => {
    if (currentChecklist && isCurrentChecklistTemp()) {
      const formData = watchedValues
      const hasChanges = (
        formData.name !== currentChecklist.name ||
        formData.description !== currentChecklist.description ||
        formData.logo !== currentChecklist.logo ||
        formData.bannerImage !== currentChecklist.bannerImage ||
        formData.callToActionText !== currentChecklist.callToAction.text ||
        formData.callToActionLink !== currentChecklist.callToAction.link ||
        formData.optInEnabled !== currentChecklist.optInEnabled ||
        formData.optInFormHtml !== currentChecklist.optInFormHtml
      )
      setHasUnsavedChanges(hasChanges)
    }
  }, [watchedValues, currentChecklist, isCurrentChecklistTemp])

  // Handle navigation away warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && isCurrentChecklistTemp()) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePopState = (e) => {
      if (hasUnsavedChanges && isCurrentChecklistTemp()) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
        )
        if (!confirmLeave) {
          e.preventDefault()
          window.history.pushState(null, '', location.pathname)
        } else {
          clearTempChecklist()
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasUnsavedChanges, isCurrentChecklistTemp, location.pathname, clearTempChecklist])

  const onSubmit = (data) => {
    if (!currentChecklist) return

    const updates = {
      name: data.name,
      description: data.description,
      logo: data.logo,
      bannerImage: data.bannerImage,
      callToAction: {
        text: data.callToActionText,
        link: data.callToActionLink
      },
      optInEnabled: data.optInEnabled,
      optInFormHtml: data.optInFormHtml
    }

    if (isCurrentChecklistTemp()) {
      // Save temp checklist as permanent
      const newId = saveTempChecklist(updates)
      navigate(`/builder/${newId}`, { replace: true })
      setHasUnsavedChanges(false)
      alert('Checklist created successfully!')
    } else {
      // Update existing checklist
      updateChecklist(currentChecklist.id, updates)
      setHasUnsavedChanges(false)
      alert('Checklist saved successfully!')
    }
  }

  const handlePreview = () => {
    if (currentChecklist && !isCurrentChecklistTemp()) {
      navigate(`/preview/${currentChecklist.id}`)
    }
  }

  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges && isCurrentChecklistTemp() && tabId !== 'basic') {
      const confirmLeave = window.confirm(
        'You have unsaved changes in the Basic Info tab. Please save your checklist first before accessing other tabs.'
      )
      if (!confirmLeave) {
        return
      }
    }
    setActiveTab(tabId)
  }

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges && isCurrentChecklistTemp()) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      )
      if (!confirmLeave) {
        return
      }
      clearTempChecklist()
    }
    navigate('/')
  }

  if (isLoading || !currentChecklist) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const isTemp = isCurrentChecklistTemp()
  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Settings },
    { id: 'categories', name: 'Categories & Items', icon: Plus, disabled: isTemp },
    { id: 'theme', name: 'Theme', icon: Image, disabled: isTemp }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {currentChecklist.name || 'Untitled Checklist'}
            {isTemp && <span className="text-red-500 text-lg ml-2">(Unsaved)</span>}
          </h1>
          <p className="mt-2 text-gray-600">
            {isTemp ? 'Create your new checklist application' : 'Build and customize your checklist application'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePreview}
            disabled={isTemp}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              isTemp 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isTemp ? 'Create Checklist' : 'Save Changes'}
          </button>
        </div>
      </div>

      {isTemp && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Unsaved Checklist
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This checklist hasn't been saved yet. Click "Create Checklist" to save it to your dashboard.
                  Other tabs will be available after saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isDisabled = tab.disabled
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && handleTabChange(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : isDisabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'basic' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Checklist Name *
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter checklist name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Logo URL
                  </label>
                  <input
                    {...register('logo')}
                    type="url"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Brief description of your checklist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Banner Image URL
                </label>
                <input
                  {...register('bannerImage')}
                  type="url"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Call to Action</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CTA Text
                    </label>
                    <input
                      {...register('callToActionText')}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Get Started Now"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CTA Link
                    </label>
                    <input
                      {...register('callToActionLink')}
                      type="url"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Opt-in Gate</h3>
                <div className="flex items-center mb-4">
                  <input
                    {...register('optInEnabled')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable opt-in gate
                  </label>
                </div>

                {watch('optInEnabled') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Opt-in Form HTML
                    </label>
                    <textarea
                      {...register('optInFormHtml')}
                      rows={6}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                      placeholder="<form>...</form>"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Paste your email capture form HTML here
                    </p>
                  </div>
                )}
              </div>
            </form>
          )}

          {activeTab === 'categories' && !isTemp && <CategoryBuilder />}
          {activeTab === 'theme' && !isTemp && <ThemeCustomizer />}
        </div>
      </div>
    </div>
  )
}

export default ChecklistBuilder

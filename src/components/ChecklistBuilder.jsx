import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useChecklistStore } from '../stores/checklistStore'
import { Save, Eye, Plus, Trash2, Settings, Image, Video, Link as LinkIcon } from 'lucide-react'
import CategoryBuilder from './CategoryBuilder'
import ThemeCustomizer from './ThemeCustomizer'

function ChecklistBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { 
    currentChecklist, 
    createChecklist, 
    updateChecklist, 
    setCurrentChecklist,
    checklists 
  } = useChecklistStore()
  
  const [activeTab, setActiveTab] = useState('basic')
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (id) {
      setCurrentChecklist(id)
    } else {
      // Create new checklist
      const newId = createChecklist('Untitled Checklist')
      navigate(`/builder/${newId}`, { replace: true })
    }
  }, [id])

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

  const onSubmit = (data) => {
    if (!currentChecklist) return

    updateChecklist(currentChecklist.id, {
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
    })

    alert('Checklist saved successfully!')
  }

  const handlePreview = () => {
    if (currentChecklist) {
      navigate(`/preview/${currentChecklist.id}`)
    }
  }

  if (!currentChecklist) {
    return <div>Loading...</div>
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Settings },
    { id: 'categories', name: 'Categories & Items', icon: Plus },
    { id: 'theme', name: 'Theme', icon: Image }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentChecklist.name || 'Untitled Checklist'}
          </h1>
          <p className="mt-2 text-gray-600">Build and customize your checklist application</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePreview}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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

          {activeTab === 'categories' && <CategoryBuilder />}
          {activeTab === 'theme' && <ThemeCustomizer />}
        </div>
      </div>
    </div>
  )
}

export default ChecklistBuilder

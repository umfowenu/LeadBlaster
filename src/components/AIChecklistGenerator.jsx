import React, { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, Lightbulb, MessageSquare, Target } from 'lucide-react'
import { generateChecklistWithAI } from '../services/openaiService'
import { useOpenAIStore } from '../stores/openaiStore'

function AIChecklistGenerator({ onGenerate, onClose }) {
  const [activeTab, setActiveTab] = useState('keyword')
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const { hasValidKey } = useOpenAIStore()

  const tabs = [
    {
      id: 'keyword',
      name: 'Keyword/Topic',
      icon: Lightbulb,
      placeholder: 'e.g., YouTube SEO, Home Workout Plan, Digital Marketing',
      description: 'Generate a checklist based on a keyword or topic'
    },
    {
      id: 'prompt',
      name: 'Custom Prompt',
      icon: MessageSquare,
      placeholder: 'e.g., Help me create a morning routine that boosts productivity',
      description: 'Describe what kind of checklist you need'
    },
    {
      id: 'usecase',
      name: 'Use Case',
      icon: Target,
      placeholder: 'e.g., Step-by-step guide to launching a podcast',
      description: 'Specific scenario or goal you want to achieve'
    }
  ]

  const examples = {
    keyword: [
      'YouTube SEO',
      'Home Workout Plan',
      'Digital Marketing',
      'Wedding Planning',
      'Job Interview Prep'
    ],
    prompt: [
      'Help me create a morning routine that boosts productivity',
      'I need a checklist for organizing a successful team meeting',
      'Create a guide for someone learning to cook healthy meals'
    ],
    usecase: [
      'Step-by-step guide to launching a podcast',
      'Complete checklist for moving to a new apartment',
      'How to start a small online business from scratch'
    ]
  }

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some input to generate a checklist')
      return
    }

    if (!hasValidKey()) {
      setError('OpenAI API key is not configured. Please go to Settings to add your API key.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const checklistData = await generateChecklistWithAI(input.trim(), activeTab)
      onGenerate(checklistData)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExampleClick = (example) => {
    setInput(example)
  }

  const currentTab = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Checklist Generator</h2>
                <p className="text-sm text-gray-600">Generate comprehensive checklists with AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {!hasValidKey() && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">OpenAI API Key Required</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    You need to configure your OpenAI API key in Settings before using AI generation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentTab.name}
            </label>
            <p className="text-sm text-gray-600 mb-3">{currentTab.description}</p>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentTab.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isGenerating}
            />
          </div>

          {/* Examples */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Examples:</h4>
            <div className="flex flex-wrap gap-2">
              {examples[activeTab].map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={isGenerating}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!input.trim() || isGenerating || !hasValidKey()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Checklist
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChecklistGenerator

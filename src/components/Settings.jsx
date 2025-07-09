import React, { useState } from 'react'
import { useOpenAIStore } from '../stores/openaiStore'
import { Key, Check, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

function Settings() {
  const { 
    apiKey, 
    isValidated, 
    isValidating, 
    validationError, 
    lastValidated,
    setApiKey, 
    validateApiKey, 
    clearApiKey 
  } = useOpenAIStore()
  
  const [inputKey, setInputKey] = useState(apiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleValidateKey = async () => {
    if (!inputKey.trim()) {
      return
    }

    const result = await validateApiKey(inputKey.trim())
    
    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const handleClearKey = () => {
    if (confirm('Are you sure you want to remove your OpenAI API key?')) {
      clearApiKey()
      setInputKey('')
      setShowSuccess(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Configure your OpenAI API integration</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Key className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">OpenAI API Key</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-..."
                className="block w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-12 flex items-center px-2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {isValidated && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          </div>

          {validationError && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-700">{validationError}</span>
            </div>
          )}

          {showSuccess && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-green-700">API key validated successfully!</span>
            </div>
          )}

          {isValidated && lastValidated && (
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <div className="font-medium">API key is valid</div>
                <div className="text-blue-600">Last validated: {formatDate(lastValidated)}</div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleValidateKey}
              disabled={!inputKey.trim() || isValidating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  {isValidated ? 'Re-validate Key' : 'Validate Key'}
                </>
              )}
            </button>

            {apiKey && (
              <button
                onClick={handleClearKey}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Key
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">How to get your OpenAI API key:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">platform.openai.com/api-keys</a></li>
              <li>Sign in to your OpenAI account</li>
              <li>Click "Create new secret key"</li>
              <li>Copy the key and paste it above</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored securely in your browser and never sent to our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

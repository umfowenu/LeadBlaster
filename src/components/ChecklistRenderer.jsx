import React, { useState } from 'react'
import { Play, ExternalLink, Check, ChevronDown, ChevronUp } from 'lucide-react'

function ChecklistRenderer({ checklist, isPreview = false }) {
  const [completedItems, setCompletedItems] = useState(new Set())
  const [showOptIn, setShowOptIn] = useState(checklist.optInEnabled)
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  const toggleItem = (itemId) => {
    const newCompleted = new Set(completedItems)
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId)
    } else {
      newCompleted.add(itemId)
    }
    setCompletedItems(newCompleted)
  }

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const getVideoInfo = (url) => {
    if (!url) return null
    
    // YouTube - handle both youtube.com and youtu.be URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      const videoId = youtubeMatch[1]
      return {
        type: 'youtube',
        id: videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title: 'YouTube Video'
      }
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        id: vimeoMatch[1],
        originalUrl: url,
        title: 'Vimeo Video'
      }
    }
    
    return {
      type: 'other',
      originalUrl: url,
      title: 'External Video'
    }
  }

  const MediaDisplay = ({ checklist }) => {
    // Check if we have a custom image
    if (checklist.customImage) {
      return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 mb-4">
          <div className="relative">
            <img
              src={checklist.customImage}
              alt="Custom content"
              className="w-full h-32 object-cover cursor-pointer"
              onClick={() => {
                if (checklist.customImageRedirectUrl) {
                  window.open(checklist.customImageRedirectUrl, '_blank')
                }
              }}
            />
            {checklist.customImageRedirectUrl && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                Click to visit
              </div>
            )}
          </div>
        </div>
      )
    }

    // Check if we have a video URL
    if (checklist.videoUrl) {
      const videoInfo = getVideoInfo(checklist.videoUrl)
      if (videoInfo && videoInfo.type === 'youtube') {
        return (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 mb-4">
            <div className="relative">
              <img
                src={videoInfo.thumbnail}
                alt="Video thumbnail"
                className="w-full h-32 object-cover"
                onError={(e) => {
                  if (e.target.src.includes('maxresdefault')) {
                    e.target.src = `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`
                  } else if (e.target.src.includes('hqdefault')) {
                    e.target.src = `https://img.youtube.com/vi/${videoInfo.id}/mqdefault.jpg`
                  }
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-3">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="p-3 text-center">
              <a
                href={videoInfo.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
              >
                WATCH ON YOUTUBE
              </a>
            </div>
          </div>
        )
      }
    }
    
    return null
  }

  // Calculate progress for each category
  const getCategoryProgress = (category) => {
    const totalItems = category.items.length
    const completedCount = category.items.filter(item => completedItems.has(item.id)).length
    return { completed: completedCount, total: totalItems }
  }

  // Calculate overall progress
  const totalItems = checklist.categories.reduce((total, cat) => total + cat.items.length, 0)
  const completedCount = completedItems.size
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  const themeClasses = {
    container: checklist.theme.mode === 'dark' 
      ? 'bg-gray-900 text-white min-h-screen' 
      : 'bg-gray-50 text-gray-900 min-h-screen',
    card: checklist.theme.mode === 'dark'
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-200',
    text: checklist.theme.mode === 'dark' ? 'text-gray-100' : 'text-gray-900',
    subtext: checklist.theme.mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
  }

  if (showOptIn && checklist.optInFormHtml) {
    return (
      <div className={themeClasses.container}>
        <div className="max-w-2xl mx-auto p-8">
          <div className={`${themeClasses.card} border rounded-lg p-8 text-center`}>
            <h1 className="text-xl font-bold mb-4" style={{ color: checklist.theme.primaryColor }}>
              {checklist.name}
            </h1>
            {checklist.description && (
              <p className={`text-base ${themeClasses.subtext} mb-6`}>
                {checklist.description}
              </p>
            )}
            <div 
              className="mb-6"
              dangerouslySetInnerHTML={{ __html: checklist.optInFormHtml }}
            />
            <button
              onClick={() => setShowOptIn(false)}
              className="px-6 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: checklist.theme.primaryColor }}
            >
              Continue to Checklist
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-600 min-h-screen" style={{ maxWidth: '400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {checklist.logo && (
            <img
              src={checklist.logo}
              alt="Logo"
              className="h-6 w-6 rounded-full"
            />
          )}
          <h1 className="font-semibold text-sm truncate">{checklist.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">5</div>
          <div className="text-white">🏠 HOME</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-2">
        {/* First Category - "What is XXX?" with media content */}
        <div className="mb-2">
          {/* Category Header */}
          <button
            onClick={() => toggleCategory('what-is')}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white p-3 rounded flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="text-white text-sm">📋</div>
              <span className="font-medium text-sm text-left">What is {checklist.name}?</span>
            </div>
            <div className="flex items-center space-x-2">
              {expandedCategories.has('what-is') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Media Content in Dropdown */}
          {expandedCategories.has('what-is') && (
            <div className="bg-white rounded-b border border-gray-200 p-4">
              <MediaDisplay checklist={checklist} />
            </div>
          )}
        </div>

        {/* Regular Categories */}
        {checklist.categories.map((category) => {
          const progress = getCategoryProgress(category)
          const isExpanded = expandedCategories.has(category.id)
          
          return (
            <div key={category.id} className="mb-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white p-3 rounded flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-white text-sm">📋</div>
                  <span className="font-medium text-sm text-left">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {progress.total > 0 && (
                    <div className="bg-blue-300 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                      {progress.completed}
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="bg-white rounded-b border border-gray-200">
                  {category.items.map((item, index) => (
                    <div key={item.id} className={`border-b border-gray-200 last:border-b-0`}>
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            completedItems.has(item.id)
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-400 bg-transparent'
                          }`}>
                            {completedItems.has(item.id) && (
                              <Check size={10} className="text-white" />
                            )}
                          </div>
                          <span className={`text-gray-800 text-sm ${
                            completedItems.has(item.id) ? 'line-through opacity-70' : ''
                          }`}>
                            {item.name}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>

                      {/* Item Details */}
                      {item.bulletPoints.length > 0 && (
                        <div className="px-6 pb-3">
                          <ul className="text-xs text-gray-600 space-y-1">
                            {item.bulletPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Item Video */}
                      {item.videoUrl && (
                        <div className="px-3 pb-3">
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
                          >
                            <Play size={10} />
                            <span>Watch Video</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar Section */}
      <div className="p-4 bg-blue-700">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-500 text-white text-xs px-3 py-1 rounded font-bold">
              {progressPercent}%
            </div>
            <button className="bg-blue-500 hover:bg-blue-400 text-white text-xs px-3 py-1 rounded transition-colors">
              🔄 RESET
            </button>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* CTA Link */}
        {checklist.callToAction.text && checklist.callToAction.link && (
          <div className="mb-4">
            <a
              href={checklist.callToAction.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-blue-200 hover:text-white text-xs underline transition-colors"
            >
              {checklist.callToAction.text}
            </a>
          </div>
        )}

        {/* Banner Ad */}
        <div className="bg-yellow-400 text-black p-3 rounded text-center">
          <div className="font-bold text-sm mb-1">
            🎯 Special Offer - Limited Time!
          </div>
          <div className="text-xs mb-2">
            Get Premium Tools with 50% Discount
          </div>
          <a
            href={checklist.callToAction.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-yellow-400 px-4 py-1 rounded text-xs font-bold hover:bg-gray-800 transition-colors inline-block"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Debug Notice */}
      <div className="p-4 bg-green-50 border-t border-green-200">
        <p className="text-xs text-green-700 text-center">
          ✅ Extension Layout Preview - Matches Chrome Extension Design
        </p>
      </div>
    </div>
  )
}

export default ChecklistRenderer

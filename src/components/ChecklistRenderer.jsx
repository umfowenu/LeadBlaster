import React, { useState } from 'react'
import { Play, ExternalLink, Check } from 'lucide-react'

function ChecklistRenderer({ checklist, isPreview = false }) {
  const [completedItems, setCompletedItems] = useState(new Set())
  const [showOptIn, setShowOptIn] = useState(checklist.optInEnabled)

  const toggleItem = (itemId) => {
    const newCompleted = new Set(completedItems)
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId)
    } else {
      newCompleted.add(itemId)
    }
    setCompletedItems(newCompleted)
  }

  const getVideoEmbedUrl = (url) => {
    if (!url) return null
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
    
    return null
  }

  const themeClasses = {
    container: checklist.theme.mode === 'dark' 
      ? 'bg-gray-900 text-white min-h-screen' 
      : 'bg-gray-50 text-gray-900 min-h-screen',
    card: checklist.theme.mode === 'dark'
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-200',
    categoryHeader: checklist.theme.mode === 'dark'
      ? 'bg-gray-700 border-gray-600'
      : 'bg-gray-50 border-gray-200',
    text: checklist.theme.mode === 'dark' ? 'text-gray-100' : 'text-gray-900',
    subtext: checklist.theme.mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
  }

  const fontSize = {
    small: { base: 'text-sm', lg: 'text-base', xl: 'text-lg' },
    medium: { base: 'text-base', lg: 'text-lg', xl: 'text-xl' },
    large: { base: 'text-lg', lg: 'text-xl', xl: 'text-2xl' }
  }[checklist.theme.fontSize]

  if (showOptIn && checklist.optInFormHtml) {
    return (
      <div className={themeClasses.container}>
        <div className="max-w-2xl mx-auto p-8">
          <div className={`${themeClasses.card} border rounded-lg p-8 text-center`}>
            <h1 className={`${fontSize.xl} font-bold mb-4`} style={{ color: checklist.theme.primaryColor }}>
              {checklist.name}
            </h1>
            {checklist.description && (
              <p className={`${fontSize.base} ${themeClasses.subtext} mb-6`}>
                {checklist.description}
              </p>
            )}
            <div 
              className="mb-6"
              dangerouslySetInnerHTML={{ __html: checklist.optInFormHtml }}
            />
            <button
              onClick={() => setShowOptIn(false)}
              className={`px-6 py-3 rounded-lg text-white font-medium ${fontSize.base}`}
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
    <div className={themeClasses.container}>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          {checklist.logo && (
            <img
              src={checklist.logo}
              alt="Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
          )}
          <h1 className={`${fontSize.xl} font-bold mb-4`} style={{ color: checklist.theme.primaryColor }}>
            {checklist.name}
          </h1>
          {checklist.description && (
            <p className={`${fontSize.base} ${themeClasses.subtext} max-w-2xl mx-auto`}>
              {checklist.description}
            </p>
          )}
        </div>

        {/* Banner Image */}
        {checklist.bannerImage && (
          <div className="mb-8">
            <img
              src={checklist.bannerImage}
              alt="Banner"
              className="w-full h-48 md:h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Categories */}
        <div className="space-y-6">
          {checklist.categories.map((category) => (
            <div key={category.id} className={`${themeClasses.card} border rounded-lg overflow-hidden`}>
              <div className={`${themeClasses.categoryHeader} border-b px-6 py-4`}>
                <h2 className={`${fontSize.lg} font-semibold`} style={{ color: checklist.theme.primaryColor }}>
                  {category.name}
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.id} className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            completedItems.has(item.id)
                              ? 'border-green-500 bg-green-500'
                              : `border-gray-300 hover:border-gray-400`
                          }`}
                        >
                          {completedItems.has(item.id) && (
                            <Check size={12} className="text-white" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h3 className={`${fontSize.base} font-medium ${
                            completedItems.has(item.id) ? 'line-through opacity-60' : ''
                          }`}>
                            {item.name}
                          </h3>
                          
                          {/* Bullet Points */}
                          {item.bulletPoints.length > 0 && (
                            <ul className={`mt-2 space-y-1 ${fontSize.base} ${themeClasses.subtext} list-disc list-inside`}>
                              {item.bulletPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          )}
                          
                          {/* Video */}
                          {item.videoUrl && (
                            <div className="mt-3">
                              {getVideoEmbedUrl(item.videoUrl) ? (
                                <div className="aspect-video">
                                  <iframe
                                    src={getVideoEmbedUrl(item.videoUrl)}
                                    className="w-full h-full rounded"
                                    frameBorder="0"
                                    allowFullScreen
                                  />
                                </div>
                              ) : (
                                <a
                                  href={item.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded text-white ${fontSize.base}`}
                                  style={{ backgroundColor: checklist.theme.primaryColor }}
                                >
                                  <Play size={16} />
                                  <span>Watch Video</span>
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {checklist.callToAction.text && checklist.callToAction.link && (
          <div className="mt-8 text-center">
            <a
              href={checklist.callToAction.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center space-x-2 px-8 py-4 rounded-lg text-white font-semibold ${fontSize.base} hover:opacity-90 transition-opacity`}
              style={{ backgroundColor: checklist.theme.primaryColor }}
            >
              <span>{checklist.callToAction.text}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {/* Progress */}
        <div className="mt-8 text-center">
          <div className={`${fontSize.base} ${themeClasses.subtext}`}>
            Progress: {completedItems.size} / {checklist.categories.reduce((total, cat) => total + cat.items.length, 0)} items completed
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: checklist.theme.primaryColor,
                width: `${(completedItems.size / checklist.categories.reduce((total, cat) => total + cat.items.length, 0)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChecklistRenderer

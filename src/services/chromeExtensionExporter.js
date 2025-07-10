import JSZip from 'jszip'

// Chrome extension manifest template
const createManifest = (checklist) => ({
  manifest_version: 3,
  name: checklist.name,
  version: "1.0.0",
  description: checklist.description || "Interactive checklist application",
  permissions: ["storage"],
  action: {
    default_popup: "popup.html",
    default_title: checklist.name
  },
  icons: {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'"
  }
})

// HTML template for the popup
const createPopupHTML = (checklist) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${checklist.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  <script src="popup.js"></script>
</body>
</html>`

// CSS styles for the extension matching the reference images
const createCSS = (checklist) => {
  const theme = checklist.theme
  const isDark = theme.mode === 'dark'
  
  return `
/* Chrome Extension Styles - Matching Reference Design */
body {
  width: 400px;
  max-height: 600px;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #2563eb;
  color: white;
  overflow-y: auto;
}

.container {
  background-color: #2563eb;
  min-height: 100vh;
}

/* Header */
.header {
  background-color: #1d4ed8;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #3b82f6;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  height: 24px;
  width: 24px;
  border-radius: 50%;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-badge {
  background-color: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.home-link {
  color: white;
  font-size: 12px;
  text-decoration: none;
}

/* Main Content */
.main-content {
  padding: 16px;
}

/* Media Display */
.media-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.media-image {
  position: relative;
  width: 100%;
  height: 128px;
  overflow: hidden;
  cursor: pointer;
}

.media-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button {
  background: #ef4444;
  border-radius: 50%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 24px;
  height: 24px;
  color: white;
  margin-left: 2px;
}

.click-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
}

.media-cta {
  padding: 12px;
  text-align: center;
}

.media-button {
  background: #1d4ed8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.2s;
}

.media-button:hover {
  background: #1e40af;
}

/* Categories */
.category {
  margin-bottom: 8px;
}

.category-header {
  background: #3b82f6;
  color: white;
  border: none;
  width: 100%;
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.category-header:hover {
  background: #60a5fa;
}

.category-header.expanded {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  font-size: 16px;
}

.category-title {
  text-align: left;
  font-size: 14px;
}

.category-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-badge {
  background: #93c5fd;
  color: #1e40af;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.chevron.expanded {
  transform: rotate(180deg);
}

/* Category Items */
.category-items {
  background: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.category-item {
  border-bottom: 1px solid #e5e7eb;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  width: 100%;
  padding: 12px 16px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-item:hover {
  background: #f9fafb;
}

.category-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #9ca3af;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #10b981;
  border-color: #10b981;
}

.check-icon {
  width: 10px;
  height: 10px;
  color: white;
}

.item-name {
  font-size: 14px;
  text-align: left;
  transition: all 0.2s;
  color: #374151;
}

.item-name.completed {
  text-decoration: line-through;
  opacity: 0.7;
}

.item-chevron {
  width: 16px;
  height: 16px;
  opacity: 0.7;
  color: #9ca3af;
}

/* Item Details */
.item-details {
  padding: 0 16px 12px 44px;
}

.bullet-points {
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
}

.bullet-points li {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.bullet-points li::before {
  content: '•';
  flex-shrink: 0;
}

.video-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ef4444;
  color: white;
  text-decoration: none;
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.video-link:hover {
  background: #dc2626;
}

/* Progress Section */
.progress-section {
  padding: 16px;
  background: #1d4ed8;
  border-top: 1px solid #3b82f6;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-percentage {
  background: #f59e0b;
  color: white;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: bold;
}

.reset-button {
  background: #3b82f6;
  color: white;
  border: none;
  font-size: 10px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background: #60a5fa;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: #f59e0b;
  transition: width 0.3s ease;
  border-radius: 6px;
}

/* CTA Link */
.cta-link {
  display: block;
  text-align: center;
  color: #93c5fd;
  font-size: 12px;
  text-decoration: underline;
  margin-bottom: 16px;
  transition: color 0.2s;
}

.cta-link:hover {
  color: white;
}

/* Banner Ad */
.banner-ad {
  background: #fbbf24;
  color: black;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.banner-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.banner-subtitle {
  font-size: 12px;
  margin-bottom: 8px;
}

.banner-button {
  background: black;
  color: #fbbf24;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.2s;
}

.banner-button:hover {
  background: #374151;
}

/* Debug Notice */
.debug-notice {
  padding: 12px 16px;
  background: #ecfdf5;
  border-top: 1px solid #10b981;
  text-align: center;
}

.debug-text {
  font-size: 10px;
  color: #065f46;
  margin: 0;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #1d4ed8;
}

::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #60a5fa;
}
`
}

// JavaScript for the extension popup matching the reference design
const createPopupJS = (checklist) => `
// Checklist data
const checklistData = ${JSON.stringify(checklist, null, 2)};

// State management
let completedItems = new Set();
let expandedCategories = new Set();

// Load saved state
chrome.storage.local.get(['completedItems', 'expandedCategories'], (result) => {
  if (result.completedItems) {
    completedItems = new Set(result.completedItems);
  }
  if (result.expandedCategories) {
    expandedCategories = new Set(result.expandedCategories);
  }
  updateUI();
});

// Save state
function saveState() {
  chrome.storage.local.set({
    completedItems: Array.from(completedItems),
    expandedCategories: Array.from(expandedCategories)
  });
}

// Toggle item completion
function toggleItem(itemId) {
  if (completedItems.has(itemId)) {
    completedItems.delete(itemId);
  } else {
    completedItems.add(itemId);
  }
  saveState();
  updateUI();
}

// Toggle category expansion
function toggleCategory(categoryId) {
  if (expandedCategories.has(categoryId)) {
    expandedCategories.delete(categoryId);
  } else {
    expandedCategories.add(categoryId);
  }
  saveState();
  updateUI();
}

// Reset progress
function resetProgress() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    completedItems.clear();
    saveState();
    updateUI();
  }
}

// Handle media click
function handleMediaClick() {
  if (checklistData.customImage && checklistData.customImageRedirectUrl) {
    chrome.tabs.create({ url: checklistData.customImageRedirectUrl });
  } else if (checklistData.videoUrl) {
    chrome.tabs.create({ url: checklistData.videoUrl });
  }
}

// Get YouTube thumbnail
function getYouTubeThumbnail(url) {
  const youtubeMatch = url.match(/(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([^&\\n?#]+)/);
  if (youtubeMatch) {
    return \`https://img.youtube.com/vi/\${youtubeMatch[1]}/maxresdefault.jpg\`;
  }
  return null;
}

// Get category progress
function getCategoryProgress(category) {
  const totalItems = category.items.length;
  const completedCount = category.items.filter(item => completedItems.has(item.id)).length;
  return { completed: completedCount, total: totalItems };
}

// Update UI based on state
function updateUI() {
  // Update category progress badges
  checklistData.categories.forEach(category => {
    const progress = getCategoryProgress(category);
    const badge = document.querySelector(\`[data-category-id="\${category.id}"] .progress-badge\`);
    if (badge) {
      badge.textContent = progress.completed;
    }
  });

  // Update checkboxes and item names
  checklistData.categories.forEach(category => {
    category.items.forEach(item => {
      const checkbox = document.querySelector(\`[data-item-id="\${item.id}"] .checkbox\`);
      const itemName = document.querySelector(\`[data-item-id="\${item.id}"] .item-name\`);
      
      if (checkbox && itemName) {
        if (completedItems.has(item.id)) {
          checkbox.classList.add('checked');
          checkbox.innerHTML = '<div class="check-icon">✓</div>';
          itemName.classList.add('completed');
        } else {
          checkbox.classList.remove('checked');
          checkbox.innerHTML = '';
          itemName.classList.remove('completed');
        }
      }
    });
  });

  // Update category expansion
  const allCategories = ['what-is', ...checklistData.categories.map(c => c.id)];
  allCategories.forEach(categoryId => {
    const header = document.querySelector(\`[data-category-id="\${categoryId}"] .category-header\`);
    const items = document.querySelector(\`[data-category-id="\${categoryId}"] .category-items\`);
    const chevron = document.querySelector(\`[data-category-id="\${categoryId}"] .chevron\`);
    
    if (header && items && chevron) {
      if (expandedCategories.has(categoryId)) {
        header.classList.add('expanded');
        items.style.display = 'block';
        chevron.classList.add('expanded');
      } else {
        header.classList.remove('expanded');
        items.style.display = 'none';
        chevron.classList.remove('expanded');
      }
    }
  });

  // Update overall progress
  const totalItems = checklistData.categories.reduce((total, cat) => total + cat.items.length, 0);
  const completedCount = completedItems.size;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  
  const progressPercentage = document.querySelector('.progress-percentage');
  const progressFill = document.querySelector('.progress-fill');
  
  if (progressPercentage) {
    progressPercentage.textContent = \`\${progressPercent}%\`;
  }
  
  if (progressFill) {
    progressFill.style.width = \`\${progressPercent}%\`;
  }
}

// Render the checklist
function renderChecklist() {
  const app = document.getElementById('app');
  
  let html = '<div class="container">';
  
  // Header
  html += '<div class="header">';
  html += '<div class="header-left">';
  if (checklistData.logo) {
    html += \`<img src="\${checklistData.logo}" alt="Logo" class="logo">\`;
  }
  html += \`<h1 class="title">\${checklistData.name}</h1>\`;
  html += '</div>';
  html += '<div class="header-right">';
  html += '<div class="notification-badge">5</div>';
  html += '<a href="#" class="home-link">🏠 HOME</a>';
  html += '</div>';
  html += '</div>';
  
  // Main Content
  html += '<div class="main-content">';
  
  // First Category - "What is XXX?" with media content
  html += '<div class="category" data-category-id="what-is">';
  html += '<button class="category-header" onclick="toggleCategory(\\'what-is\\')">';
  html += '<div class="category-left">';
  html += '<div class="category-icon">📋</div>';
  html += \`<div class="category-title">What is \${checklistData.name}?</div>\`;
  html += '</div>';
  html += '<div class="category-right">';
  html += '<div class="chevron">▼</div>';
  html += '</div>';
  html += '</button>';
  
  // Media Content in Dropdown
  html += '<div class="category-items" style="display: none;">';
  html += '<div style="padding: 16px;">';
  
  // Check if we have a custom image
  if (checklistData.customImage) {
    html += '<div class="media-container">';
    html += '<div class="media-image" onclick="handleMediaClick()">';
    html += \`<img src="\${checklistData.customImage}" alt="Custom content">\`;
    if (checklistData.customImageRedirectUrl) {
      html += '<div class="click-indicator">Click to visit</div>';
    }
    html += '</div>';
    html += '</div>';
  }
  // Check if we have a video URL
  else if (checklistData.videoUrl) {
    const thumbnail = getYouTubeThumbnail(checklistData.videoUrl);
    html += '<div class="media-container">';
    html += '<div class="media-image">';
    if (thumbnail) {
      html += \`<img src="\${thumbnail}" alt="Video thumbnail">\`;
    }
    html += '<div class="media-overlay">';
    html += '<div class="play-button">';
    html += '<div class="play-icon">▶</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="media-cta">';
    html += \`<a href="\${checklistData.videoUrl}" target="_blank" class="media-button">WATCH ON YOUTUBE</a>\`;
    html += '</div>';
    html += '</div>';
  }
  
  html += '</div>';
  html += '</div>';
  html += '</div>';
  
  // Regular Categories
  checklistData.categories.forEach(category => {
    const progress = getCategoryProgress(category);
    
    html += \`<div class="category" data-category-id="\${category.id}">\`;
    html += \`<button class="category-header" onclick="toggleCategory('\${category.id}')">\`;
    html += '<div class="category-left">';
    html += '<div class="category-icon">📋</div>';
    html += \`<div class="category-title">\${category.name}</div>\`;
    html += '</div>';
    html += '<div class="category-right">';
    if (progress.total > 0) {
      html += \`<div class="progress-badge">\${progress.completed}</div>\`;
    }
    html += '<div class="chevron">▼</div>';
    html += '</div>';
    html += '</button>';
    
    html += '<div class="category-items" style="display: none;">';
    category.items.forEach(item => {
      html += \`<button class="category-item" data-item-id="\${item.id}" onclick="toggleItem('\${item.id}')">\`;
      html += '<div class="item-left">';
      html += '<div class="checkbox"></div>';
      html += \`<div class="item-name">\${item.name}</div>\`;
      html += '</div>';
      html += '<div class="item-chevron">▼</div>';
      html += '</button>';
      
      // Item details
      if (item.bulletPoints && item.bulletPoints.length > 0) {
        html += '<div class="item-details">';
        html += '<ul class="bullet-points">';
        item.bulletPoints.forEach(point => {
          html += \`<li>\${point}</li>\`;
        });
        html += '</ul>';
        if (item.videoUrl) {
          html += \`<a href="\${item.videoUrl}" target="_blank" class="video-link">▶ Watch Video</a>\`;
        }
        html += '</div>';
      } else if (item.videoUrl) {
        html += '<div class="item-details">';
        html += \`<a href="\${item.videoUrl}" target="_blank" class="video-link">▶ Watch Video</a>\`;
        html += '</div>';
      }
    });
    html += '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  
  // Progress Section
  html += '<div class="progress-section">';
  html += '<div class="progress-header">';
  html += '<div class="progress-percentage">0%</div>';
  html += '<button class="reset-button" onclick="resetProgress()">🔄 RESET</button>';
  html += '</div>';
  html += '<div class="progress-bar">';
  html += '<div class="progress-fill"></div>';
  html += '</div>';
  
  // CTA Link
  if (checklistData.callToAction.text && checklistData.callToAction.link) {
    html += \`<a href="\${checklistData.callToAction.link}" target="_blank" class="cta-link">\${checklistData.callToAction.text}</a>\`;
  }
  
  // Banner Ad
  html += '<div class="banner-ad">';
  html += '<div class="banner-title">🎯 Special Offer - Limited Time!</div>';
  html += '<div class="banner-subtitle">Get Premium Tools with 50% Discount</div>';
  html += \`<a href="\${checklistData.callToAction.link || '#'}" target="_blank" class="banner-button">Learn More</a>\`;
  html += '</div>';
  
  html += '</div>';
  
  // Debug Notice
  html += '<div class="debug-notice">';
  html += '<p class="debug-text">✅ Chrome Extension - Production Ready</p>';
  html += '</div>';
  
  html += '</div>';
  
  app.innerHTML = html;
  updateUI();
}

// Initialize
document.addEventListener('DOMContentLoaded', renderChecklist);
`

// Default icon data (base64 encoded simple icon)
const createDefaultIcon = (size) => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  // Draw a simple checklist icon
  ctx.fillStyle = '#3b82f6'
  ctx.fillRect(0, 0, size, size)
  
  ctx.fillStyle = '#ffffff'
  ctx.font = `${size * 0.6}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✓', size / 2, size / 2)
  
  return canvas.toDataURL('image/png')
}

// Main export function
export const exportAsChromeExtension = async (checklist) => {
  try {
    const zip = new JSZip()
    
    // Create manifest.json
    zip.file('manifest.json', JSON.stringify(createManifest(checklist), null, 2))
    
    // Create popup.html
    zip.file('popup.html', createPopupHTML(checklist))
    
    // Create styles.css
    zip.file('styles.css', createCSS(checklist))
    
    // Create popup.js
    zip.file('popup.js', createPopupJS(checklist))
    
    // Create icons folder with default icons
    const iconsFolder = zip.folder('icons')
    
    // Generate default icons if no logo provided
    const icon16 = createDefaultIcon(16)
    const icon48 = createDefaultIcon(48)
    const icon128 = createDefaultIcon(128)
    
    // Convert base64 to blob and add to zip
    const base64ToBlob = (base64) => {
      const byteCharacters = atob(base64.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      return new Uint8Array(byteNumbers)
    }
    
    iconsFolder.file('icon-16.png', base64ToBlob(icon16))
    iconsFolder.file('icon-48.png', base64ToBlob(icon48))
    iconsFolder.file('icon-128.png', base64ToBlob(icon128))
    
    // Create README.md with installation instructions
    const readme = `# ${checklist.name} - Chrome Extension

## Installation Instructions

1. Download and extract this ZIP file
2. Open Chrome and go to \`chrome://extensions/\`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extracted folder
5. The extension will appear in your toolbar

## Usage

Click the extension icon in your Chrome toolbar to open the checklist. Your progress will be automatically saved.

## Features

- Interactive checklist with collapsible categories
- Progress tracking with visual progress bar
- Persistent state (your progress is saved)
- ${checklist.videoUrl ? 'Video integration with YouTube thumbnails' : ''}
- ${checklist.customImage ? 'Custom image with redirect functionality' : ''}
- ${checklist.categories.length} categories with ${checklist.categories.reduce((total, cat) => total + cat.items.length, 0)} total items
- Professional design matching reference layout
- Call-to-action links and banner advertisements

Generated by LeadBlaster Checklist Builder
`
    
    zip.file('README.md', readme)
    
    // Generate and download the ZIP file
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${checklist.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-chrome-extension.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
    
    return {
      success: true,
      filename: link.download
    }
  } catch (error) {
    console.error('Export failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

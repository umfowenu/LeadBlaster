import { useOpenAIStore } from '../stores/openaiStore'

const CHECKLIST_GENERATION_PROMPT = `You are an expert checklist creator. Generate a comprehensive, actionable checklist based on the user's input.

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Checklist Title",
  "description": "Brief description of what this checklist helps accomplish",
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "name": "Task Name",
          "description": "Detailed description of what to do",
          "bulletPoints": [
            "Specific action step 1",
            "Specific action step 2",
            "Specific action step 3"
          ]
        }
      ]
    }
  ]
}

Requirements:
- Create 3-5 categories
- Each category should have 3-6 items
- Each item should have 2-4 bullet points with specific, actionable steps
- Make it comprehensive but not overwhelming
- Focus on practical, real-world actions
- Use clear, professional language

User Input: `

export const generateChecklistWithAI = async (input, inputType = 'keyword') => {
  const { apiKey, hasValidKey } = useOpenAIStore.getState()
  
  if (!hasValidKey()) {
    throw new Error('OpenAI API key is not configured or validated')
  }

  let prompt = CHECKLIST_GENERATION_PROMPT

  // Customize prompt based on input type
  switch (inputType) {
    case 'keyword':
      prompt += `Create a checklist for: "${input}"`
      break
    case 'prompt':
      prompt += `Based on this request: "${input}"`
      break
    case 'usecase':
      prompt += `Create a step-by-step guide for: "${input}"`
      break
    default:
      prompt += input
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to generate checklist')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    // Parse the JSON response
    try {
      const checklistData = JSON.parse(content)
      
      // Validate the structure
      if (!checklistData.name || !checklistData.categories || !Array.isArray(checklistData.categories)) {
        throw new Error('Invalid checklist structure received')
      }

      // Add IDs to categories and items
      const processedData = {
        ...checklistData,
        categories: checklistData.categories.map(category => ({
          ...category,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          items: category.items.map(item => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            completed: false,
            videoUrl: ''
          }))
        }))
      }

      return processedData
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Failed to parse AI response. Please try again.')
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw error
  }
}

'use server'

export async function fetchChatResponse(query: string) {
  const response = await fetch('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  })

  if (!response.ok) {
    throw new Error('Failed to fetch chat response')
  }

  const data = await response.json()
  return data.response
}



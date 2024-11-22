import { nanoid } from 'nanoid';

export async function submitUserMessage(query: string) {
  // Get documentName from cookie
  const documentName = getCookie('documentName');

  const response = await fetch('/api/submitUserMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, documentName }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch response from the chat API');
  }

  const data = await response.json();
  return {
    id: nanoid(),
    response: data.response,
  };
}

export function logout() {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    }
  }
}

export function setSelectedDocumentCookie(documentName: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `documentName=${documentName}; path=/;`;
  }
}


export async function uploadDocument(username: string, documentName: string, content: string) {
  const response = await fetch('/api/uploadDocument', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      documentName,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  return await response.json();
}

export async function fetchDocuments(username: string) {
  try {
    const response = await fetch(`/api/fetchDocuments?username=${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Internal Server Error');
  }
}

// Helper function to get a cookie value by name
function getCookie(name: string): string | null {
  if (typeof document !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  }
  return null;
}
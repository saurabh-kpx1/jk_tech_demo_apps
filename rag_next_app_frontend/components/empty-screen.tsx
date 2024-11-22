import { useState, useEffect } from 'react'
import { fetchDocuments, uploadDocument, setSelectedDocumentCookie } from '@/lib/chat/api'
import { toast } from 'sonner'

export function EmptyScreen({ username }: { username: string }) {
  const [documents, setDocuments] = useState<string[]>([])
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  const loadDocuments = async () => {
    try {
      const response = await fetchDocuments(username)
      setDocuments(response.documents)
    } catch (error) {
      toast.error('Failed to fetch documents')
    }
  }
  useEffect(() => {
    if (selectedDocument !== null) {
      setSelectedDocumentCookie(selectedDocument)
    }
  }, [selectedDocument])

  useEffect(() => {
    loadDocuments()
  }, [username])

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/plain') {
        toast.error('Only .txt files are supported')
        return
      }
      //testing
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          await uploadDocument(username, file.name, reader.result as string)
          toast.success('Document uploaded successfully')
          await loadDocuments() // Refetch documents after upload
        } catch (error) {
          toast.error('Failed to upload document')
        }
      }
      reader.readAsText(file)
    }
  }

  const triggerFileInput = () => {
    document.getElementById('document-upload')?.click()
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8 text-center">
        <h1 className="text-lg font-semibold">
          Welcome to RAG ChatBot Demo
        </h1>
        <p className="leading-normal text-muted-foreground">
          This is a demo chatbot that uses RAG.
        </p>
        {documents.length === 0 && (
          <p className="leading-normal text-muted-foreground">
            You can upload a document to start a conversation.<br/> (Only txt files are supported)
          </p>
        )}
        <div className="p-4 flex justify-center space-x-4">
        {documents.length > 0 && (
          <div>
            <select
              id="document-select"
              value={selectedDocument || ''}
              onChange={(e) => setSelectedDocument(e.target.value)}
              className="block w-full h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
            >
              <option value="" disabled>Select Uploaded Document</option>
              {documents.map((doc, index) => (
                <option key={index} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>
        )}
        {documents.length > 0 && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500">or</span>
          </div>
        )}
        <div>
          <button
            onClick={triggerFileInput}
            className="block w-full min-w-[167px] h-10 text-sm text-white bg-gray-500 border border-gray-500 rounded-lg cursor-pointer p-2 focus:outline-none"
          >
            Upload New Document
          </button>
          <input
            type="file"
            id="document-upload"
            onChange={handleDocumentUpload}
            className="hidden"
          />
        </div>
      </div>
      </div>

    </div>
  )
}

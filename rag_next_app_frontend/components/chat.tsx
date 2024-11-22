'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { uploadDocument, fetchDocuments } from '@/lib/chat/api'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  username: string
}

export function Chat({ id, className, username }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const [documents, setDocuments] = useState<string[]>([]) // State to hold uploaded documents
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null) // State for selected document

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetchDocuments(username)
        setDocuments(response.documents)
      } catch (error) {
        toast.error('Failed to fetch documents')
      }
    }
    loadDocuments()
  }, [username])

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          await uploadDocument(username, file.name, reader.result as string)
          setDocuments((prevDocuments) => [...prevDocuments, file.name])
          toast.success('Document uploaded successfully')
        } catch (error) {
          toast.error('Failed to upload document')
        }
      }
      reader.readAsText(file)
    }
  }

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
{/*     <div className="p-4 flex justify-center space-x-4">
        {documents.length > 0 && (
            <div>
              <select
                id="document-select"
                value={selectedDocument || ''}
                onChange={(e) => setSelectedDocument(e.target.value)}
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
              >
                <option value="" disabled>Select a document</option>
                {documents.map((doc, index) => (
                  <option key={index} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>
          )}
        <div>
          <label htmlFor="document-upload" className="block mb-2 text-sm font-medium text-gray-700">
            Upload Document
          </label>
          <input
            type="file"
            id="document-upload"
            onChange={handleDocumentUpload}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>

      </div> */}

      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        <EmptyScreen username={username} />
        {messages.length && (
          <ChatList messages={messages}/>
        )}
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}

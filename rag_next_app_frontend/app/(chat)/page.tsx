import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const id = nanoid()
  
  // Get username from cookie
  const username = cookies().get('username')?.value ?? '';

  // Redirect to /login if username is not present
  if (!username) {
    redirect('/login');
  }

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} username={username} />
    </AI>
  )
}

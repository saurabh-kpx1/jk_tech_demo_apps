'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconLogout, // Changed from IconGitHub to IconLogout
  IconNextChat,
  IconSeparator,
  IconVercel
} from '@/components/ui/icons'
import { Session } from '@/lib/types'
import { logout } from '@/lib/chat/api'

async function UserOrLogin() {
  // Use the username retrieval logic from file_context_0
  const username = typeof document !== 'undefined' ? (document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1] || '') : '';
  
  return (
    <>
      <Link href="/" rel="nofollow">
        JK Tech RAG Demo
      </Link>
      {username && (
        <div className="flex items-center">
          <IconSeparator className="size-6 text-muted-foreground/50" />
          <Button variant="link" asChild className="-ml-2">
            <Link href="/">Hello {username}</Link>
          </Button>
        </div>
      )}
    </>
  )
}

export function Header() {
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.refresh()
  }

  const username = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1] : null;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        {username && (
          <button
            onClick={handleLogout}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <span className="hidden ml-2 md:flex">Logout</span>
          </button>

          
        )}
{/*         <a
          href="https://vercel.com/templates/Next.js/nextjs-ai-chatbot"
          target="_blank"
          className={cn(buttonVariants())}
        >
          <IconVercel className="mr-2" />
          <span className="hidden sm:block">Explaination Video</span>
        </a> */}
      </div>
    </header>
  )
}

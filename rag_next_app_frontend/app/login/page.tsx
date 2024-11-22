import LoginForm from '@/components/login-form'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const username = cookies().get('username')?.value ?? '';

  if (username) {
    redirect('/');
  }

  return (
    <main className="flex flex-col p-4">
      <LoginForm />
    </main>
  )
}

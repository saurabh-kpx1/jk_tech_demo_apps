import SignupForm from '@/components/signup-form'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  const username = cookies().get('username')?.value ?? '';

  if (username) {
    redirect('/');
  }

  return (
    <main className="flex flex-col p-4">
      <SignupForm />
    </main>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { username } }
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
  }

  const signUpWithGoogle = async () => {
    setError('')
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: 'https://wojkfyosficrfjaxhlyn.supabase.co/auth/v1/callback'
      }
    })
    if (error) setError(error.message)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl border border-gray-100">
        <h1 className="text-xl font-bold mb-4">Sign Up</h1>
        {/* <button onClick={signUpWithGoogle} className="w-full border py-2 rounded mb-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <Image src="/icons/google.svg" alt="Google" width={18} height={18} />
          Continue with Google
        </button> */}
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-pink focus:border-pink transition" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-pink focus:border-pink transition" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-pink focus:border-pink transition" required />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-pink text-white py-2 rounded hover:bg-pink/90 transition-colors disabled:opacity-60">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="mt-4 text-sm text-gray-600">Already have an account? <Link href="/sign-in" className="text-pink hover:text-pink/80">Sign in</Link></p>
      </div>
    </div>
  );
}

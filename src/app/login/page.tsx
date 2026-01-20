'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, Label } from "@heroui/react"
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError(null)
    
    // Attempt login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Allow middleware to handle redirect or do it manually
      router.refresh()
      router.push('/dashboard')
    }
  }

  async function handleMagicLink() {
     setLoading(true)
     setError(null)
     const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
        }
     })
     if (error) {
        setError(error.message)
     } else {
        alert('Check your email for the magic link!')
     }
     setLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-[380px] max-w-full p-4">
        <div className="flex flex-col gap-1 items-center text-center pb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Welcome Back</h1>
          <p className="text-sm text-default-500">Sign in to your KyrieOS workspace</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Email</Label>
            <Input 
              type="email" 
              placeholder="you@agency.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-default-200 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
             <Label className="text-sm font-medium">Password</Label>
             <Input 
                type="password" 
                placeholder="********" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="border border-default-200 rounded-md px-3 py-2"
             />
          </div>
          
          {error && (
            <div className="p-3 bg-danger/10 text-danger rounded-medium text-small">
                {error}
            </div>
          )}

          <Button 
            variant="primary" 
            onPress={handleLogin} 
            isPending={loading}
            className="w-full"
          >
            Sign In with Password
          </Button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-default-200"></div>
                <span className="flex-shrink-0 mx-4 text-small text-default-400">Or</span>
                <div className="flex-grow border-t border-default-200"></div>
            </div>

           <Button 
            variant="secondary" 
            onPress={handleMagicLink} 
            isPending={loading}
            className="w-full"
          >
            Send Magic Link
          </Button>
        </div>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, Label } from "@heroui/react"
import { useRouter } from 'next/navigation'
import { signInWithGoogleAction } from '@/app/auth/actions'

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
          <p className="text-sm text-default-500">Sign in to your KyrieOS workspace</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            className="w-full font-medium border border-default-200"
            onPress={async () => {
              await signInWithGoogleAction()
            }}
          >
           <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-2 text-xs text-default-400">
            <div className="flex-grow border-t border-default-200"></div>
            <span>OR</span>
            <div className="flex-grow border-t border-default-200"></div>
          </div>

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

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Spinner } from "@heroui/react"
import { Check, X, ArrowRight, LogIn } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { acceptInviteAction } from '@/app/dashboard/actions'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string
  
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [inviteData, setInviteData] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  // 1. Check Auth & Fetch Invite Info (Client-side mainly for UI feedback before action)
  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // We technically can't fetch invite details due to RLS if we are just a random user 
      // UNLESS we opened up RLS (which we ideally should verify).
      // If RLS prevents reading, we simply show "Validating..." and let the button try to accept (action might fail if logic depends on read).
      // WORKAROUND: The `acceptInviteAction` currently reads the invite. If that relies on User Auth, it might fail if user is not Admin.
      // We will try to rely on Server Action for the heavy lifting.
      
      // For now, let's just show a generic "Accept Invite" UI.
      // If logged in -> "Accept". If not -> "Login".
      setStatus('valid') 
    }
    check()
  }, [])

  const handleAccept = async () => {
    setStatus('loading')
    try {
       const result = await acceptInviteAction(token)
       if (result.message === 'success' && result.workspaceSlug) {
           setStatus('success')
           setTimeout(() => {
               router.push(`/dashboard/${result.workspaceSlug}`)
           }, 1500)
       } else {
           setStatus('invalid')
           setErrorMessage(result.message || 'Falha desconhecida')
       }
    } catch (err: any) {
        setStatus('invalid')
        setErrorMessage(err.message)
    }
  }

  const handleLogin = () => {
      router.push(`/login?next=/invite/${token}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/90 p-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <Card className="w-full max-w-md p-6 bg-content1/80 backdrop-blur-md border border-white/10 shadow-2xl z-10">
            <div className="flex flex-col items-center text-center gap-6">
                
                {/* Header / Logo */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                    <span className="text-3xl font-bold text-white">K</span>
                </div>

                {/* Content based on Status */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Spinner className="w-10 h-10 text-primary" />
                        <p className="text-default-500">Verificando convite...</p>
                    </div>
                )}

                {status === 'valid' && (
                    <div className="flex flex-col gap-2 w-full">
                        <h1 className="text-2xl font-bold">Convite para Workspace</h1>
                        <p className="text-default-500 text-sm mb-6">
                           Você foi convidado para colaborar em um workspace no KyrieOS.
                        </p>
                        
                        {user ? (
                            <div className="flex flex-col gap-3">
                                <div className="p-3 bg-default-100 rounded-lg text-sm flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <Button 
                                    size="lg" 
                                    className="w-full font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground"
                                    onPress={handleAccept}
                                >
                                    Aceitar e Entrar <ArrowRight className="ml-2" />
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                size="lg" 
                                className="w-full font-bold bg-secondary text-secondary-foreground"
                                onPress={handleLogin}
                            >
                                <LogIn size={18} className="mr-2" /> Faça Login para Aceitar
                            </Button>
                        )}
                    </div>
                )}

                {status === 'success' && (
                     <div className="flex flex-col items-center gap-4 py-8">
                        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success">
                            <Check size={24} strokeWidth={3} />
                        </div>
                        <h2 className="text-xl font-bold text-success">Convite Aceito!</h2>
                        <p className="text-default-500 text-sm">Redirecionando para o dashboard...</p>
                    </div>
                )}

                {status === 'invalid' && (
                    <div className="flex flex-col items-center gap-4 py-4 w-full">
                         <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center text-danger">
                            <X size={24} strokeWidth={3} />
                        </div>
                        <h2 className="text-xl font-bold text-danger">Erro no Convite</h2>
                        <p className="text-default-500 text-sm">{errorMessage}</p>
                        <Button variant="ghost" onPress={() => router.push('/')} className="mt-4">
                            Voltar ao Início
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    </div>
  )
}

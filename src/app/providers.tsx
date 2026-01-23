'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
      <Toaster 
        theme="dark" 
        richColors 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(24, 24, 27, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      />
    </NextThemesProvider>
  )
}

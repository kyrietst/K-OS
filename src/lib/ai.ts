import OpenAI from 'openai'

// Initialize OpenAI client pointing to OpenRouter
export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true // Only if used client-side, but usually we use this server-side. 
  // Since we use it in Server Actions, this flag shouldn't be strictly necessary unless we import it in client components accidentally.
  // Keeping it clean for server usage.
})

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { initializeChat, sendMessage } from './services/hostinger.service'

const app = new Hono()

// CORS Configuration
app.use('*', cors({
  origin: ['https://ownai.koachbase.com', 'http://localhost:5173'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'Chat Proxy' }))

// Chat Schema
const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  userId: z.string().optional().default(() => crypto.randomUUID()),
})

/**
 * Robust Chat Endpoint
 * 1. Validates input using Zod
 * 2. Initializes session
 * 3. Sends message
 * 4. Returns clean response
 */
app.post(
  '/api/chat',
  zValidator('json', chatSchema),
  async (c) => {
    const { message, userId } = c.req.valid('json')

    try {
      // Step 1: Initialize Chat Session
      const initData = await initializeChat(userId)

      // Step 2: Send User Message
      const chatResponse = await sendMessage(userId, message)

      return c.json({
        userId,
        chat: chatResponse
      })
    } catch (error: any) {
      console.error('Chat Proxy Error:', error)
      return c.json(
        {
          success: false,
          error: error.message || 'Internal Server Error',
        },
        500
      )
    }
  }
)

export default app

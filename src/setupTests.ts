import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'
import type { ImageProps } from 'next/image'

// Mock Next.js router
vi.mock('next/router', () => require('next-router-mock'))

// Mock Next.js image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: ImageProps) => {
    return `<img ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} />`
  },
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  auth: () => new Promise<{ userId: string }>((resolve) => resolve({ userId: 'user_123' })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => `<div>${children}</div>`,
  useUser: () => ({
    isSignedIn: true,
    user: {
      id: 'user_123',
      fullName: 'John Doe',
    },
  }),
  useAuth: () => ({
    isSignedIn: true,
    userId: 'user_123',
    sessionId: 'session_123',
    getToken: async () => 'mocked_token',
  }),
}))

// Suppress console errors during tests
console.error = vi.fn()

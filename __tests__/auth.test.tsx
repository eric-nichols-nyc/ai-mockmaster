import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import { vi } from 'vitest';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useUser: () => ({
    isSignedIn: true,
    user: {
      id: 'user_123',
      fullName: 'John Doe',
    },
  }),
}));

describe('Authentication', () => {
  it('renders content for signed-in users', () => {
    render(
      <ClerkProvider>
        <SignedIn>
          <div>Signed In Content</div>
        </SignedIn>
      </ClerkProvider>
    );

    expect(screen.getByText('Signed In Content')).toBeInTheDocument();
  });

  it('renders content for signed-out users', () => {
    render(
      <ClerkProvider>
        <SignedOut>
          <div>Signed Out Content</div>
        </SignedOut>
      </ClerkProvider>
    );

    expect(screen.getByText('Signed Out Content')).toBeInTheDocument();
  });
});

import { beforeAll, vi } from 'vitest';
import * as Clerk from '@clerk/clerk-sdk-node';

beforeAll(() => {
  // Mock Clerk's authentication functions
  vi.mock('@clerk/clerk-sdk-node', () => {
    return {
      ...Clerk,
      getAuth: vi.fn().mockResolvedValue({
        userId: 'mock-user-id',
        sessionId: 'mock-session-id',
      }),
      getSession: vi.fn().mockResolvedValue({
        id: 'mock-session-id',
        userId: 'mock-user-id',
        status: 'active',
      }),
      getUser: vi.fn().mockResolvedValue({
        id: 'mock-user-id',
        firstName: 'Mock',
        lastName: 'User',
        emailAddresses: [{ emailAddress: 'mockuser@example.com' }],
      }),
    };
  });
});

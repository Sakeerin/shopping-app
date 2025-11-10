import { User, UserRole } from '@prisma/client';

export const mockCustomer: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: new Date('2024-01-01'),
  image: null,
  password: '$2a$10$mockhashedpassword',
  provider: 'credentials',
  providerAccountId: null,
  role: UserRole.CUSTOMER,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

export const mockAdmin: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  emailVerified: new Date('2024-01-01'),
  image: null,
  password: '$2a$10$mockhashedpassword',
  provider: 'credentials',
  providerAccountId: null,
  role: UserRole.ADMIN,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

export const mockOAuthUser: User = {
  id: 'oauth-user-1',
  name: 'OAuth User',
  email: 'oauth@example.com',
  emailVerified: new Date('2024-01-01'),
  image: 'https://example.com/avatar.jpg',
  password: null,
  provider: 'google',
  providerAccountId: 'google-123456',
  role: UserRole.CUSTOMER,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

export const mockUsers = [mockCustomer, mockAdmin, mockOAuthUser];

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    ...mockCustomer,
    ...overrides,
    id: overrides.id || `user-${Date.now()}`,
  };
}

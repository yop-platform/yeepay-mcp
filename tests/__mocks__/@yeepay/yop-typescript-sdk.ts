// Mock implementation for @yeepay/yop-typescript-sdk
import { jest } from "@jest/globals";

// Create a simple mock function for YopClient
// @ts-expect-error - Ignoring TypeScript errors for test mocks
export const YopClient = jest.fn(() => ({
  post: jest.fn(),
}));

// Log when the mock is loaded
console.log("Loaded MOCK @yeepay/yop-typescript-sdk");

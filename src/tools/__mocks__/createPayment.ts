import { jest } from '@jest/globals';

// Export a Jest mock function with the same name as the original
export const createMobileYeepayPayment = jest.fn();

// We don't need to export the type CreatePaymentSuccessResponse from the mock
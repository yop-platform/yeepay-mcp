// tests/integration.test.ts
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { CreatePaymentSuccessResponse } from '../src/tools/createPayment';
// Define a minimal structure for the mock based on its usage in queryPayment.ts
interface MockYeepayQueryResult {
    code: string;
    message: string;
    orderId: string;
    uniqueOrderNo: string;
    status: string;
}


// Restore top-level module mocks
jest.mock('../src/tools/createPayment');
jest.mock('../src/tools/queryPayment');

// Mock the config module first (factory mocks often work better at top level)
jest.mock('../src/config', () => ({
  config: {
    parentMerchantNo: 'mockParentMerchantNo123',
    merchantNo: 'mockMerchantNo456',
    secretKey: 'mockSecretKey789',
    appKey: 'mockAppKey101',
    notifyUrl: 'http://mock.test/notify',
    yopPublicKey: '-----BEGIN PUBLIC KEY-----\nMOCK_YOP_PUBLIC_KEY_CONTENT\n-----END PUBLIC KEY-----'
  }
}));

// Type definitions for the functions we are mocking (needed for variable types)
type CreateMobileYeepayPaymentType = typeof import('../src/tools/createPayment').createMobileYeepayPayment;
type QueryYeepayPaymentStatusType = typeof import('../src/tools/queryPayment').queryYeepayPaymentStatus;

describe('Yeepay Payment Integration Flow', () => {
  // Declare variables in describe scope to hold the actual mock functions
  let mockedCreatePayment: jest.MockedFunction<CreateMobileYeepayPaymentType>;
  let mockedQueryPayment: jest.MockedFunction<QueryYeepayPaymentStatusType>;

  beforeEach(async () => {
    // Dynamically import the modules - jest.mock should ensure these resolve to the mocks
    const createPaymentMockModule = await import('../src/tools/createPayment');
    const queryPaymentMockModule = await import('../src/tools/queryPayment');

    // Assign the imported mock functions (jest.fn() from __mocks__)
    mockedCreatePayment = createPaymentMockModule.createMobileYeepayPayment as jest.MockedFunction<CreateMobileYeepayPaymentType>;
    mockedQueryPayment = queryPaymentMockModule.queryYeepayPaymentStatus as jest.MockedFunction<QueryYeepayPaymentStatusType>;

    // Reset mocks before each test
    mockedCreatePayment.mockClear();
    mockedQueryPayment.mockClear();
  });

  it('should create a payment and then query its status successfully', async () => {
    // --- Arrange ---
    const testOrderId = `TEST_${Date.now()}`;
    const testUniqueOrderNo = `YOP_${testOrderId}`;
    const testPrePayTn = `TN_${testOrderId}`;
    const testAmount = 0.01;
    const testGoodsName = 'Test Product';

    // Configure mocks using the top-level variables
    const mockCreateResponse: CreatePaymentSuccessResponse = {
      prePayTn: testPrePayTn,
      orderId: testOrderId,
      uniqueOrderNo: testUniqueOrderNo,
    };
    mockedCreatePayment.mockResolvedValue(mockCreateResponse);

    // Configure the mock for queryYeepayPaymentStatus
    const mockQueryResponse: MockYeepayQueryResult = { // Use the minimal mock interface
        code: 'OPR00000',
        message: '查询成功',
        orderId: testOrderId,
        uniqueOrderNo: testUniqueOrderNo,
        status: 'SUCCESS',
    };
    mockedQueryPayment.mockResolvedValue(mockQueryResponse as any); // Use 'as any' if types strictly mismatch

    // --- Act ---
    // 1. Call create payment
    const createInput = {
      orderId: testOrderId,
      amount: testAmount,
      goodsName: testGoodsName,
    };
    // Call the mocked function via the variable assigned in beforeEach
    const createResponse = await mockedCreatePayment(createInput);

    // 2. Extract uniqueOrderNo (simulated)
    const uniqueOrderNoFromCreate = createResponse.uniqueOrderNo;

    // 3. Call query payment status using the orderId from create response
    const queryInput = {
      orderId: createResponse.orderId,
    };
     // Call the mocked function via the variable assigned in beforeEach
    const queryResponse = await mockedQueryPayment(queryInput);

    // --- Assert ---
    // Verify create payment mock
    expect(mockedCreatePayment).toHaveBeenCalledTimes(1);
    expect(mockedCreatePayment).toHaveBeenCalledWith(createInput);
    expect(createResponse).toEqual(mockCreateResponse);
    expect(uniqueOrderNoFromCreate).toBe(testUniqueOrderNo);

    // Verify query payment mock
    expect(mockedQueryPayment).toHaveBeenCalledTimes(1);
    expect(mockedQueryPayment).toHaveBeenCalledWith(queryInput);
    expect(queryResponse).toEqual(mockQueryResponse);
    expect(queryResponse.status).toBe('SUCCESS');
    expect(queryResponse.uniqueOrderNo).toBe(testUniqueOrderNo);
  });

  // Test case for creation failure
  it('should handle error during payment creation', async () => {
    // --- Arrange ---
    const testOrderId = `FAIL_CREATE_${Date.now()}`;
    const creationError = new Error('Yeepay API Failure: AUTH_ERROR - Invalid credentials');
    // Configure mock for this test
    mockedCreatePayment.mockRejectedValue(creationError);

    // --- Act & Assert ---
    await expect(mockedCreatePayment({
      orderId: testOrderId,
      amount: 0.02,
      goodsName: 'Fail Product',
    })).rejects.toThrow(creationError);

    expect(mockedQueryPayment).not.toHaveBeenCalled();
  });

    // Test case for query failure
  it('should handle error during payment status query', async () => {
    // --- Arrange ---
    const testOrderId = `FAIL_QUERY_${Date.now()}`;
    const testUniqueOrderNo = `YOP_${testOrderId}`;
    const testPrePayTn = `TN_${testOrderId}`;

    const mockCreateResponse: CreatePaymentSuccessResponse = {
      prePayTn: testPrePayTn,
      orderId: testOrderId,
      uniqueOrderNo: testUniqueOrderNo,
    };
    // Configure mocks for this test
    mockedCreatePayment.mockResolvedValue(mockCreateResponse);
    const queryError = new Error('Yeepay Business Error: BIZ_ORDER_NOT_EXIST - Order not found');
    mockedQueryPayment.mockRejectedValue(queryError);

     // --- Act ---
    // 1. Call create payment (expected to succeed)
    // Call the mocked function via the variable assigned in beforeEach
    const createResponse = await mockedCreatePayment({
      orderId: testOrderId,
      amount: 0.03,
      goodsName: 'Query Fail Product',
    });

    // 2. Call query payment status (expected to fail)
    // --- Assert ---
    await expect(mockedQueryPayment({
        orderId: createResponse.orderId,
    })).rejects.toThrow(queryError);

    expect(mockedCreatePayment).toHaveBeenCalledTimes(1);
    expect(mockedQueryPayment).toHaveBeenCalledTimes(1);
    expect(mockedQueryPayment).toHaveBeenCalledWith({ orderId: testOrderId });
  });
});
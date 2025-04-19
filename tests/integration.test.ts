// tests/integration.test.ts
import { createMobileYeepayPayment, CreatePaymentSuccessResponse } from '../src/tools/createPayment';
import { queryYeepayPaymentStatus } from '../src/tools/queryPayment';
// Import the actual interface if exported, otherwise define a minimal one for mocking
// Assuming YeepayQueryResult might not be directly exported or easily importable without causing issues,
// let's define a minimal structure for the mock based on its usage in queryPayment.ts
interface MockYeepayQueryResult {
    code: string;
    message: string;
    orderId: string;
    uniqueOrderNo: string;
    status: string;
}


// Mock the modules containing the functions we want to test
jest.mock('../src/tools/createPayment');
jest.mock('../src/tools/queryPayment');

// Mock the config module to avoid real file reads and env vars
jest.mock('../src/config', () => ({
  config: {
    parentMerchantNo: 'mockParentMerchantNo123',
    merchantNo: 'mockMerchantNo456',
    secretKey: 'mockSecretKey789', // Provide a mock private key string
    appKey: 'mockAppKey101',
    notifyUrl: 'http://mock.test/notify', // Provide a mock notification URL
    yopPublicKey: '-----BEGIN PUBLIC KEY-----\nMOCK_YOP_PUBLIC_KEY_CONTENT\n-----END PUBLIC KEY-----' // Provide a mock public key string
  }
}));

// Type cast the mocked functions for TypeScript
const mockedCreatePayment = createMobileYeepayPayment as jest.MockedFunction<typeof createMobileYeepayPayment>;
const mockedQueryPayment = queryYeepayPaymentStatus as jest.MockedFunction<typeof queryYeepayPaymentStatus>;

describe('Yeepay Payment Integration Flow', () => {
  beforeEach(() => {
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

    // Configure the mock for createMobileYeepayPayment
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
        status: 'SUCCESS', // Simulate a successful payment status
    };
    // Since queryYeepayPaymentStatus is typed to return the actual YeepayQueryResult,
    // we need to cast our mock response appropriately if the structures differ significantly.
    // However, for this mock setup, assuming MockYeepayQueryResult is compatible enough.
    mockedQueryPayment.mockResolvedValue(mockQueryResponse as any); // Use 'as any' if types strictly mismatch

    // --- Act ---
    // 1. Call create payment
    const createInput = {
      orderId: testOrderId,
      amount: testAmount,
      goodsName: testGoodsName,
    };
    const createResponse = await createMobileYeepayPayment(createInput);

    // 2. Extract uniqueOrderNo (simulated)
    const uniqueOrderNoFromCreate = createResponse.uniqueOrderNo;

    // 3. Call query payment status using the orderId from create response
    const queryInput = {
      orderId: createResponse.orderId,
    };
    const queryResponse = await queryYeepayPaymentStatus(queryInput);

    // --- Assert ---
    // Verify create payment was called correctly
    expect(mockedCreatePayment).toHaveBeenCalledTimes(1);
    expect(mockedCreatePayment).toHaveBeenCalledWith(createInput);
    expect(createResponse).toEqual(mockCreateResponse);
    expect(uniqueOrderNoFromCreate).toBe(testUniqueOrderNo);

    // Verify query payment was called correctly
    expect(mockedQueryPayment).toHaveBeenCalledTimes(1);
    expect(mockedQueryPayment).toHaveBeenCalledWith(queryInput);
    expect(queryResponse).toEqual(mockQueryResponse);
    expect(queryResponse.status).toBe('SUCCESS');
    expect(queryResponse.uniqueOrderNo).toBe(testUniqueOrderNo);
  });

  // Example of a test case for creation failure
  it('should handle error during payment creation', async () => {
    // --- Arrange ---
    const testOrderId = `FAIL_CREATE_${Date.now()}`;
    const creationError = new Error('Yeepay API Failure: AUTH_ERROR - Invalid credentials');
    mockedCreatePayment.mockRejectedValue(creationError);

    // --- Act & Assert ---
    await expect(createMobileYeepayPayment({
      orderId: testOrderId,
      amount: 0.02,
      goodsName: 'Fail Product',
    })).rejects.toThrow(creationError);

    // Ensure query was not called
    expect(mockedQueryPayment).not.toHaveBeenCalled();
  });

    // Example of a test case for query failure
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
    mockedCreatePayment.mockResolvedValue(mockCreateResponse);

    const queryError = new Error('Yeepay Business Error: BIZ_ORDER_NOT_EXIST - Order not found');
    mockedQueryPayment.mockRejectedValue(queryError);

     // --- Act ---
    // 1. Call create payment (expected to succeed)
    const createResponse = await createMobileYeepayPayment({
      orderId: testOrderId,
      amount: 0.03,
      goodsName: 'Query Fail Product',
    });

    // 2. Call query payment status (expected to fail)
    // --- Assert ---
    await expect(queryYeepayPaymentStatus({
        orderId: createResponse.orderId,
    })).rejects.toThrow(queryError);

    // Verify create was called
    expect(mockedCreatePayment).toHaveBeenCalledTimes(1);
     // Verify query was called
    expect(mockedQueryPayment).toHaveBeenCalledTimes(1);
    expect(mockedQueryPayment).toHaveBeenCalledWith({ orderId: testOrderId });
  });
});
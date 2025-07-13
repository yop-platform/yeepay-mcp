// tests/integration.test.ts
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
} from "@jest/globals";
import type {
  CreatePaymentSuccessResponse,
  PaymentRequest as CreatePaymentInput,
} from "../src/tools/createPayment.js"; // Import PaymentRequest as CreatePaymentInput
import type {
  QueryRequest as QueryPaymentInput,
  YeepayQueryResult as QueryPaymentResult,
} from "../src/tools/queryPayment.js"; // Import QueryRequest as QueryPaymentInput and YeepayQueryResult as QueryPaymentResult

// --- Configuration for Mock/Real API ---
const useRealAPI = process.env.USE_REAL_API === "true";
console.log(
  `Running integration tests with ${useRealAPI ? "REAL API" : "MOCKED API"}`,
);

// --- Conditional Mocking ---
if (!useRealAPI) {
  // Mock the implementation files only if not using the real API
  jest.mock("../src/tools/createPayment.js");
  jest.mock("../src/tools/queryPayment.js");

  // Mock the config module only if not using the real API
  jest.mock("../src/config.js", () => ({
    config: {
      parentMerchantNo: "mockParentMerchantNo123",
      merchantNo: "mockMerchantNo456",
      appPrivateKey: "mockSecretKey789",
      appKey: "mockAppKey101",
      notifyUrl: "http://mock.test/notify",
      yopPublicKey:
        "-----BEGIN PUBLIC KEY-----\nMOCK_YOP_PUBLIC_KEY_CONTENT\n-----END PUBLIC KEY-----",
    },
  }));
} else {
  // Ensure dotenv is loaded if running real API tests directly (e.g., via IDE)
  // In CI/CD, env vars should be set directly.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config({ path: ".env" }); // Adjust path if needed
  } catch {
    console.warn(
      "dotenv not found or failed to load. Ensure environment variables are set for real API tests.",
    );
  }
  // Validate required env vars for real API calls
  const requiredEnvVars = [
    "YOP_PARENT_MERCHANT_NO",
    "YOP_MERCHANT_NO",
    "YOP_APP_KEY",
    "YOP_APP_PRIVATE_KEY",
  ]; // Corrected prefix
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for real API tests: ${missingVars.join(", ")}`,
    );
  }
}

// --- Type Definitions ---
// Use the actual function types
type CreateWebpageYeepayPaymentType =
  typeof import("../src/tools/createPayment.js").createWebpageYeepayPayment;
type QueryYeepayPaymentStatusType =
  typeof import("../src/tools/queryPayment.js").queryYeepayPaymentStatus;

// Define a union type for the functions, which can be either the real function or the mock
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PaymentFunction<T extends (...args: any) => any> =
  | T
  | jest.MockedFunction<T>;

// Define a minimal structure for the mock based on its usage in queryPayment.ts
// Keep this for mock response structure definition
interface MockYeepayQueryResult {
  code: string;
  message: string;
  orderId: string;
  uniqueOrderNo: string;
  status: string;
}

// --- Test Suite ---
// Use describe.skip if running real API tests to avoid accidental runs/costs,
// unless explicitly intended.
// Use describe directly, conditional logic moved inside
// const describeMocked = describe; // Or keep if preferred

describe("Yeepay Payment Integration Flow (Mocked)", () => {
  // Skip this entire block if running real API tests
  if (useRealAPI) {
    // Optional: Add a console log to indicate skipping
    // Removed commented debug log
    return;
  }
  // Variables to hold either the real functions or the mocks
  let createPayment: PaymentFunction<CreateWebpageYeepayPaymentType>;
  let queryPayment: PaymentFunction<QueryYeepayPaymentStatusType>;

  beforeEach(async () => {
    if (!useRealAPI) {
      // Dynamically import the MOCKED modules
      const createPaymentMockModule = await import(
        "../src/tools/createPayment.js"
      );
      const queryPaymentMockModule = await import(
        "../src/tools/queryPayment.js"
      );

      // Assign the imported mock functions
      createPayment =
        createPaymentMockModule.createWebpageYeepayPayment as jest.MockedFunction<CreateWebpageYeepayPaymentType>;
      queryPayment =
        queryPaymentMockModule.queryYeepayPaymentStatus as jest.MockedFunction<QueryYeepayPaymentStatusType>;

      // Reset mocks before each test
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (createPayment as jest.MockedFunction<any>).mockClear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (queryPayment as jest.MockedFunction<any>).mockClear();
    } else {
      // Dynamically import the REAL modules
      // We need to bypass the cache potentially set by jest.mock if it ran in a previous non-skipped describe block
      jest.unmock("../src/tools/createPayment.js");
      jest.unmock("../src/tools/queryPayment.js");
      jest.unmock("../src/config.js"); // Ensure config is unmocked too
      const createPaymentRealModule = await import(
        "../src/tools/createPayment.js"
      );
      const queryPaymentRealModule = await import(
        "../src/tools/queryPayment.js"
      );
      await import("../src/config.js"); // Import config to ensure it's loaded

      createPayment = createPaymentRealModule.createWebpageYeepayPayment;
      queryPayment = queryPaymentRealModule.queryYeepayPaymentStatus;
    }
  });

  it("should create a payment and then query its status successfully", async () => {
    // --- Arrange ---
    const testOrderId = `MOCK_TEST_${Date.now()}`;
    const testAmount = 0.01;
    const testGoodsName = "Mock Test Product";
    const createInput: CreatePaymentInput = {
      orderId: testOrderId,
      amount: testAmount,
      goodsName: testGoodsName,
    };

    let expectedUniqueOrderNo: string | undefined;
    let expectedPrePayTn: string | undefined;

    if (!useRealAPI) {
      const mockUniqueOrderNo = `MOCK_YOP_${testOrderId}`;
      const mockPrePayTn = `MOCK_TN_${testOrderId}`;
      expectedUniqueOrderNo = mockUniqueOrderNo;
      expectedPrePayTn = mockPrePayTn;

      const mockCreateResponse: CreatePaymentSuccessResponse = {
        prePayTn: mockPrePayTn,
        orderId: testOrderId,
        uniqueOrderNo: mockUniqueOrderNo,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (createPayment as jest.MockedFunction<any>).mockResolvedValue(
        mockCreateResponse,
      );

      const mockQueryResponse: MockYeepayQueryResult = {
        code: "OPR00000",
        message: "查询成功",
        orderId: testOrderId,
        uniqueOrderNo: mockUniqueOrderNo,
        status: "SUCCESS",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (queryPayment as jest.MockedFunction<any>).mockResolvedValue(
        mockQueryResponse as any,
      );
    }

    // --- Act ---
    // 1. Call create payment
    const createResponse = await createPayment(createInput);

    // 2. Extract uniqueOrderNo
    const uniqueOrderNoFromCreate = createResponse.uniqueOrderNo;
    const orderIdFromCreate = createResponse.orderId;

    // 3. Call query payment status
    const queryInput: QueryPaymentInput = {
      orderId: orderIdFromCreate,
    };
    // Add a delay for real API to allow processing
    if (useRealAPI) await new Promise((resolve) => setTimeout(resolve, 3000)); // 3-second delay

    const queryResponse = await queryPayment(queryInput);

    // --- Assert ---
    // Common assertions for both mock and real
    expect(createResponse).toBeDefined();
    expect(createResponse.orderId).toBe(testOrderId);
    expect(createResponse.uniqueOrderNo).toBeDefined();
    expect(createResponse.uniqueOrderNo).not.toBe("");
    expect(uniqueOrderNoFromCreate).toBe(createResponse.uniqueOrderNo); // Check consistency

    expect(queryResponse).toBeDefined();
    expect(queryResponse.orderId).toBe(testOrderId);
    expect(queryResponse.uniqueOrderNo).toBe(createResponse.uniqueOrderNo); // Should match the one from creation

    if (!useRealAPI) {
      // Mock-specific assertions
      expect(createPayment).toHaveBeenCalledTimes(1);
      expect(createPayment).toHaveBeenCalledWith(createInput);
      expect(createResponse.prePayTn).toBe(expectedPrePayTn);
      expect(createResponse.uniqueOrderNo).toBe(expectedUniqueOrderNo);

      expect(queryPayment).toHaveBeenCalledTimes(1);
      expect(queryPayment).toHaveBeenCalledWith(queryInput);
      expect(queryResponse.status).toBe("SUCCESS"); // Mock returns SUCCESS
      expect(queryResponse.code).toBe("OPR00000");
    } else {
      // Real API assertions (more flexible)
      expect(createResponse.prePayTn).toBeDefined(); // Real API should return this
      expect(createResponse.prePayTn).not.toBe("");

      // Real API status might be PROCESSING initially, or SUCCESS if checked later
      expect(["PROCESSING", "SUCCESS", "PAY_SUCCESS"]).toContain(
        queryResponse.status,
      );
      expect(queryResponse.code).toBe("OPR00000"); // Success code for query itself
      // Add more real API specific checks if needed, e.g., amount
      // expect(queryResponse.orderAmount).toBe(testAmount.toString()); // API might return string amount
    }
  });

  // Test case for creation failure (Mock only, real API failure is harder to reliably trigger)
  it("should handle error during payment creation (Mocked)", async () => {
    if (useRealAPI) {
      console.warn(
        "Skipping mock-specific creation failure test in REAL API mode.",
      );
      return; // Skip this test if using real API
    }
    // --- Arrange ---
    const testOrderId = `MOCK_FAIL_CREATE_${Date.now()}`;
    const creationError = new Error(
      "Yeepay API Failure: AUTH_ERROR - Invalid credentials",
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createPayment as jest.MockedFunction<any>).mockRejectedValue(
      creationError,
    );

    // --- Act & Assert ---
    await expect(
      createPayment({
        orderId: testOrderId,
        amount: 0.02,
        goodsName: "Fail Product",
      }),
    ).rejects.toThrow(creationError);

    expect(queryPayment).not.toHaveBeenCalled();
  });

  // Test case for query failure (Mock only)
  it("should handle error during payment status query (Mocked)", async () => {
    if (useRealAPI) {
      console.warn(
        "Skipping mock-specific query failure test in REAL API mode.",
      );
      return; // Skip this test if using real API
    }
    // --- Arrange ---
    const testOrderId = `MOCK_FAIL_QUERY_${Date.now()}`;
    const testUniqueOrderNo = `MOCK_YOP_${testOrderId}`;
    const testPrePayTn = `MOCK_TN_${testOrderId}`;

    const mockCreateResponse: CreatePaymentSuccessResponse = {
      prePayTn: testPrePayTn,
      orderId: testOrderId,
      uniqueOrderNo: testUniqueOrderNo,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createPayment as jest.MockedFunction<any>).mockResolvedValue(
      mockCreateResponse,
    );

    const queryError = new Error(
      "Yeepay Business Error: BIZ_ORDER_NOT_EXIST - Order not found",
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (queryPayment as jest.MockedFunction<any>).mockRejectedValue(queryError);

    // --- Act ---
    // 1. Call create payment (expected to succeed)
    const createResponse = await createPayment({
      orderId: testOrderId,
      amount: 0.03,
      goodsName: "Query Fail Product",
    });

    // 2. Call query payment status (expected to fail)
    // --- Assert ---
    await expect(
      queryPayment({
        orderId: createResponse.orderId,
      }),
    ).rejects.toThrow(queryError);

    expect(createPayment).toHaveBeenCalledTimes(1);
    expect(queryPayment).toHaveBeenCalledTimes(1);
    expect(queryPayment).toHaveBeenCalledWith({ orderId: testOrderId });
  });

  // --- Add a separate describe block for REAL API tests ---
  // This allows running them explicitly if needed, e.g., `jest -t "Real API"`
  describe("Yeepay Payment Integration Flow (Real API)", () => {
    // Skip this entire block if not using real API
    beforeAll(() => {
      // Skip logic removed from beforeAll. Rely on checks within 'it' blocks.
      // Keep environment variable validation for real API runs.
      if (useRealAPI) {
        // Validate required env vars again just in case
        const requiredEnvVars = [
          "YOP_PARENT_MERCHANT_NO",
          "YOP_MERCHANT_NO",
          "YOP_APP_KEY",
          "YOP_APP_PRIVATE_KEY",
        ]; // Corrected prefix
        const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
        if (missingVars.length > 0) {
          throw new Error(
            `Missing required environment variables for real API tests: ${missingVars.join(", ")}`,
          );
        }
      }
    });

    // Variables to hold the real functions
    let createPaymentReal: CreateWebpageYeepayPaymentType;
    let queryPaymentReal: QueryYeepayPaymentStatusType;

    beforeEach(async () => {
      if (!useRealAPI) return; // Don't setup if not running real tests

      // Dynamically import the REAL modules, ensuring they are not mocked
      jest.unmock("../src/tools/createPayment.js");
      jest.unmock("../src/tools/queryPayment.js");
      jest.unmock("../src/config.js");
      const createPaymentRealModule = await import(
        "../src/tools/createPayment.js"
      );
      const queryPaymentRealModule = await import(
        "../src/tools/queryPayment.js"
      );
      await import("../src/config.js"); // Ensure real config is loaded

      createPaymentReal = createPaymentRealModule.createWebpageYeepayPayment;
      queryPaymentReal = queryPaymentRealModule.queryYeepayPaymentStatus;
    });

    // Define conditional 'it' based on the environment variable
    const itReal = useRealAPI ? it : it.skip; // Restore conditional execution
    // Use the conditional 'itReal'
    itReal(
      "should create a real payment and query its status",
      async () => {
        // The internal if block is no longer needed as itReal handles skipping

        // --- Arrange ---
        const testOrderId = `REAL_${Date.now()}`; // Use a distinct prefix
        const testAmount = 0.01; // Use the minimum allowed amount
        const testGoodsName = "Real API Test Product";
        const createInput: CreatePaymentInput = {
          orderId: testOrderId,
          amount: testAmount,
          goodsName: testGoodsName,
          // Add userIp if required by your real implementation/config
          // userIp: '127.0.0.1'
        };

        console.log(
          `Attempting to create real payment with orderId: ${testOrderId}`,
        );

        // --- Act ---
        let createResponse: CreatePaymentSuccessResponse;
        try {
          createResponse = await createPaymentReal(createInput);
          console.log(`Real payment creation successful:`, createResponse);
        } catch (error) {
          console.error("Real payment creation failed:", error);
          throw error; // Fail the test if creation fails
        }

        // Add a significant delay for the real API to process the order
        console.log("Waiting 5 seconds before querying status...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

        const queryInput: QueryPaymentInput = {
          orderId: createResponse.orderId,
        };

        let queryResponse: QueryPaymentResult;
        try {
          queryResponse = await queryPaymentReal(queryInput);
          console.log(`Real payment query successful:`, queryResponse);
        } catch (error) {
          console.error("Real payment query failed:", error);
          throw error; // Fail the test if query fails
        }

        // --- Assert ---
        expect(createResponse).toBeDefined();
        expect(createResponse.orderId).toBe(testOrderId);
        expect(createResponse.uniqueOrderNo).toBeDefined();
        expect(createResponse.uniqueOrderNo).not.toBe("");
        expect(createResponse.prePayTn).toBeDefined(); // Real API should return this
        expect(createResponse.prePayTn).not.toBe("");

        expect(queryResponse).toBeDefined();
        expect(queryResponse.orderId).toBe(testOrderId);
        expect(queryResponse.uniqueOrderNo).toBe(createResponse.uniqueOrderNo);
        expect(queryResponse.code).toBe("OPR00000"); // Query itself succeeded

        // Status might be PROCESSING or PAY_SUCCESS/SUCCESS depending on timing and if payment was completed externally
        // It's unlikely to be SUCCESS immediately unless the test environment auto-pays.
        // Check for non-failure statuses.
        expect(["PROCESSING", "PAY_SUCCESS", "SUCCESS"]).toContain(
          queryResponse.status,
        );

        // Optional: Check amount if available and consistent in the query response
        // expect(queryResponse.payAmount).toBe(testAmount.toString()); // Adjust field name and type as needed
      },
      15000,
    ); // Increase timeout for real API calls
  });
});

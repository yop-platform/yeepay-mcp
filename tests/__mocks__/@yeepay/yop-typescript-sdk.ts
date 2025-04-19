// Mock implementation for @yeepay/yop-typescript-sdk

// Mock YopConfig type (can be empty or match used properties)
export interface YopConfig {
  appKey?: string;
  secretKey?: string;
  yopPublicKey?: string;
  // Add other properties if your code uses them
}

// Mock YopClient class
export class YopClient {
  constructor(config: YopConfig) {
    console.log('Mock YopClient initialized with config:', config);
  }

  // Mock the 'post' method used in createPayment.ts
  async post(apiUrl: string, requestBody: Record<string, any>): Promise<any> {
    console.log(`Mock YopClient.post called for API: ${apiUrl}`);
    console.log('Mock YopClient.post request body:', requestBody);

    // Return a mock success response structure similar to the real API
    // Adjust this based on what your test actually needs
    if (apiUrl.includes('pre-pay')) {
       return Promise.resolve({
         state: 'SUCCESS',
         result: {
           code: '00000', // Simulate success code
           message: 'Mock Success',
           prePayTn: 'mock_prepay_tn_' + Date.now(),
           orderId: requestBody.orderId || 'mock_order_id',
           uniqueOrderNo: 'mock_unique_order_' + Date.now(),
         },
       });
    }
    // Return a generic mock response for other APIs if needed
    return Promise.resolve({ state: 'SUCCESS', result: { code: '00000', message: 'Mock Generic Success'} });
  }

  // Add mock implementations for other methods if needed by tests
}

// Mock other exports if your code imports them
// export const someOtherExport = {};

console.log('Loaded MOCK @yeepay/yop-typescript-sdk');
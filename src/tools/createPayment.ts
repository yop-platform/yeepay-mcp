import { config as appConfig } from '../config.js';
import { YopClient, YopConfig, YopResult } from '@yeepay/yop-typescript-sdk';

export interface PaymentRequest { // Add export
  orderId: string;
  amount: number;
  goodsName: string;
  payWay?: string; // Optional, default provided below
  channel?: string; // Optional, default provided below
  userIp?: string;
  userId?: string;
}

// Structure of the 'result' object in a successful response
interface YeepaySuccessResult extends YopResult {
  prePayTn: string;
  orderId: string;
  uniqueOrderNo: string;
}

// Structure of the 'error' object in a failed response
interface YeepayErrorResult {
  code: string;
  message: string;
}

// Overall structure of the Yeepay API response
interface YeepayResponse {
  state: 'SUCCESS' | 'FAILURE' | string; // Includes possible unknown states
  result?: YeepaySuccessResult;
  error?: YeepayErrorResult;
}

// Structure for a successful function return
export interface CreatePaymentSuccessResponse {
  prePayTn: string;
  orderId: string;
  uniqueOrderNo: string;
}


// Structure for the request body sent to Yeepay API
interface YeepayRequestBody {
  parentMerchantNo: string;
  merchantNo: string;
  orderId: string;
  orderAmount: string; // Amount as string for the API
  goodsName: string;
  payWay: string;
  channel: string;
  scene: string;
  userIp: string;
  notifyUrl: string;
  userId?: string;
}

export async function createWebpageYeepayPayment(input: PaymentRequest): Promise<CreatePaymentSuccessResponse> {
  try {
    const { parentMerchantNo, merchantNo, appPrivateKey, appKey, notifyUrl, yopPublicKey } = appConfig;

    const yopConfig: YopConfig = {
      appKey,
      appPrivateKey,
      yopApiBaseUrl: 'https://openapi.yeepay.com',
      yopPublicKey
    };

    const yopClient = new YopClient(yopConfig);

    const requestBody: YeepayRequestBody = {
      parentMerchantNo,
      merchantNo,
      orderId: input.orderId,
      orderAmount: String(input.amount),
      goodsName: input.goodsName,
      payWay: input.payWay || 'USER_SCAN', // Default value
      channel: input.channel || 'WECHAT', // Default value
      scene: 'ONLINE',
      userIp: input.userIp || '127.0.0.1',
      notifyUrl: notifyUrl
    };

    if (input.userId !== undefined) {
      requestBody.userId = input.userId;
    }
    console.info("[CreatePayment] Request Body:", JSON.stringify(requestBody, null, 2));

    const apiUrl = '/rest/v1.0/aggpay/pre-pay';

    // Assert requestBody to Record<string, unknown> to satisfy the SDK's post method signature
    // Use double assertion as suggested by the compiler for safer type casting
    const responseData = await yopClient.post(apiUrl, requestBody as unknown as Record<string, unknown>) as YeepayResponse;
    console.info("[CreatePayment] Raw Response Data:", JSON.stringify(responseData, null, 2)); // 打印原始响应

    // We already checked responseData exists, so only check result existence here if needed by logic
    if (responseData && responseData.state === 'SUCCESS') {
      if (responseData.result && responseData.result.code === '00000') {
        // Success state and business code 00000
        const { prePayTn, orderId, uniqueOrderNo } = responseData.result;
        console.info("[CreatePayment] Success:", JSON.stringify({ prePayTn, orderId, uniqueOrderNo }));
        return { prePayTn, orderId, uniqueOrderNo };
      } else {
        // Success state but non-00000 business code indicates business failure
        const errorCode = responseData.result?.code || 'UNKNOWN_CODE';
        const errorMessage = responseData.result?.message || 'Unknown Yeepay business error message';
        const errorLog = `[CreatePayment] Yeepay API Business Error (state: SUCCESS): Code=${errorCode}, Message=${errorMessage}`;
        console.error(errorLog);
        throw new Error(`Yeepay Business Error: ${errorCode} - ${errorMessage}`);
      }
    } else if (responseData && responseData.state === 'FAILURE') {
      // Failure state
      const errorCode = responseData.error?.code || 'UNKNOWN_FAILURE_CODE';
      const errorMessage = responseData.error?.message || 'Unknown Yeepay failure message';
      const errorLog = `[CreatePayment] Yeepay API Failure (state: FAILURE): Code=${errorCode}, Message=${errorMessage}`;
      console.error(errorLog);
      throw new Error(`Yeepay API Failure: ${errorCode} - ${errorMessage}`);
    } else {
      // Unknown state or other unexpected response structure
      const errorLog = `[CreatePayment] Unknown or Unexpected Yeepay API Response State: ${responseData?.state || 'State Undefined'}. Response: ${JSON.stringify(responseData)}`;
      console.error(errorLog);
      throw new Error(`Unknown Yeepay API response state: ${responseData?.state}`);
    }
  } catch (error: unknown) {
    // Catch standardized errors from YopClient or business errors thrown within this function
    console.error("[CreatePayment] Overall Error:", error);
    // Re-throw the error directly, preserving stack trace
    if (error instanceof Error) {
        throw error;
    } else {
        // Wrap non-Error exceptions before re-throwing
        throw new Error(`Unknown error in createWebpageYeepayPayment: ${String(error)}`);
    }
  }
}
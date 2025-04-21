import { config as appConfig } from '../config.js';
import { YopClient, YopConfig } from '@yeepay/yop-typescript-sdk';

// Expected structure for a successful query result
export interface YeepayQueryResult { // Add export
  code: string;
  message: string;
  orderId: string;
  uniqueOrderNo: string;
  status: string; // e.g., 'PROCESSING', 'SUCCESS', 'FAILED'
}

// Expected structure for a query error
interface YeepayQueryError {
    code: string;
    message: string;
}

// Complete SDK response structure
interface YeepayQueryResponse {
    state: 'SUCCESS' | 'FAILURE' | string;
    result?: YeepayQueryResult;
    error?: YeepayQueryError;
}


export interface QueryRequest { // Add export
  orderId: string;
}

export async function queryYeepayPaymentStatus(input: QueryRequest): Promise<YeepayQueryResult> {
  try {
    const { parentMerchantNo, merchantNo, appKey, secretKey } = appConfig;

    const yopConfig: YopConfig = {
        appKey,
        secretKey,
    };

    const yopClient = new YopClient(yopConfig);


    const queryParams = {
      parentMerchantNo,
      merchantNo,
      orderId: input.orderId
    };
    console.info("[QueryPayment] Request Params:", JSON.stringify(queryParams, null, 2));

    const apiUrl = '/rest/v1.0/trade/order/query';

    // Add double assertion for consistency, similar to the post method usage
    const responseData = await yopClient.get(apiUrl, queryParams as unknown as Record<string, unknown>) as YeepayQueryResponse; // 使用 SDK 的 get 方法
    console.info("[QueryPayment] Raw Response Data:", JSON.stringify(responseData, null, 2)); // 打印原始响应

    if (responseData && responseData.state === 'SUCCESS') {
        if (responseData.result && responseData.result.code === 'OPR00000') {
            // 成功状态且业务码为 OPR00000
            console.info("[QueryPayment] Success:", JSON.stringify(responseData.result));
            return responseData.result;
        } else {
            // 成功状态但业务码非 OPR00000，表示业务失败
            const errorCode = responseData.result?.code || 'UNKNOWN_CODE';
            const errorMessage = responseData.result?.message || 'Unknown Yeepay business error message';
            const errorLog = `[QueryPayment] Yeepay API Business Error (state: SUCCESS): Code=${errorCode}, Message=${errorMessage}`;
            console.error(errorLog);
            throw new Error(`Yeepay Business Error: ${errorCode} - ${errorMessage}`);
        }
    } else if (responseData && responseData.state === 'FAILURE') {
        // Failure state
        const errorCode = responseData.error?.code || 'UNKNOWN_FAILURE_CODE';
        const errorMessage = responseData.error?.message || 'Unknown Yeepay failure message';
        const errorLog = `[QueryPayment] Yeepay API Failure (state: FAILURE): Code=${errorCode}, Message=${errorMessage}`;
        console.error(errorLog);
        throw new Error(`Yeepay API Failure: ${errorCode} - ${errorMessage}`);
    } else {
        // Unknown state or other unexpected response structure
        const errorLog = `[QueryPayment] Unknown or Unexpected Yeepay API Response State: ${responseData?.state || 'State Undefined'}. Response: ${JSON.stringify(responseData)}`;
        console.error(errorLog);
        throw new Error(`Unknown Yeepay API response state: ${responseData?.state}`);
    }
  } catch (error: unknown) {
    // Catch standardized errors from YopClient or other errors within this function
    console.error("[QueryPayment] Overall Error:", error);
    // Re-throw the error directly
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(`Unknown error in queryYeepayPaymentStatus: ${String(error)}`);
    }
  }
}
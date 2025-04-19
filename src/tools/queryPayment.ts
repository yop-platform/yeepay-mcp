import { config as appConfig } from '../config'; // 导入配置模块并重命名 (Removed .js extension)
import { YopClient, YopConfig } from '@yeepay/yop-typescript-sdk'; // 从 SDK 导入

// 定义查询成功时 result 的预期结构 (可以根据实际需要调整)
interface YeepayQueryResult {
  code: string;
  message: string;
  orderId: string;
  uniqueOrderNo: string;
  status: string; // 例如 'PROCESSING', 'SUCCESS', 'FAILED' 等
  // ... 其他可能的字段
}

// 定义查询失败时 error 的预期结构
interface YeepayQueryError {
    code: string;
    message: string;
}

// 定义 SDK 返回的完整响应结构
interface YeepayQueryResponse {
    state: 'SUCCESS' | 'FAILURE' | string;
    result?: YeepayQueryResult;
    error?: YeepayQueryError;
}


interface QueryRequest {
  orderId: string;
  // ypOrderId?: string; // 根据易宝文档，查询通常只需要商户订单号或易宝订单号之一，此处保留 orderId
}

// 返回类型直接使用易宝API的result结构，或抛出错误
// interface QueryResponse { ... } // 不再需要自定义结构

export async function queryYeepayPaymentStatus(input: QueryRequest): Promise<YeepayQueryResult> { // 返回更具体的类型
  try {
    // 从 appConfig 获取配置值
    const { parentMerchantNo, merchantNo, appKey, secretKey } = appConfig;

    // 创建 YopConfig 对象
    const yopConfig: YopConfig = {
        appKey,
        secretKey,
    };

    // 实例化 YopClient
    const yopClient = new YopClient(yopConfig);


    // 构造查询参数
    const queryParams = {
      parentMerchantNo, // 使用 config 中的值
      merchantNo,     // 使用 config 中的值
      orderId: input.orderId
      // uniqueOrderNo: input.ypOrderId
    };
    console.info("[QueryPayment] Request Params:", JSON.stringify(queryParams, null, 2));

    const apiUrl = '/rest/v1.0/trade/order/query';
    // const yopClient = YopClient.getInstance(); // 移除旧的实例化方式

    // 使用 YopClient 发送请求
    // Add double assertion for consistency, similar to the post method usage
    const responseData = await yopClient.get(apiUrl, queryParams as unknown as Record<string, unknown>) as YeepayQueryResponse; // 使用 SDK 的 get 方法
    console.info("[QueryPayment] Raw Response Data:", JSON.stringify(responseData, null, 2)); // 打印原始响应

    // --- 开始修改响应处理逻辑 ---
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
        // 失败状态
        const errorCode = responseData.error?.code || 'UNKNOWN_FAILURE_CODE';
        const errorMessage = responseData.error?.message || 'Unknown Yeepay failure message';
        const errorLog = `[QueryPayment] Yeepay API Failure (state: FAILURE): Code=${errorCode}, Message=${errorMessage}`;
        console.error(errorLog);
        throw new Error(`Yeepay API Failure: ${errorCode} - ${errorMessage}`);
    } else {
        // 未知状态或其他未预期的响应结构
        const errorLog = `[QueryPayment] Unknown or Unexpected Yeepay API Response State: ${responseData?.state || 'State Undefined'}. Response: ${JSON.stringify(responseData)}`;
        console.error(errorLog);
        throw new Error(`Unknown Yeepay API response state: ${responseData?.state}`);
    }
    // --- 结束修改响应处理逻辑 ---
  } catch (error: unknown) {
    // 捕获 YopClient 抛出的标准化错误或此函数内的其他错误
    console.error("[QueryPayment] Overall Error:", error);
    // 直接重新抛出错误
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(`Unknown error in queryYeepayPaymentStatus: ${String(error)}`);
    }
  }
}
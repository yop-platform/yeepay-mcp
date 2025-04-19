import { config as appConfig } from '../config.js'; // 导入配置模块并重命名
import { YopClient, YopConfig } from 'yop-typescript-sdk'; // 从 SDK 导入

interface PaymentRequest {
  orderId: string;
  amount: number;
  goodsName: string;
  payWay?: string; // 允许可选，下面会提供默认值
  channel?: string; // 允许可选，下面会提供默认值
  userIp?: string;
  userId?: string;
}

// 定义成功响应中 result 对象的结构
interface YeepaySuccessResult {
  code: string;
  message: string;
  prePayTn: string;
  orderId: string;
  uniqueOrderNo: string;
  // 可能还有其他字段，但我们只关心这几个
}

// 定义失败响应中 error 对象的结构
interface YeepayErrorResult {
  code: string;
  message: string;
  // 可能还有其他字段
}

// 定义易宝API响应的整体结构
interface YeepayResponse {
  state: 'SUCCESS' | 'FAILURE' | string; // 包含可能的未知状态
  result?: YeepaySuccessResult;
  error?: YeepayErrorResult;
  // 可能还有其他顶层字段
}

// 定义函数成功返回的结构
export interface CreatePaymentSuccessResponse { // 添加 export
  prePayTn: string;
  orderId: string;
  uniqueOrderNo: string;
}


export async function createMobileYeepayPayment(input: PaymentRequest): Promise<CreatePaymentSuccessResponse> {
  try {
    // 从 appConfig 获取配置值
    const { parentMerchantNo, merchantNo, secretKey, appKey, yopPublicKey, notifyUrl } = appConfig;

    // 创建 YopConfig 对象
    const yopConfig: YopConfig = {
      appKey,
      secretKey,
      yopPublicKey,
      // serverRoot: 'https://openapi.yeepay.com/yop-center' // SDK 应该有默认值，如果需要覆盖则取消注释
    };

    // 实例化 YopClient
    const yopClient = new YopClient(yopConfig);

    const requestBody: Record<string, any> = {
      parentMerchantNo,
      merchantNo,
      orderId: input.orderId,
      orderAmount: String(input.amount),
      goodsName: input.goodsName,
      payWay: input.payWay || 'USER_SCAN', // 提供默认值
      channel: input.channel || 'WECHAT', // 提供默认值
      scene: 'ONLINE',
      userIp: input.userIp || '127.0.0.1',
      notifyUrl: notifyUrl
    };

    if (input.userId !== undefined) {
      requestBody.userId = input.userId;
    }
    console.info("[CreatePayment] Request Body:", JSON.stringify(requestBody, null, 2));

    const apiUrl = '/rest/v1.0/aggpay/pre-pay';
    // const yopClient = YopClient.getInstance(); // 移除旧的实例化方式

    // 指定 YopClient.post 的泛型参数为 YeepayResponse
    // 注意：SDK 的 post 方法可能不直接支持泛型，它返回固定的 { state, result?, error? } 结构
    // 我们已经定义了 YeepayResponse 来匹配这个结构，所以类型断言或检查是合适的
    const responseData = await yopClient.post(apiUrl, requestBody) as YeepayResponse; // 使用 SDK 的 post 方法
    console.info("[CreatePayment] Raw Response Data:", JSON.stringify(responseData, null, 2)); // 打印原始响应

    // --- 开始修改响应处理逻辑 ---
    if (responseData && responseData.state === 'SUCCESS') {
      if (responseData.result && responseData.result.code === '00000') {
        // 成功状态且业务码为 00000
        const { prePayTn, orderId, uniqueOrderNo } = responseData.result;
        console.info("[CreatePayment] Success:", JSON.stringify({ prePayTn, orderId, uniqueOrderNo }));
        return { prePayTn, orderId, uniqueOrderNo };
      } else {
        // 成功状态但业务码非 00000，表示业务失败
        const errorCode = responseData.result?.code || 'UNKNOWN_CODE';
        const errorMessage = responseData.result?.message || 'Unknown Yeepay business error message';
        const errorLog = `[CreatePayment] Yeepay API Business Error (state: SUCCESS): Code=${errorCode}, Message=${errorMessage}`;
        console.error(errorLog);
        throw new Error(`Yeepay Business Error: ${errorCode} - ${errorMessage}`);
      }
    } else if (responseData && responseData.state === 'FAILURE') {
      // 失败状态
      const errorCode = responseData.error?.code || 'UNKNOWN_FAILURE_CODE';
      const errorMessage = responseData.error?.message || 'Unknown Yeepay failure message';
      const errorLog = `[CreatePayment] Yeepay API Failure (state: FAILURE): Code=${errorCode}, Message=${errorMessage}`;
      console.error(errorLog);
      throw new Error(`Yeepay API Failure: ${errorCode} - ${errorMessage}`);
    } else {
      // 未知状态或其他未预期的响应结构
      const errorLog = `[CreatePayment] Unknown or Unexpected Yeepay API Response State: ${responseData?.state || 'State Undefined'}. Response: ${JSON.stringify(responseData)}`;
      console.error(errorLog);
      throw new Error(`Unknown Yeepay API response state: ${responseData?.state}`);
    }
    // --- 结束修改响应处理逻辑 ---

  } catch (error: unknown) {
    // 捕获 YopClient 抛出的标准化错误或此函数内抛出的业务错误
    console.error("[CreatePayment] Overall Error:", error);
    // 直接重新抛出错误，保持错误栈信息
    if (error instanceof Error) {
        throw error;
    } else {
        // 对于非 Error 类型的异常，包装一下再抛出
        throw new Error(`Unknown error in createMobileYeepayPayment: ${String(error)}`);
    }
  }
}
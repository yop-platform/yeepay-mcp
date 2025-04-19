import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量，确保只加载一次
dotenv.config();

// 读取并验证环境变量
const parentMerchantNo = process.env.YOP_PARENT_MERCHANT_NO;
const merchantNo = process.env.YOP_MERCHANT_NO;
const secretKey = process.env.YOP_SECRET_KEY; // 商户私钥
const appKey = process.env.YOP_APP_KEY;
const notifyUrl = process.env.YOP_NOTIFY_URL; // createPayment 需要

if (!parentMerchantNo || !merchantNo || !secretKey || !appKey) {
  const errorMsg = 'Missing required Yeepay configuration in environment variables (YOP_PARENT_MERCHANT_NO, YOP_MERCHANT_NO, YOP_SECRET_KEY, YOP_APP_KEY)';
  // log.error(errorMsg); // 移除日志调用
  throw new Error(errorMsg); // 直接抛出错误
}
// notifyUrl 只在 createPayment 中是必需的，但在这里检查可以更早发现问题
if (!notifyUrl) {
    const errorMsg = 'Missing required Yeepay configuration in environment variables (YOP_NOTIFY_URL)';
    // log.error(errorMsg); // 移除日志调用
    throw new Error(errorMsg); // 直接抛出错误
}

// Define an interface for the config structure
interface AppConfig {
  readonly parentMerchantNo: string;
  readonly merchantNo: string;
  readonly secretKey: string;
  readonly appKey: string;
  readonly notifyUrl: string;
}

// 导出配置对象, 使用 as const 使其深度只读
export const config = {
  parentMerchantNo,
  merchantNo,
  secretKey,
  appKey,
  notifyUrl,
} as const; // Apply as const assertion

// Object.freeze(config); // Removed runtime freeze, relying on compile-time readonly via 'as const'
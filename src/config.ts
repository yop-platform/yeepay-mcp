import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
// import log from './logger.js'; // 移除日志导入以避免循环依赖

// 加载环境变量，确保只加载一次
dotenv.config();

// 定义易宝平台公钥文件路径
const YEEPAY_PUBLIC_KEY_PATH = path.resolve(process.cwd(), './yop_platform_rsa_cert_rsa.cer');

// 读取并验证环境变量
const parentMerchantNo = process.env.YEEPAY_PARENT_MERCHANT_NO;
const merchantNo = process.env.YEEPAY_MERCHANT_NO;
const secretKey = process.env.YEEPAY_SECRET_KEY; // 商户私钥
const appKey = process.env.YEEPAY_APP_KEY;
const notifyUrl = process.env.YEEPAY_NOTIFY_URL; // createPayment 需要

if (!parentMerchantNo || !merchantNo || !secretKey || !appKey) {
  const errorMsg = 'Missing required Yeepay configuration in environment variables (YEEPAY_PARENT_MERCHANT_NO, YEEPAY_MERCHANT_NO, YEEPAY_SECRET_KEY, YEEPAY_APP_KEY)';
  // log.error(errorMsg); // 移除日志调用
  throw new Error(errorMsg); // 直接抛出错误
}
// notifyUrl 只在 createPayment 中是必需的，但在这里检查可以更早发现问题
if (!notifyUrl) {
    const errorMsg = 'Missing required Yeepay configuration in environment variables (YEEPAY_NOTIFY_URL)';
    // log.error(errorMsg); // 移除日志调用
    throw new Error(errorMsg); // 直接抛出错误
}


// 读取易宝平台公钥
let yopPublicKey: string;
try {
  yopPublicKey = fs.readFileSync(YEEPAY_PUBLIC_KEY_PATH, 'utf-8');
  // log.info(`Successfully read Yeepay platform public key from ${YEEPAY_PUBLIC_KEY_PATH}`); // 移除日志调用
} catch (err) {
  const errorMsg = `Failed to read Yeepay platform public key at ${YEEPAY_PUBLIC_KEY_PATH}: ${err instanceof Error ? err.message : String(err)}`;
  // log.error(errorMsg); // 移除日志调用
  throw new Error(errorMsg); // 直接抛出错误
}

// 导出配置对象
export const config = {
  parentMerchantNo,
  merchantNo,
  secretKey,
  appKey,
  notifyUrl,
  yopPublicKey
  // 可以添加其他共享配置
};

// 冻结对象防止意外修改
Object.freeze(config);
import dotenv from "dotenv";

// 加载环境变量，确保只加载一次
dotenv.config();

// 读取并验证环境变量
const parentMerchantNo = process.env.YOP_PARENT_MERCHANT_NO;
const merchantNo = process.env.YOP_MERCHANT_NO;
const appPrivateKey = process.env.YOP_APP_PRIVATE_KEY; // 商户私钥
const appKey = process.env.YOP_APP_KEY;
const notifyUrl = process.env.YOP_NOTIFY_URL; // createPayment 需要
const yopPublicKey = process.env.YOP_PUBLIC_KEY;
if (!parentMerchantNo || !merchantNo || !appPrivateKey || !appKey) {
  const errorMsg =
    "Missing required Yeepay configuration in environment variables (YOP_PARENT_MERCHANT_NO, YOP_MERCHANT_NO, YOP_APP_PRIVATE_KEY, YOP_APP_KEY)";
  throw new Error(errorMsg); // 直接抛出错误
}
// notifyUrl 只在 createPayment 中是必需的，但在这里检查可以更早发现问题
if (!notifyUrl) {
  const errorMsg =
    "Missing required Yeepay configuration in environment variables (YOP_NOTIFY_URL)";
  throw new Error(errorMsg); // 直接抛出错误
}

// 导出配置对象, 使用 as const 使其深度只读
export const config = {
  parentMerchantNo,
  merchantNo,
  appPrivateKey,
  appKey,
  notifyUrl,
  yopPublicKey,
} as const; // Apply as const assertion

// Object.freeze(config); // Removed runtime freeze, relying on compile-time readonly via 'as const'

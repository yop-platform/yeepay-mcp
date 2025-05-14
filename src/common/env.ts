import { cac } from 'cac';

const cli = cac();
cli.option('--YOP_PARENT_MERCHANT_NO <key>', '易宝支付父商户号');
cli.option('--YOP_MERCHANT_NO <key>', '易宝支付商户号');
cli.option('--YOP_APP_PRIVATE_KEY <key>', '易宝支付密钥');
cli.option('--YOP_APP_KEY <key>', '易宝支付AppKey');
cli.option('--YOP_NOTIFY_URL <key>', '易宝支付回调地址');
cli.option('--YOP_PUBLIC_KEY <key>', '易宝支付公钥');
const parsed = cli.parse();

export const YOP_PARENT_MERCHANT_NO = parsed.options.YOP_PARENT_MERCHANT_NO;
export const YOP_MERCHANT_NO = parsed.options.YOP_MERCHANT_NO;
export const YOP_APP_PRIVATE_KEY = parsed.options.YOP_APP_PRIVATE_KEY;
export const YOP_APP_KEY = parsed.options.YOP_APP_KEY;
export const YOP_NOTIFY_URL = parsed.options.YOP_NOTIFY_URL;
export const YOP_PUBLIC_KEY = parsed.options.YOP_PUBLIC_KEY;

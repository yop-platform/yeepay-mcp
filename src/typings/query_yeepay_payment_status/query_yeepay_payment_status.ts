// 定义查询支付状态工具的输入参数类型
export interface Input {
  orderId: string;
}

// 定义查询支付状态工具的输出参数类型
export interface Output {
  code: string;
  message: string;
  orderId: string;
  uniqueOrderNo: string;
  status: string;
  rawResponse?: any;
}

// 定义查询支付状态工具的错误响应类型
export interface YeePayError {
  error: string;
  message: string;
  subCode?: string;
  subMessage?: string;
  rawResponse?: any;
}

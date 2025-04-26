// src/types/yeepay.d.ts

// Keep this declaration if 'urlsafe-base64' is used and has no @types package.
declare module 'urlsafe-base64';

// Define and export YeePay related types
export interface WebpagePaymentRequest {
    orderId: string;
    orderAmount: number;
    goodsName: string;
    paymentType: 'WECHAT_APP' | 'ALIPAY_APP' | string; // Extend with other supported types
    notifyUrl?: string;
    redirectUrl?: string;
    appId?: string; // Required for WeChat Pay
    userIp?: string;
    // Add other potential fields
}

export interface WebpagePaymentResponse {
    code: string;
    message: string;
    transactionId?: string;
    paymentParams?: any; // Type depends on payment method (string token, object, etc.)
    rawResponse?: any;
}

export interface YeePayError {
    error: string; // Error code (e.g., 'INVALID_PARAMETERS', 'YOP_API_ERROR', specific YeePay codes)
    message: string; // Error description
    subCode?: string; // YeePay sub-error code
    subMessage?: string; // YeePay sub-error message
    rawResponse?: any;
}

// Add other YeePay related types as needed

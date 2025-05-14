import { Args } from '@/runtime';
import { Input, Output } from "@/typings/create_webpage_yeepay_payment/create_webpage_yeepay_payment";

/**
  * Each file needs to export a function named `handler`. This function is the entrance to the Tool.
  * @param {Object} args.input - input parameters, you can get test input value by input.xxx.
  * @param {Object} args.logger - logger instance used to print logs, injected by runtime
  * @returns {*} The return data of the function, which should match the declared output parameters.
  * 
  * Remember to fill in input/output in Metadata, it helps LLM to recognize and use tool.
  */
export async function handler({ input, logger }: Args<Input>): Promise<Output> {
  logger.info('Starting create_webpage_yeepay_payment process (Node.js, config in param)...');

  // 0. Input Validation (Payment Params + Config)
  try {
    if (!input || typeof input !== 'object') {
      throw new Error('Missing or invalid event object.');
    }
    // Required payment parameters
    const requiredPaymentFields = ['orderId', 'orderAmount', 'goodsName', 'paymentType'];
    const allRequiredFields = [...requiredPaymentFields, ];

    const missingFields = allRequiredFields.filter(key => !input[key]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in event object: ${missingFields.join(', ')}`);
    }

    if (typeof input.orderAmount !== 'number' || input.orderAmount <= 0) {
      throw new Error('Invalid parameter: orderAmount must be a positive number.');
    }
  } catch (error) {
    logger.error('Input validation failed:', error.message);
    // Distinguish between config and param errors if needed, otherwise use generic INVALID_PARAMETERS
    const isConfigError = ['parentMerchantNo', 'merchantNo', 'appPriKey', 'appKey', 'notifyUrl']
                            .some(field => error.message.includes(field));
    return {
      error: isConfigError ? 'CONFIGURATION_ERROR' : 'INVALID_PARAMETERS',
      message: error.message,
    };
  }

  try {
    // 2. Prepare Request Data (Extracting from input)
    const requestData = {
      parentMerchantNo: '10086032562',
      merchantNo: '10086039518',
      orderId: input.orderId,
      orderAmount: input.orderAmount.toFixed(2),
      notifyUrl: 'https://yourdomain.com/notify',
      redirectUrl: '',
      goodsName: input.goodsName,
      payWay: 'USER_SCAN',
      channel: input.paymentType && input.paymentType.toUpperCase() === 'ALIPAY'? 'ALIPAY' : 'WECHAT',
      scene: 'ONLINE',
      appId: '',
      userIp: '127.0.0.1',
      // ... other parameters potentially passed in input
    };

    logger.debug('Prepared request data:', JSON.stringify(requestData));

    // Use dynamic import() for ES modules
    const sdk = await import('@yeepay/yop-typescript-sdk');
    const YopClient = sdk.YopClient;

    if (!YopClient) {
      throw new Error('Could not find YopClient in the dynamically imported module');
    }

    logger.info('YopClient loaded from dynamic import');

    // Initialize YopClient with config
    const yopClientInstance = new YopClient({
      appKey: 'app_10086032562',
      appPrivateKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDdnBKx03zrrPzJ/Z8rJMEaYvmes19qIPGcgncUQNOYauaXy99iT2P3O1H3qZceKZ8ngeha5ckuV4ke3tLlMRHn3GvTzd1l6EEntwL6SRUopmhj/635bkGUlQvEZrWAtwfO0wcoI0XnRB3JLc+r8nTf64vIi2UovqcZ6LKJj96btie7rYZZqqtr2+e7S0HDqH6nHcqvBYVGYGrYnDNKyjSvKdjGIq+JMQu1tJOtqT4JoeFAOBSTw3Jqkpvnudc1GgWVOepuGVyaXHXVNQTjnap7LMbJ+IJXBLSgGi1uC4u8Ypc2u0kDLXKkff0X/DG9cJXMaLcf/3yBH2/UoebTTJudAgMBAAECggEACptTfrzlW/9b2wwfT+iSsIFfurORo8n/XnMVIXxH1GH7dvT8VF+B5J2reuvcToaF9lVeqmkYo7XvW3GlTPB4D62qYIkYKW5AHhdBlnqkf11VnkGo0UkwbNzkYwpachZwknrhuw9TI3JMbapaZ/uzEdubhWX8mcJkS5ZqYzCmYjPzKfYMuowZ4ygOETOER9pl8J7dt4CYYI+GLwVT39D6ptf74fzlKohT506ulLUu3AWsavvW3QTPSxzS2ARO7QaLco8Dly8AJiGmSUdwSzzwVgYD1kVHtUUukbtnjFBTN8PqGt+TM+gcv8s5LlaZSYp4Zlwt9LTdW2sFCSoRj8HLaQKBgQD3u6c2PyRckNpwGuOjTJHy+uF7OGoiFyuGAxmyC8UzNG+nLBghZjCJmzkfzKrjNINrNT4zxepXhKurW0vxd9ZSkjpyEteRDSfdyvsDEbfR3p6w9ObA8iZkCvesYchrwrdWO7V4sjynvEhWkLSctLWaASbj7zuyYu0OYiSo28MN+QKBgQDlAUB3mLEpBvWIlMnXhfz/RrmEqlg6yygu37Xjjs7wjyPSz3RqUIB2YYT9d5wGob2nBLD4IvoSWvysNegt0TiklAHYW7LNW1DB1Oo0M5xOgToOOA545aR8DG9XJGOlKRiGJQS0q9T4X4z1TOx93W8bzNeUZgL5Kk5WQE8cuUxzxQKBgQC4nhgWzSeD9E9VjDRo1f9OXLj84yX1Ed9Vl6nmje8AIeuzYaD6AvXZFtyTXitb9x6ZHqykWLIzVqO4p+kIoo4OKvtzV6deabd0CnjV6LZcqNMKfPgaglsp4yKATL7Xz9xhX032DJ43QpGGMYDn56QOiR06cGbEogSX23wGev/5wQKBgQCMQc8FMNzYnu2FAHP675J7mwqG6XnuUH1E8DlLrSyrg0/SjsLjVnjHiITWZQqHuUoZ4DKvV2TIFzgIFWAlp63Ehu32YHtLcTEt9kSXQkDqiBVRnh2nCCdM3qTWv2/UOS5PAp82NMPUd1ky6DE0CYpCgZxLxIrvpmyiQPLzSb48bQKBgAF0EpSRsPQhPjUYsPc3FA71R0GSRyxr9ktM5hqsG/qrh0ep4jIFKibGA+VJo/ed2QC4MNAjPR285v6ytBcFyoEAacf7noSavVvYU5/KaQ5wJYSue0+M5IBJrrwLv0k1ppe86Xp8890NT2XHbaALY3hcSBTGs2aHPUNEma7H+2T9',
      yopApiBaseUrl: 'https://openapi-a.yeepay.com',
      yopPublicKey: 'MIIE2TCCA8GgAwIBAgIFQ5cTlZgwDQYJKoZIhvcNAQELBQAwWDELMAkGA1UEBhMCQ04xMDAuBgNVBAoMJ0NoaW5hIEZpbmFuY2lhbCBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTEXMBUGA1UEAwwOQ0ZDQSBBQ1MgT0NBMzEwHhcNMjEwNDI1MDIwOTAwWhcNMjMwNDI1MDIwOTAwWjCBhzELMAkGA1UEBhMCQ04xFzAVBgNVBAoMDkNGQ0EgQUNTIE9DQTMxMRAwDgYDVQQLDAdURVNUIFJBMRkwFwYDVQQLDBBPcmdhbmlzYXRpb25hbC0xMTIwMAYDVQQDDCkwNTFA5piT5a6d5byA5pS+5bmz5Y+wQDMxMTAwMDAwMDU4MDQyMjlANTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOqdF1o7HGPoLMqikYcPTHi7BJoRXQUYU9npjnJPxdTpsN/GVoScYfZA37OR8xSTK1aM4FPkiRQzjcbPFAdMDCCykZqny3HwpRvTMgjbiZJH5tBxUL9YURnTr2T149wXJLsGuxaxFwUWFISu7yeNGn7prKbYZrHum7OpmcTZ/5gC2dl9O7s5zq63Nq5ONWNh37XbsWcOk+BJrVrjdseAmfIMEsjwFuWc2SS0OrWQ6IwSuBmUwBoZ5924OWwbAZcNvhS5AkAbg7CVbBT4hof2+iv/sxk71slHLvi1I9jHo2EBCwzt4tr0F1Q5O5VYtv03FGHn7yHLLJ87Hwn42qK8bLsCAwEAAaOCAXgwggF0MGwGCCsGAQUFBwEBBGAwXjAoBggrBgEFBQcwAYYcaHR0cDovL29jc3AuY2ZjYS5jb20uY24vb2NzcDAyBggrBgEFBQcwAoYmaHR0cDovL2NybC5jZmNhLmNvbS5jbi9vY2EzMS9vY2EzMS5jZXIwHwYDVR0jBBgwFoAU4rQJy81hoXNKeX/xioML3bR+jB0wDAYDVR0TAQH/BAIwADBIBgNVHSAEQTA/MD0GCGCBHIbvKgEEMDEwLwYIKwYBBQUHAgEWI2h0dHA6Ly93d3cuY2ZjYS5jb20uY24vdXMvdXMtMTQuaHRtMD0GA1UdHwQ2MDQwMqAwoC6GLGh0dHA6Ly9jcmwuY2ZjYS5jb20uY24vb2NhMzEvUlNBL2NybDMwMjAuY3JsMA4GA1UdDwEB/wQEAwIGwDAdBgNVHQ4EFgQU4swobhCzosrPL4Gv8clxRwbHy0EwHQYDVR0lBBYwFAYIKwYBBQUHAwIGCCsGAQUFBwMEMA0GCSqGSIb3DQEBCwUAA4IBAQBpZpClbx+FJo5WpuJW+TJKYRayKeAx3/+VvlMyWvdcbABPlvwBY1m3xl1k+tsqqtBGvjathGmw1w7YESdRFTT/ty04MDLmz62USS4DJlZ2EWMxPm0bKpuAPsWb3+EtvizyZ0l1gX/D0YHDcH+VljYlGAv+yQEUzD+0c9NZSWr4V19yRVDQEicll5hJko7RFQUrwW+wNSrexzlyQFbUlbljwAnHO0TF3zgTXKRu2YNiKZGlxr28FjOeMQdvpiNqHCW9ACjQqL0vz1l9IImn0lm+0vh0YhAN0oFzJZvs5lFG9Bg+kNkyhgf9eVcUUxXKnA6UwXq2amoTa4Iq3NW6YuPI'
    });
    logger.info('YopClient initialized successfully');

    // 4. Define API URI
    const apiUri = '/rest/v1.0/aggpay/pre-pay'; // Adjust as needed

    // 5. API Call
    const response = await yopClientInstance.post(apiUri, requestData); // Corrected variable name
    logger.debug('API Response:', JSON.stringify(response));

    // 6. Result Handling
    const isProduction = process.env.NODE_ENV === 'production'; // Check env for logging control
    if (response && response.result) {
      const resultData = response.result;
      logger.info('YeePay API call successful.');
      /** @type {WebpagePaymentResponse} */
      const paymentResponse = {
        code: resultData.code,
        message: resultData.message,
        prePayTn: resultData.prePayTn,
        orderId: resultData.orderId,
        uniqueOrderNo: resultData.uniqueOrderNo
      };
      logger.debug('Processed successful response:', JSON.stringify(paymentResponse));
      return paymentResponse;
    } else {
      logger.error('YeePay API call failed or returned an error state.');
      const errorDetails = response ? (response.error || response.result || response) : 'No response object';
      logger.error('Error details:', JSON.stringify(errorDetails));
      /** @type {YeePayError} */
      const errorResponse = {
        error: response?.error?.code || response?.result?.code || 'YOP_API_ERROR',
        message: response?.error?.message || response?.result?.message || 'Unknown YeePay API error',
        subCode: response?.error?.subCode,
        subMessage: response?.error?.subMessage,
        rawResponse: !isProduction ? response : undefined,
      };
      return errorResponse;
    }
  } catch (error) {
    logger.error('An unexpected error occurred during YeePay payment creation:', error);
    if (error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    /** @type {YeePayError} */
    const internalError = {
      error: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred.',
    };
    return internalError;
  }
};
#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from 'dotenv';
import { z } from "zod";
import { createMobileYeepayPayment, CreatePaymentSuccessResponse } from './tools/createPayment.js';
import { queryYeepayPaymentStatus } from './tools/queryPayment.js';

// 加载环境变量
dotenv.config();

const server = new McpServer({
  name: 'yeepay-mcp',
  version: "0.1.0",
  description: '易宝支付(Yeepay) MCP 服务集成'
}, {
  capabilities: {
    tools: {},
    resources: {},
    logging: {}
  }
});

// 创建移动支付订单工具
// NOTE: Based on TS errors, this SDK version/config expects only the execute function.
// Description and Input Schema might need to be defined elsewhere (e.g., server metadata).
// Define Zod schema for create payment input
const CreatePaymentInputSchema = z.object({
  orderId: z.string().describe('商户订单号'),
  amount: z.number().describe('交易金额'),
  goodsName: z.string().describe('商品名称'),
  userIp: z.string().optional().describe('用户IP') // Made optional as per comment and validation logic
  // TODO: Consider adding userId, payWay, channel etc. based on createPayment.ts needs
});
type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;

server.tool('create_mobile_yeepay_payment', '创建移动支付订单工具',
  CreatePaymentInputSchema.shape, // Pass the shape, not the object
  // Use inferred type instead of any
  async (input: CreatePaymentInput) => {
    // Removed manual input validation; rely on Zod schema provided to server.tool

    try {
      // 调用原始函数获取结果 (input is now typed)
      const paymentResult: CreatePaymentSuccessResponse = await createMobileYeepayPayment(input);

      // 使用 'text' as const
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(paymentResult, null, 2) }]
      };
    } catch (error) {
      // 如果 createMobileYeepayPayment 抛出错误，将其包装成 MCP 的错误格式
      // MCP SDK 通常会自动处理抛出的 Error 对象，但也可以显式格式化
      console.error("Error caught in create_mobile_yeepay_payment tool handler:", error);
      // 让 SDK 处理错误
      throw error;
      /* 或者，显式返回错误格式：
      return {
        content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
        isError: true
      };
      */
    }
});

// 查询支付状态工具 (保持不变，但如果 queryYeepayPaymentStatus 返回值也变了，则需要类似修改)
// NOTE: Based on TS errors, this SDK version/config expects only the execute function.
// Define Zod schema for query payment status input
const QueryPaymentStatusInputSchema = z.object({
  orderId: z.string().describe('商户订单号')
});
type QueryPaymentStatusInput = z.infer<typeof QueryPaymentStatusInputSchema>;

server.tool('query_yeepay_payment_status', '查询支付状态工具',
  QueryPaymentStatusInputSchema.shape, // Pass the shape, not the object
  // Use inferred type instead of any
  async (input: QueryPaymentStatusInput) => {
    // Removed manual input validation; rely on Zod schema provided to server.tool

   try {
       const queryResult = await queryYeepayPaymentStatus(input); // input is now typed
       // 使用 'text' as const
       return {
           content: [{ type: 'text' as const, text: JSON.stringify(queryResult, null, 2) }]
       };
   } catch (error) {
       console.error("Error caught in query_yeepay_payment_status tool handler:", error);
       throw error; // 让 SDK 处理错误
   }
});

// 启动服务器 (保持不变)
async function startServer() {
  const transport = new StdioServerTransport();
  try {
    await server.connect(transport);

    // McpServer 通常没有 start 方法，而是直接通过 connect 监听
    // 如果需要监听特定端口（例如用于HTTP/SSE），则需要使用不同的 Transport 或配置
    // 对于 StdioTransport，连接成功即表示服务准备就绪
    //console.info('Yeepay MCP Server is ready and listening via stdio.');
  } catch (error) {
    console.error('Failed to start Yeepay MCP Server:', error);
    process.exit(1);
  }
}

startServer(); // Call the async function
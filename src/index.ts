#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from 'dotenv';
import { z } from "zod";
import { createMobileYeepayPayment, CreatePaymentSuccessResponse } from './tools/createPayment.js';
import { queryYeepayPaymentStatus } from './tools/queryPayment.js';

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

// Define Zod schema for create payment input
const CreatePaymentInputSchema = z.object({
  orderId: z.string().describe('商户订单号'),
  amount: z.number().describe('交易金额'),
  goodsName: z.string().describe('商品名称'),
  userIp: z.string().optional().describe('用户IP') // Made optional as per comment and validation logic
});
type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;

server.tool('create_mobile_yeepay_payment', '创建移动支付订单工具',
  CreatePaymentInputSchema.shape, // Pass the shape
  async (input: CreatePaymentInput) => {
    // Zod schema handles validation

    try {
      const paymentResult: CreatePaymentSuccessResponse = await createMobileYeepayPayment(input);

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(paymentResult, null, 2) }]
      };
    } catch (error) {
      console.error("Error caught in create_mobile_yeepay_payment tool handler:", error);
      throw error; // Let SDK handle the error
      /* 或者，显式返回错误格式：
      return {
        content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
        isError: true
      };
      */
    }
});

// Define Zod schema for query payment status input
const QueryPaymentStatusInputSchema = z.object({
  orderId: z.string().describe('商户订单号')
});
type QueryPaymentStatusInput = z.infer<typeof QueryPaymentStatusInputSchema>;

server.tool('query_yeepay_payment_status', '查询支付状态工具',
  QueryPaymentStatusInputSchema.shape, // Pass the shape
  async (input: QueryPaymentStatusInput) => {
    // Zod schema handles validation

   try {
       const queryResult = await queryYeepayPaymentStatus(input);
       return {
           content: [{ type: 'text' as const, text: JSON.stringify(queryResult, null, 2) }]
       };
   } catch (error) {
       console.error("Error caught in query_yeepay_payment_status tool handler:", error);
       throw error; // Let SDK handle the error
   }
});

async function startServer() {
  const transport = new StdioServerTransport();
  try {
    await server.connect(transport);

    // For StdioTransport, successful connection means the server is ready.
  } catch (error) {
    console.error('Failed to start Yeepay MCP Server:', error);
    process.exit(1);
  }
}

startServer();
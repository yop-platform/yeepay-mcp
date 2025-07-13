#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { z } from "zod";

// Import types only to avoid circular dependencies
import type { CreatePaymentSuccessResponse } from "./tools/createPayment.js";

dotenv.config();

const server = new McpServer({
  name: "yeepay-mcp",
  version: "0.3.3",
  description: "易宝支付(Yeepay) MCP 服务集成",
});

// Define Zod schema for create payment input
const CreatePaymentInputSchema = z.object({
  orderId: z.string().describe("商户订单号"),
  amount: z.number().describe("交易金额"),
  goodsName: z.string().describe("商品名称"),
  userIp: z.string().optional().describe("用户IP"), // Made optional as per comment and validation logic
});
type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;

server.tool(
  "create_webpage_yeepay_payment",
  "创建移动支付订单工具",
  CreatePaymentInputSchema.shape, // Pass the shape
  async (input: CreatePaymentInput) => {
    // Zod schema handles validation

    try {
      // Dynamically import the module to avoid circular dependencies
      const { createWebpageYeepayPayment } = await import(
        "./tools/createPayment.js"
      );

      const paymentResult: CreatePaymentSuccessResponse =
        await createWebpageYeepayPayment(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(paymentResult, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(
        "Error caught in create_webpage_yeepay_payment tool handler:",
        error,
      );
      throw error; // Let SDK handle the error
    }
  },
);

// Define Zod schema for query payment status input
const QueryPaymentStatusInputSchema = z.object({
  orderId: z.string().describe("商户订单号"),
});
type QueryPaymentStatusInput = z.infer<typeof QueryPaymentStatusInputSchema>;

server.tool(
  "query_yeepay_payment_status",
  "查询支付状态工具",
  QueryPaymentStatusInputSchema.shape, // Pass the shape
  async (input: QueryPaymentStatusInput) => {
    // Zod schema handles validation

    try {
      // Dynamically import the module to avoid circular dependencies
      const { queryYeepayPaymentStatus } = await import(
        "./tools/queryPayment.js"
      );

      const queryResult = await queryYeepayPaymentStatus(input);
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(queryResult, null, 2) },
        ],
      };
    } catch (error) {
      console.error(
        "Error caught in query_yeepay_payment_status tool handler:",
        error,
      );
      throw error; // Let SDK handle the error
    }
  },
);

async function startServer() {
  const transport = new StdioServerTransport();
  try {
    await server.connect(transport);

    // For StdioTransport, successful connection means the server is ready.
  } catch (error) {
    console.error("Failed to start Yeepay MCP Server:", error);
    process.exit(1);
  }
}

startServer();

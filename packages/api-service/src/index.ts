import dotenv from "dotenv";
import { resolve } from "path";

// 加载项目根目录的 .env 文件
dotenv.config({ path: resolve(__dirname, "../../../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { db, Response, generateApiDocsHtml } from "@webbox/shared";
import authRoutes from "@/routes/auth.routes";
import adminRoutes from "@/routes/admin";

const app = express();

// 中间件
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use("/public", express.static(resolve(__dirname, "../public")));

// 健康检查
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-service",
    timestamp: new Date().toISOString(),
    database: db.getConnectionStatus() ? "connected" : "disconnected",
  });
});

// API 文档页面
app.get("/api-docs", (req, res) => {
  res.type("html").send(generateApiDocsHtml(`http://${req.get("host")}`));
});

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// 404 处理
app.use((req, res) => {
  Response.notFound(res, `路由不存在: ${req.method} ${req.path}`);
});

// 错误处理
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("错误:", err);
    Response.internalError(res, err.message || "服务器内部错误");
  }
);

// 启动服务
const PORT = process.env.API_PORT || 3002;

async function startServer() {
  try {
    // 连接数据库
    await db.connect();

    // 启动HTTP服务
    app.listen(PORT, () => {
      console.log(`🚀 API 服务已启动，端口: ${PORT}`);
      console.log(`📡 健康检查: http://localhost:${PORT}/health`);
      console.log(`📖 API 文档: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("启动服务失败:", error);
    process.exit(1);
  }
}

startServer();

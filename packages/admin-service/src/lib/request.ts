// API 请求工具
// 使用 Next.js API 路由作为代理（避免 CORS）
import { toast } from "@/lib/toast";

const isBrowser = typeof window !== "undefined";
const API_BASE_URL = isBrowser
  ? "/api" // 浏览器端：使用本地 /api 路由代理
  : process.env.API_URL || "http://localhost:3002"; // 服务器端：直接请求后端

export interface RequestConfig {
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "get"
    | "post"
    | "put"
    | "delete";
  url: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

export class RequestError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "RequestError";
  }
}

export async function request<T = any>(config: RequestConfig): Promise<T> {
  const { method: rawMethod = "GET", url, params, data, headers = {} } = config;
  const method = rawMethod.toUpperCase(); // 统一转换为大写

  // 构建完整 URL
  let fullUrl: string;

  if (isBrowser) {
    // 浏览器端：构建相对路径
    // /admin/auth/me -> /api/admin/auth/me
    fullUrl = `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

    // 添加查询参数
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
  } else {
    // 服务器端：构建完整 URL
    const urlObj = new URL(url.startsWith("/") ? url : `/${url}`, API_BASE_URL);

    // 添加查询参数
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, String(value));
        }
      });
    }

    fullUrl = urlObj.toString();
  }

  // 构建请求配置
  const fetchConfig: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // 包含 cookies
  };

  // 添加 Authorization header（从 Cookie 获取 token）
  if (isBrowser) {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (token && fetchConfig.headers) {
      (fetchConfig.headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${token}`;
    }
  }

  // 添加请求体
  if (data && ["POST", "PUT", "PATCH"].includes(method)) {
    fetchConfig.body = JSON.stringify(data);
    console.log("[Request] 发送请求:", method, fullUrl, "数据:", data);
  }

  try {
    const response = await fetch(fullUrl, fetchConfig);

    // 处理非 2xx 响应
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // 处理 401 未授权：清除登录状态并跳转到登录页
      if (response.status === 401 && isBrowser) {
        // 清除 token（Cookie）
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // 清除用户信息（localStorage）
        try {
          localStorage.removeItem("user_info");
        } catch (e) {
          console.error("清除用户信息失败:", e);
        }

        // 如果不在登录页，则跳转到登录页
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }

        // 抛出错误，避免后续代码继续执行
        throw new RequestError("登录已过期，请重新登录", 401, errorData);
      }

      const errorMessage = errorData.message || `请求失败: ${response.statusText}`;

      // 在浏览器端显示错误提示
      if (isBrowser) {
        toast.error(errorMessage);
      }

      throw new RequestError(errorMessage, response.status, errorData);
    }

    // 解析响应
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const jsonData = await response.json();

      // 如果响应包含 code 和 data 字段（标准的后端响应格式），自动提取 data
      if (
        jsonData &&
        typeof jsonData === "object" &&
        "code" in jsonData &&
        "data" in jsonData
      ) {
        return jsonData.data;
      }

      return jsonData;
    }

    return (await response.text()) as any;
  } catch (error) {
    if (error instanceof RequestError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : "网络请求失败";

    // 在浏览器端显示错误提示
    if (isBrowser) {
      toast.error(errorMessage);
    }

    throw new RequestError(errorMessage);
  }
}

export default request;

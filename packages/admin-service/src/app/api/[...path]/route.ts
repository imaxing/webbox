import { NextRequest, NextResponse } from 'next/server'

// 后端 API 地址
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002'

/**
 * API 代理路由
 *
 * 将所有 /api/* 请求代理到后端服务器
 * 自动转发 cookie 和请求头
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return proxyRequest(request, params.path, 'PATCH')
}

/**
 * 代理请求到后端服务器
 */
async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // 构建目标 URL（保留 /api 前缀，因为后端路由以 /api 开头）
    const path = pathSegments.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const targetUrl = `${API_BASE_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`

    console.log(`[API Proxy] ${method} ${targetUrl}`)

    // 准备请求头
    const headers: HeadersInit = {}

    // 复制必要的请求头（注意：authorization 是关键的认证 header）
    const headersToForward = [
      'content-type',
      'authorization', // Bearer token 认证
      'accept',
      'accept-language',
      'user-agent',
    ]

    headersToForward.forEach((header) => {
      const value = request.headers.get(header)
      if (value) {
        headers[header] = value
      }
    })

    // 转发 cookie
    const cookies = request.cookies.getAll()
    if (cookies.length > 0) {
      headers['cookie'] = cookies.map((c) => `${c.name}=${c.value}`).join('; ')
    }

    // 准备请求体
    let body: string | undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const text = await request.text()
        console.log('[API Proxy] 请求体:', text || '(空)')
        if (text) {
          body = text
        }
      } catch (e) {
        console.error('[API Proxy] 读取请求体失败:', e)
      }
    }

    // 发送代理请求
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // 不自动重定向
      redirect: 'manual',
    })

    console.log(`[API Proxy] ${method} ${targetUrl} -> ${response.status}`)

    // 处理响应
    const responseHeaders = new Headers()

    // 转发响应头
    const headersToForwardBack = [
      'content-type',
      'content-length',
      'cache-control',
      'expires',
      'pragma',
    ]

    headersToForwardBack.forEach((header) => {
      const value = response.headers.get(header)
      if (value) {
        responseHeaders.set(header, value)
      }
    })

    // 转发 Set-Cookie
    const setCookieHeaders = response.headers.getSetCookie()
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        responseHeaders.append('set-cookie', cookie)
      })
    }

    // 获取响应体
    const responseBody = await response.arrayBuffer()

    // 返回响应
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('[API Proxy] 代理请求失败:', error)
    return NextResponse.json(
      {
        message: '代理请求失败',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

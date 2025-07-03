import type { NextRequest } from 'next/server';
import { middleware as authMiddleware } from './middleware/auth';
import { middleware as clientMiddleware } from './middleware/client';
import { middleware as homeMiddleware } from './middleware/home';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const kb_id = request.headers.get('x-kb-id') || process.env.DEV_KB_ID || '';
  const authToken = request.cookies.get(`auth_${kb_id}`)?.value || '';

  // 检查并添加 x-session-id
  // let sessionId = request.headers.get('x-session-id');
  // if (!sessionId) {
  //   sessionId = uuidv4();
  // }

  // // 创建一个新的请求对象，包含 x-session-id 头部
  // const requestHeaders = new Headers(request.headers);
  // requestHeaders.set('x-session-id', sessionId);

  // // 创建修改后的请求对象
  // const modifiedRequest = new Request(request.url, {
  //   method: request.method,
  //   headers: requestHeaders,
  //   body: request.body,
  //   duplex: 'half',
  // } as RequestInit) as NextRequest;

  // // 复制 nextUrl 和 cookies 等 NextRequest 特有属性
  // Object.defineProperty(modifiedRequest, 'nextUrl', {
  //   value: request.nextUrl,
  //   writable: false,
  // });
  // Object.defineProperty(modifiedRequest, 'cookies', {
  //   value: request.cookies,
  //   writable: false,
  // });

  if (pathname.startsWith('/share/')) {
    return authMiddleware(request, kb_id, authToken);
  }

  if (pathname.startsWith('/client/')) {
    return clientMiddleware(request, kb_id, authToken);
  }

  return homeMiddleware(request, kb_id, authToken);
}

export const config = {
  matcher: [
    '/',
    '/chat',
    '/welcome',
    '/auth/login',
    '/node/:path*',
    '/share/v1/:path*',
    '/client/:path*'
  ],
} 
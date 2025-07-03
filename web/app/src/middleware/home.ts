import { VisitSceneEnums } from '@/constant';
import { parsePathname } from '@/utils';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { apiClient } from '../api';

export async function middleware(request: NextRequest, kb_id: string, authToken: string) {
  const url = request.nextUrl.clone()
  console.log('--------------------------------- New Page ---------------------------------')
  console.log('🍐 page >>>', url.pathname)

  const { page, id } = parsePathname(url.pathname);
  const scene = VisitSceneEnums[page as keyof typeof VisitSceneEnums] || 0

  try {
    // 页面埋点
    if (scene > 0) {
      console.log('🥜 stat >>>', page, id)
      await apiClient.serviceStatPage({ scene, doc_id: id || '', kb_id, authToken });
    }

    // 获取节点列表
    const nodeListResult = await apiClient.serverGetNodeList(kb_id, authToken);
    if (nodeListResult.status === 401 && !url.pathname.startsWith('/auth')) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', url.pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/welcome', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.log(error)
  }

  return NextResponse.next()
}
import {
  AnydocChild,
  ConstsCrawlerSource,
  ConstsCrawlerStatus,
  postApiV1CrawlerResults,
  V1CrawlerParseResp,
} from '@/request';
import { v4 as uuidv4 } from 'uuid';
import { ListDataItem } from '.';

/**
 * 验证表单数据
 */
export const validateFormData = (
  formData: {
    url?: string;
    app_id?: string;
    app_secret?: string;
    user_access_token?: string;
  },
  type: ConstsCrawlerSource,
): { isValid: boolean; errorMessage?: string } => {
  if (
    [
      ConstsCrawlerSource.CrawlerSourceUrl,
      ConstsCrawlerSource.CrawlerSourceRSS,
      ConstsCrawlerSource.CrawlerSourceSitemap,
      ConstsCrawlerSource.CrawlerSourceNotion,
    ].includes(type)
  ) {
    if (!formData.url?.trim()) {
      return { isValid: false, errorMessage: '请输入有效的地址' };
    }
  }

  if (type === ConstsCrawlerSource.CrawlerSourceFeishu) {
    if (!formData.app_id?.trim()) {
      return { isValid: false, errorMessage: '请输入 App ID' };
    }
    if (!formData.app_secret?.trim()) {
      return { isValid: false, errorMessage: '请输入 Client Secret' };
    }
    if (!formData.user_access_token?.trim()) {
      return { isValid: false, errorMessage: '请输入 User Access Token' };
    }
  }

  return { isValid: true };
};

/**
 * 轮询查询爬虫结果
 * @param taskId 任务ID
 * @param maxAttempts 最大尝试次数，默认60次
 * @param interval 轮询间隔（毫秒），默认2000ms
 */
export const pollCrawlerResults = async (
  taskId: string,
  maxAttempts = 60,
  interval = 2000,
): Promise<{ status: ConstsCrawlerStatus; content?: string }> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const resultsResp = await postApiV1CrawlerResults({
      task_ids: [taskId],
    });

    const result = resultsResp.list?.[0];
    if (!result) {
      throw new Error('未获取到结果');
    }

    // 如果状态是完成或失败，返回结果
    if (
      result.status === ConstsCrawlerStatus.CrawlerStatusCompleted ||
      result.status === ConstsCrawlerStatus.CrawlerStatusFailed
    ) {
      return {
        status: result.status,
        content: result.content,
      };
    }

    // 等待一段时间后重试
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  // 超时
  throw new Error('轮询超时');
};

/**
 * 递归处理 V1CrawlerParseResp 数据，将树形结构平铺为 ListDataItem 数组
 *
 * @param response V1CrawlerParseResp 响应数据
 * @param parentId 父节点 ID（用于建立父子关系），默认为 null
 * @param extraFields 额外字段，会合并到每个生成的 ListDataItem 中
 * @returns ListDataItem[] 平铺后的数据数组
 *
 * @example
 * ```typescript
 * // 解析 RSS/Sitemap/Notion 等数据
 * const resp = await postApiV1CrawlerParse({
 *   crawler_source: ConstsCrawlerSource.CrawlerSourceRSS,
 *   key: 'https://example.com/rss',
 *   kb_id,
 * });
 *
 * // 将树形数据平铺为列表
 * const flattenedData = flattenCrawlerParseResponse(resp, parent_id);
 * setData(prev => [...prev, ...flattenedData]);
 * ```
 *
 * @example
 * ```typescript
 * // 处理飞书数据，传递 feishu_setting
 * const resp = await postApiV1CrawlerParse({
 *   crawler_source: ConstsCrawlerSource.CrawlerSourceFeishu,
 *   feishu_setting: { app_id, app_secret, user_access_token },
 *   kb_id,
 * });
 *
 * // 平铺数据，并传递额外字段
 * const items = flattenCrawlerParseResponse(resp, parent_id, {
 *   feishu_setting: { app_id, app_secret, user_access_token },
 *   folderReq: false,
 * });
 * setData(items);
 * ```
 */
export const flattenCrawlerParseResponse = (
  response: V1CrawlerParseResp,
  parentId: string | null = null,
  extraFields: Partial<ListDataItem> = {},
): ListDataItem[] => {
  const result: ListDataItem[] = [];
  const platformId = response.id || '';

  /**
   * 递归处理单个节点
   * @param node AnydocChild 节点
   * @param currentParentId 当前父节点的 ID
   */
  const processNode = (
    node: AnydocChild | undefined,
    currentParentId: string | null,
  ) => {
    if (!node || !node.value) {
      return;
    }

    const { value, children } = node;

    // 如果 value.id 为空，跳过此节点（不是正常数据）
    if (!value.id) {
      // 但仍然需要处理其子节点（如果有的话）
      if (children && children.length > 0) {
        children.forEach(child => processNode(child, currentParentId));
      }
      return;
    }

    // 创建 ListDataItem
    const item: ListDataItem = {
      uuid: uuidv4(),
      platform_id: platformId,
      id: value.id,
      title: value.title || '',
      summary: value.summary || '',
      file_type: value.file_type,
      file: value.file ?? false,
      parent_id: currentParentId || '',
      open: !value.file, // 文件夹默认展开
      status: 'parsed',
      folderReq: true,
      ...extraFields, // 合并额外字段
    };

    result.push(item);

    // 递归处理子节点，使用当前节点的 id 作为子节点的 parent_id
    if (children && children.length > 0) {
      children.forEach(child => processNode(child, value.id!));
    }
  };

  // 从 docs 根节点开始处理
  if (response.docs) {
    processNode(response.docs, parentId);
  }

  return result;
};

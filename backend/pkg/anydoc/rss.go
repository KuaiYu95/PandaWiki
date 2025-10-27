package anydoc

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

const (
	rssListPath   = "/api/docs/rss/list"
	rssExportPath = "/api/docs/rss/export"
)

// RssListDocsResponse Rss 获取文档列表响应
type RssListDocsResponse struct {
	Success bool            `json:"success"`
	Msg     string          `json:"msg"`
	Data    RssListDocsData `json:"data"`
}

// RssListDocsData Rss 文档列表数据
type RssListDocsData struct {
	Docs []RssDoc `json:"docs"`
}

// RssDoc Rss 文档信息
type RssDoc struct {
	Id       string `json:"id"`
	FileType string `json:"file_type"`
	Title    string `json:"title"`
	Summary  string `json:"summary"`
}

// RssExportDocRequest Rss 导出文档请求
type RssExportDocRequest struct {
	UUID  string `json:"uuid"`   // 必须与 list 接口使用的 uuid 相同
	DocID string `json:"doc_id"` // rss-doc-id
}

// RssExportDocResponse Rss 导出文档响应
type RssExportDocResponse struct {
	Success bool   `json:"success"`
	Msg     string `json:"msg"`
	Data    string `json:"data"`
}

// RssExportDocData Rss 导出文档数据
type RssExportDocData struct {
	TaskID   string `json:"task_id"`
	Status   string `json:"status"`
	FilePath string `json:"file_path"`
}

// RssListDocs 获取 Rss 文档列表
func (c *Client) RssListDocs(ctx context.Context, xmlUrl, uuid string) (*ListDocResponse, error) {
	u, err := url.Parse(crawlerServiceHost)
	if err != nil {
		return nil, err
	}
	u.Path = rssListPath

	q := u.Query()
	q.Set("uuid", uuid)
	q.Set("url", xmlUrl)
	u.RawQuery = q.Encode()
	requestURL := u.String()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	c.logger.Info("RssListDocs", "requestURL:", requestURL, "resp", string(respBody))

	var rssResp ListDocResponse
	err = json.Unmarshal(respBody, &rssResp)
	if err != nil {
		return nil, err
	}

	if !rssResp.Success {
		return nil, errors.New(rssResp.Msg)
	}

	return &rssResp, nil
}

// RssExportDoc 导出 Rss 文档
func (c *Client) RssExportDoc(ctx context.Context, uuid, docID, kbId string) (*RssExportDocResponse, error) {
	u, err := url.Parse(crawlerServiceHost)
	if err != nil {
		return nil, err
	}
	u.Path = rssExportPath
	requestURL := u.String()

	bodyMap := map[string]interface{}{
		"uuid":   uuid,
		"doc_id": docID,
		"uploader": map[string]interface{}{
			"type": uploaderTypeHTTP,
			"http": map[string]interface{}{
				"url": apiUploaderUrl,
			},
			"dir": fmt.Sprintf("/%s", kbId),
		},
	}

	jsonData, err := json.Marshal(bodyMap)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, requestURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	c.logger.Info("RssExportDoc", "requestURL:", requestURL, "resp", string(respBody))

	var exportResp RssExportDocResponse
	err = json.Unmarshal(respBody, &exportResp)
	if err != nil {
		return nil, err
	}

	if !exportResp.Success {
		return nil, errors.New(exportResp.Msg)
	}

	return &exportResp, nil
}

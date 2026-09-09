import { canHandleDemoRequest, demoApiRequest } from './demo.js'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
export const isStaticPreview = typeof window !== 'undefined'
  && window.location.hostname.endsWith('github.io')
  && !import.meta.env.VITE_API_BASE_URL

let csrfToken = ''

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const clearApiSession = () => {
  csrfToken = ''
}

export async function apiRequest(path, options = {}) {
  if (canHandleDemoRequest(path, isStaticPreview)) return demoApiRequest(path, options)
  if (isStaticPreview) throw new ApiError('GitHub 展示版請使用「一鍵進入 Demo」體驗完整功能')
  const method = (options.method || 'GET').toUpperCase()
  const headers = { Accept: 'application/json', ...options.headers }
  const requestOptions = { ...options, method, headers, credentials: 'include' }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    requestOptions.body = JSON.stringify(options.body)
  }
  if (!['GET', 'HEAD'].includes(method) && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, requestOptions)
  } catch {
    throw new ApiError('無法連線到後端，請確認 PHP API 已啟動')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('後端回傳了無效的資料格式', response.status)
  }

  if (payload.csrfToken) csrfToken = payload.csrfToken
  if (!response.ok || payload.ok === false) {
    throw new ApiError(payload.message || '請求失敗，請稍後再試', response.status)
  }

  return payload
}

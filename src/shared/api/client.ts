/**
 * HTTP Client (Infrastructure Layer)
 *
 * Fetch API를 추상화한 HTTP 클라이언트
 * - 에러 핸들링
 * - 타입 안전성
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class HttpClient {
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(
        response.status,
        errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      )
    }

    return response.json()
  }

  async post<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(
        response.status,
        errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      )
    }

    return response.json()
  }
}

export const httpClient = new HttpClient()

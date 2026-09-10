import { useCallback, useEffect, useRef, useState } from 'react'

export type HttpMethod =
  | 'DELETE'
  | 'GET'
  | 'PATCH'
  | 'POST'
  | 'PUT'

export type HttpBody = BodyInit | Record<string, unknown> | null

export interface UseHttpOptions<TBody = HttpBody>
  extends Omit<RequestInit, 'body' | 'method' | 'signal'> {
  body?: TBody
  immediate?: boolean
}

export interface UseHttpResult<TData, TBody = HttpBody> {
  data: TData | null
  error: Error | null
  execute: (body?: TBody) => Promise<TData | null>
  isLoading: boolean
  reset: () => void
}

export class HttpError extends Error {
  readonly status: number
  readonly statusText: string

  constructor(status: number, statusText: string) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = 'HttpError'
    this.status = status
    this.statusText = statusText
  }
}

const EMPTY_OPTIONS: UseHttpOptions = {}

const parseResponse = async <TData>(
  response: Response,
): Promise<TData | null> => {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as TData
  } catch {
    return text as TData
  }
}

const serializeBody = (
  body: HttpBody | unknown,
  headers: Headers,
): BodyInit | undefined => {
  if (body === undefined || body === null) {
    return undefined
  }

  if (
    typeof body === 'string' ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams
  ) {
    return body
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

export const useHttp = <TData, TBody = HttpBody>(
  url: string,
  method: HttpMethod,
  options?: UseHttpOptions<TBody>,
): UseHttpResult<TData, TBody> => {
  const resolvedOptions = options ?? EMPTY_OPTIONS
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)
  const configRef = useRef({ method, options: resolvedOptions, url })

  useEffect(() => {
    configRef.current = { method, options: resolvedOptions, url }
  }, [method, resolvedOptions, url])

  const execute = useCallback(async (body?: TBody): Promise<TData | null> => {
    const config = configRef.current
    const requestBody = body ?? config.options.body
    const controller = new AbortController()
    const headers = new Headers(config.options.headers)

    controllerRef.current?.abort()
    controllerRef.current = controller
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(config.url, {
        ...config.options,
        body: serializeBody(requestBody, headers),
        headers,
        method: config.method,
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new HttpError(response.status, response.statusText)
      }

      const responseData = await parseResponse<TData>(response)

      if (controllerRef.current === controller) {
        setData(responseData)
      }

      return responseData
    } catch (requestError) {
      if (controllerRef.current !== controller) {
        return null
      }

      if (requestError instanceof DOMException && requestError.name === 'AbortError') {
        return null
      }

      const normalizedError =
        requestError instanceof Error
          ? requestError
          : new Error('An unknown HTTP error occurred')

      setError(normalizedError)
      return null
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null
        setIsLoading(false)
      }
    }
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const immediate = resolvedOptions.immediate ?? method === 'GET'

  useEffect(() => {
    if (!immediate) {
      return
    }

    let active = true

    queueMicrotask(() => {
      if (active) {
        void execute()
      }
    })

    return () => {
      active = false
      controllerRef.current?.abort()
    }
  }, [execute, immediate, url])

  return { data, error, execute, isLoading, reset }
}

export const useGet = <TData>(
  url: string,
  options?: Omit<UseHttpOptions<never>, 'body'>,
): UseHttpResult<TData, never> =>
    useHttp<TData, never>(url, 'GET', {
      ...options,
      immediate: options?.immediate ?? true,
    })

export const usePost = <TData, TBody = HttpBody>(
  url: string,
  options?: UseHttpOptions<TBody>,
): UseHttpResult<TData, TBody> =>
    useHttp<TData, TBody>(url, 'POST', {
      ...options,
      immediate: options?.immediate ?? false,
    })

export const usePut = <TData, TBody = HttpBody>(
  url: string,
  options?: UseHttpOptions<TBody>,
): UseHttpResult<TData, TBody> =>
    useHttp<TData, TBody>(url, 'PUT', {
      ...options,
      immediate: options?.immediate ?? false,
    })

export const usePatch = <TData, TBody = HttpBody>(
  url: string,
  options?: UseHttpOptions<TBody>,
): UseHttpResult<TData, TBody> =>
    useHttp<TData, TBody>(url, 'PATCH', {
      ...options,
      immediate: options?.immediate ?? false,
    })

export const useDelete = <TData, TBody = HttpBody>(
  url: string,
  options?: UseHttpOptions<TBody>,
): UseHttpResult<TData, TBody> =>
    useHttp<TData, TBody>(url, 'DELETE', {
      ...options,
      immediate: options?.immediate ?? false,
    })

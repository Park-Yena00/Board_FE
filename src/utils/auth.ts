// 인증 토큰 관리 유틸리티

const TOKEN_KEY = 'accessToken'
const TOKEN_TYPE_KEY = 'tokenType'

/**
 * 토큰 저장
 */
export const setToken = (token: string, tokenType: string = 'Bearer'): void => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
}

/**
 * 토큰 조회
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 토큰 타입 조회
 */
export const getTokenType = (): string => {
  return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer'
}

/**
 * Authorization 헤더 값 조회
 */
export const getAuthHeader = (): string | null => {
  const token = getToken()
  if (!token) return null
  const tokenType = getTokenType()
  return `${tokenType} ${token}`
}

/**
 * 토큰 제거 (로그아웃)
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
}

/**
 * 로그인 상태 확인
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null
}


// 백엔드 API 응답 구조에 맞춘 타입 정의

export interface Post {
  id: number
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt?: string
  viewCount?: number
  commentCount?: number
}

export interface PostCreateRequest {
  title: string
  content: string
  author: string
}

export interface PostUpdateRequest {
  title: string
  content: string
}

// 페이징 응답
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
}

// 게시글 목록 조회 파라미터
export interface PostListParams {
  page?: number
  size?: number
  sort?: string
  keyword?: string
}

// 댓글 관련 (백엔드에 댓글 기능이 있으므로)
export interface Comment {
  id: number
  content: string
  author: string
  createdAt: string
  updatedAt?: string
  postId: number
  parentId?: number // 대댓글인 경우 부모 댓글 ID
  replies?: Comment[]
}

export interface CommentCreateRequest {
  content: string
  author: string
  postId: number
  parentId?: number
}

// 사용자 관련 타입 정의
export interface User {
  id: number
  username: string
  email: string
}

// 로그인 요청
export interface LoginRequest {
  username: string
  password: string
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

// 회원가입 요청
export interface RegisterRequest {
  username: string
  email: string
  password: string
}

// 회원가입 응답
export interface RegisterResponse {
  id: number
  username: string
  email: string
}

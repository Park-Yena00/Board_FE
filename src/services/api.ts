import axios from 'axios'
import type {
  Post,
  PostCreateRequest,
  PostUpdateRequest,
  PageResponse,
  PostListParams,
  Comment,
  CommentCreateRequest,
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/board'
import { trackApiCall, trackError } from '../utils/metrics'
import { getAuthHeader } from '../utils/auth'

// 백엔드 API 기본 URL
// 개발 환경: http://localhost:8080
// 프로덕션: https://api.moodie.shop
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.moodie.shop'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// 요청 인터셉터 - 토큰 추가 및 메트릭 추적
apiClient.interceptors.request.use(
  (config) => {
    // 인증 토큰이 있으면 헤더에 추가
    const authHeader = getAuthHeader()
    if (authHeader) {
      config.headers.Authorization = authHeader
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 에러 처리 및 메트릭 추적
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase() || 'GET'
    const endpoint = response.config.url || ''
    trackApiCall(endpoint, method, response.status)
    return response
  },
  (error) => {
    const method = error.config?.method?.toUpperCase() || 'GET'
    const endpoint = error.config?.url || 'unknown'
    const status = error.response?.status || 500
    trackApiCall(endpoint, method, status)
    trackError('api_error', endpoint)

    // 에러 메시지 처리
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        '요청 처리 중 오류가 발생했습니다.'
      console.error('API Error:', errorMessage)
      error.message = errorMessage
    } else if (error.request) {
      console.error('API Error: 서버에 연결할 수 없습니다.')
      error.message = '서버에 연결할 수 없습니다.'
    } else {
      console.error('API Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export const boardApi = {
  // 게시글 목록 조회 (페이징 지원)
  getPosts: async (params?: PostListParams): Promise<PageResponse<Post>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString())
    }
    if (params?.size !== undefined) {
      queryParams.append('size', params.size.toString())
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort)
    }
    if (params?.keyword) {
      queryParams.append('keyword', params.keyword)
    }

    const queryString = queryParams.toString()
    const url = `/api/posts${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<PageResponse<Post>>(url)
    return response.data
  },

  // 게시글 상세 조회
  getPost: async (id: number): Promise<Post> => {
    const response = await apiClient.get<Post>(`/api/posts/${id}`)
    return response.data
  },

  // 게시글 작성
  createPost: async (data: PostCreateRequest): Promise<Post> => {
    const response = await apiClient.post<Post>('/api/posts', data)
    return response.data
  },

  // 게시글 수정
  updatePost: async (id: number, data: PostUpdateRequest): Promise<Post> => {
    const response = await apiClient.put<Post>(`/api/posts/${id}`, data)
    return response.data
  },

  // 게시글 삭제
  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/posts/${id}`)
  },

  // 댓글 목록 조회
  getComments: async (postId: number): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/api/posts/${postId}/comments`)
    return response.data
  },

  // 댓글 작성
  createComment: async (data: CommentCreateRequest): Promise<Comment> => {
    const response = await apiClient.post<Comment>(
      `/api/posts/${data.postId}/comments`,
      data
    )
    return response.data
  },

  // 댓글 수정
  updateComment: async (
    postId: number,
    commentId: number,
    content: string
  ): Promise<Comment> => {
    const response = await apiClient.put<Comment>(
      `/api/posts/${postId}/comments/${commentId}`,
      { content }
    )
    return response.data
  },

  // 댓글 삭제
  deleteComment: async (postId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}/comments/${commentId}`)
  },
}

// 인증 관련 API
export const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data)
    return response.data
  },

  // 회원가입
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      '/api/auth/register',
      data
    )
    return response.data
  },
}

// 사용자 관련 API
export const userApi = {
  // 사용자 정보 조회
  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/${id}`)
    return response.data
  },
}

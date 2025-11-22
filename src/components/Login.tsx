import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { setToken } from '../utils/auth'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { setIsLoggedIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('사용자명과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      const response = await authApi.login({
        username: username.trim(),
        password: password.trim(),
      })

      // 토큰 저장
      setToken(response.accessToken, response.tokenType)
      
      // 로그인 상태 업데이트
      setIsLoggedIn(true)

      // 홈으로 이동
      navigate('/')
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자명을 입력하세요"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="login-footer">
            <span>계정이 없으신가요? </span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="link-button"
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login


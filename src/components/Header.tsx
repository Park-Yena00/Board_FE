import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout()
      navigate('/')
    }
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-title" onClick={() => navigate('/')}>
          게시판 서비스
        </h1>
        <nav className="header-nav">
          {isLoggedIn ? (
            <>
              <button
                className="nav-button"
                onClick={() => navigate('/write')}
              >
                글쓰기
              </button>
              <button className="nav-button logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-button"
                onClick={() => navigate('/login')}
              >
                로그인
              </button>
              <button
                className="nav-button register-button"
                onClick={() => navigate('/register')}
              >
                회원가입
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header


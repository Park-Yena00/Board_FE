import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardApi } from '../services/api'
import './BoardWrite.css'

function BoardWrite() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim() || !author.trim()) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      await boardApi.createPost({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
      })
      navigate('/')
    } catch (err) {
      alert('게시글 작성에 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="board-write-container">
      <div className="write-header">
        <h2>게시글 작성</h2>
        <button onClick={() => navigate('/')} className="cancel-button">
          취소
        </button>
      </div>

      <form onSubmit={handleSubmit} className="write-form">
        <div className="form-group">
          <label htmlFor="author">작성자</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="작성자 이름을 입력하세요"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={15}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cancel-button"
            disabled={loading}
          >
            취소
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '작성 중...' : '작성하기'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BoardWrite


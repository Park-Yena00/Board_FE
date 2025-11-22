import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { boardApi } from '../services/api'
import type { Post } from '../types/board'
import './BoardEdit.css'

function BoardEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (id) {
      loadPost(parseInt(id))
    }
  }, [id])

  const loadPost = async (postId: number) => {
    try {
      setFetching(true)
      const data = await boardApi.getPost(postId)
      setPost(data)
      setTitle(data.title)
      setContent(data.content)
    } catch (err) {
      alert('게시글을 불러오는데 실패했습니다.')
      console.error(err)
      navigate('/')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    if (!id) {
      return
    }

    try {
      setLoading(true)
      await boardApi.updatePost(parseInt(id), {
        title: title.trim(),
        content: content.trim(),
      })
      navigate(`/post/${id}`)
    } catch (err) {
      alert('게시글 수정에 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="board-edit-container">
        <div className="loading">로딩 중...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="board-edit-container">
        <div className="error">게시글을 찾을 수 없습니다.</div>
        <button onClick={() => navigate('/')} className="back-button">
          목록으로
        </button>
      </div>
    )
  }

  return (
    <div className="board-edit-container">
      <div className="edit-header">
        <h2>게시글 수정</h2>
        <button onClick={() => navigate(`/post/${id}`)} className="cancel-button">
          취소
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
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
            onClick={() => navigate(`/post/${id}`)}
            className="cancel-button"
            disabled={loading}
          >
            취소
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '수정 중...' : '수정하기'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BoardEdit


import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { boardApi } from '../services/api'
import type { Post, Comment, CommentCreateRequest } from '../types/board'
import './BoardDetail.css'

function BoardDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  useEffect(() => {
    if (id) {
      loadPost(parseInt(id))
      loadComments(parseInt(id))
    }
  }, [id])

  const loadPost = async (postId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await boardApi.getPost(postId)
      setPost(data)
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (postId: number) => {
    try {
      const data = await boardApi.getComments(postId)
      setComments(data)
    } catch (err) {
      console.error('댓글을 불러오는데 실패했습니다.', err)
    }
  }

  const handleDelete = async () => {
    if (!post || !window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      await boardApi.deletePost(post.id)
      navigate('/')
    } catch (err) {
      alert('삭제에 실패했습니다.')
      console.error(err)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !commentContent.trim() || !commentAuthor.trim()) {
      alert('작성자와 댓글 내용을 입력해주세요.')
      return
    }

    try {
      setCommentLoading(true)
      const commentData: CommentCreateRequest = {
        content: commentContent.trim(),
        author: commentAuthor.trim(),
        postId: parseInt(id),
      }
      await boardApi.createComment(commentData)
      setCommentContent('')
      setCommentAuthor('')
      await loadComments(parseInt(id))
    } catch (err: any) {
      alert(err.message || '댓글 작성에 실패했습니다.')
      console.error(err)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleCommentEdit = async (commentId: number) => {
    if (!id || !editCommentContent.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    try {
      await boardApi.updateComment(parseInt(id), commentId, editCommentContent.trim())
      setEditingCommentId(null)
      setEditCommentContent('')
      await loadComments(parseInt(id))
    } catch (err: any) {
      alert(err.message || '댓글 수정에 실패했습니다.')
      console.error(err)
    }
  }

  const handleCommentDelete = async (commentId: number) => {
    if (!id || !window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      await boardApi.deleteComment(parseInt(id), commentId)
      await loadComments(parseInt(id))
    } catch (err: any) {
      alert(err.message || '댓글 삭제에 실패했습니다.')
      console.error(err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="board-detail-container">
        <div className="loading">로딩 중...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="board-detail-container">
        <div className="error">{error || '게시글을 찾을 수 없습니다.'}</div>
        <button onClick={() => navigate('/')} className="back-button">
          목록으로
        </button>
      </div>
    )
  }

  return (
    <div className="board-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← 목록으로
        </button>
        <div className="detail-actions">
          <button
            className="edit-button"
            onClick={() => navigate(`/edit/${post.id}`)}
          >
            수정
          </button>
          <button className="delete-button" onClick={handleDelete}>
            삭제
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-title">{post.title}</div>
        <div className="detail-meta">
          <span className="meta-item">
            <strong>작성자:</strong> {post.author}
          </span>
          <span className="meta-item">
            <strong>작성일:</strong> {formatDate(post.createdAt)}
          </span>
          {post.updatedAt && (
            <span className="meta-item">
              <strong>수정일:</strong> {formatDate(post.updatedAt)}
            </span>
          )}
        </div>
        <div className="detail-body">{post.content}</div>
      </div>

      {/* 댓글 섹션 */}
      <div className="comments-section">
        <h3 className="comments-title">댓글 ({comments.length})</h3>

        {/* 댓글 작성 폼 */}
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <div className="comment-form-row">
            <input
              type="text"
              placeholder="작성자"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              className="comment-author-input"
              disabled={commentLoading}
            />
            <textarea
              placeholder="댓글을 입력하세요..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="comment-content-input"
              rows={3}
              disabled={commentLoading}
            />
            <button
              type="submit"
              className="comment-submit-button"
              disabled={commentLoading || !commentContent.trim() || !commentAuthor.trim()}
            >
              {commentLoading ? '작성 중...' : '댓글 작성'}
            </button>
          </div>
        </form>

        {/* 댓글 목록 */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">댓글이 없습니다.</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                {editingCommentId === comment.id ? (
                  <div className="comment-edit-form">
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      className="comment-edit-input"
                      rows={3}
                    />
                    <div className="comment-edit-actions">
                      <button
                        onClick={() => handleCommentEdit(comment.id)}
                        className="comment-save-button"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null)
                          setEditCommentContent('')
                        }}
                        className="comment-cancel-button"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id)
                          setEditCommentContent(comment.content)
                        }}
                        className="comment-edit-button"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        className="comment-delete-button"
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default BoardDetail


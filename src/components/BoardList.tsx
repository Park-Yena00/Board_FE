import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardApi } from '../services/api'
import type { Post, PageResponse } from '../types/board'
import './BoardList.css'

function BoardList() {
  const [pageData, setPageData] = useState<PageResponse<Post> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadPosts(currentPage, keyword)
  }, [currentPage, keyword])

  const loadPosts = async (page: number, searchKeyword?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await boardApi.getPosts({
        page,
        size: pageSize,
        sort: 'createdAt,desc',
        keyword: searchKeyword,
      })
      setPageData(data)
    } catch (err: any) {
      setError(err.message || '게시글을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyword(searchInput)
    setCurrentPage(0) // 검색 시 첫 페이지로
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      await boardApi.deletePost(id)
      await loadPosts(currentPage, keyword)
    } catch (err: any) {
      alert(err.message || '삭제에 실패했습니다.')
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const posts = pageData?.content || []
  const totalPages = pageData?.totalPages || 0
  const totalElements = pageData?.totalElements || 0

  if (loading && !pageData) {
    return (
      <div className="board-list-container">
        <div className="loading">로딩 중...</div>
      </div>
    )
  }

  if (error && !pageData) {
    return (
      <div className="board-list-container">
        <div className="error">{error}</div>
        <button onClick={() => loadPosts(currentPage, keyword)} className="retry-button">
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="board-list-container">
      <div className="board-list-header">
        <h2>게시글 목록</h2>
        <button className="write-button" onClick={() => navigate('/write')}>
          글쓰기
        </button>
      </div>

      {/* 검색 영역 */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="제목 또는 내용으로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            검색
          </button>
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                setKeyword('')
                setCurrentPage(0)
              }}
              className="clear-button"
            >
              초기화
            </button>
          )}
        </form>
        {keyword && (
          <div className="search-result">
            "{keyword}" 검색 결과: {totalElements}개
          </div>
        )}
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="empty-state">
          <p>{keyword ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}</p>
          <button className="write-button" onClick={() => navigate('/write')}>
            첫 게시글 작성하기
          </button>
        </div>
      ) : (
        <>
          <div className="posts-table">
            <table>
              <thead>
                <tr>
                  <th className="id-col">번호</th>
                  <th className="title-col">제목</th>
                  <th className="author-col">작성자</th>
                  <th className="date-col">작성일</th>
                  <th className="action-col">작업</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="post-row"
                  >
                    <td>{post.id}</td>
                    <td className="title-cell">
                      {post.title}
                      {post.commentCount && post.commentCount > 0 && (
                        <span className="comment-count"> [{post.commentCount}]</span>
                      )}
                    </td>
                    <td>{post.author}</td>
                    <td>{formatDate(post.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => navigate(`/edit/${post.id}`)}
                        >
                          수정
                        </button>
                        <button
                          className="delete-button"
                          onClick={(e) => handleDelete(post.id, e)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                className="page-button"
              >
                처음
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="page-button"
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                // 현재 페이지 주변 5개 페이지만 표시
                if (
                  page === 0 ||
                  page === totalPages - 1 ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`page-button ${currentPage === page ? 'active' : ''}`}
                    >
                      {page + 1}
                    </button>
                  )
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return <span key={page} className="page-ellipsis">...</span>
                }
                return null
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="page-button"
              >
                다음
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="page-button"
              >
                마지막
              </button>
            </div>
          )}

          {/* 페이지 정보 */}
          <div className="page-info">
            총 {totalElements}개 중 {currentPage * pageSize + 1}-
            {Math.min((currentPage + 1) * pageSize, totalElements)}개 표시
          </div>
        </>
      )}
    </div>
  )
}

export default BoardList

import React from 'react'

// 카테고리 목록
const CATEGORIES = ['병원 동행', '강아지 산책', '가사 보조', '심부름/쇼핑', '요양 보호', '운행 대행', '기타']

// 업무 상세 페이지 컴포넌트
const TaskDetailPage = ({ task, onBack, onApplyApplied }: {
  task: any
  onBack: () => void
  onApplyApplied: () => void
}) => {
  const [isApplying, setIsApplying] = React.useState(false)
  const [applyMessage, setApplyMessage] = React.useState('')
  const [hasApplied, setHasApplied] = React.useState(false)
  const [applications, setApplications] = React.useState([])
  const [isLoadingApps, setIsLoadingApps] = React.useState(false)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isHelper = currentUser.role === 'HELPER' || currentUser.role === 'helper' || currentUser.role === 'premium_helper'
  const isRequester = currentUser.role === 'USER' || currentUser.role === 'user'

  // 지원자 목록 불러오기
  const loadApplications = React.useCallback(() => {
    setIsLoadingApps(true)
    fetch(`/api/tasks/${task.id}/applications`)
      .then(res => res.json())
      .then(data => setApplications(data.applications || []))
      .catch(() => setApplications([]))
      .finally(() => setIsLoadingApps(false))
  }, [task.id])

  React.useEffect(() => {
    if (isRequester) {
      loadApplications()
    }
  }, [isRequester, loadApplications])

  const handleApply = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('로그인이 필요합니다')
      return
    }

    if (!isHelper) {
      alert('이모님만 지원할 수 있습니다')
      return
    }

    setIsApplying(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: applyMessage })
      })

      if (response.ok) {
        alert('지원이 완료되었습니다!')
        setHasApplied(true)
        onApplyApplied()
      } else {
        const error = await response.json()
        alert(error.detail || '지원에 실패했습니다')
      }
    } catch (error) {
      alert('지원에 실패했습니다')
    } finally {
      setIsApplying(false)
    }
  }

  // 지원 상태 변경 (승인/거절)
  const handleUpdateApplication = async (applicationId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('로그인이 필요합니다')
      return
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        alert(newStatus === 'ACCEPTED' ? '지원을 수락했습니다!' : '지원을 거절했습니다.')
        loadApplications() // 지원자 목록 새로고침
      } else {
        const error = await response.json()
        alert(error.detail || '상태 변경에 실패했습니다')
      }
    } catch (error) {
      alert('상태 변경에 실패했습니다')
    }
  }

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { background: '#fef3c7', color: '#92400e', border: '#f59e0b' }
      case 'ACCEPTED':
        return { background: '#dcfce7', color: '#166534', border: '#22c55e' }
      case 'REJECTED':
        return { background: '#fee2e2', color: '#991b1b', border: '#ef4444' }
      default:
        return { background: '#f3f4f6', color: '#374151', border: '#d1d5db' }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '대기 중'
      case 'ACCEPTED': return '수락됨'
      case 'REJECTED': return '거절됨'
      default: return status
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: '16px',
          padding: '8px 16px',
          background: '#f3f4f6',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← 목록으로 돌아가기
      </button>

      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        {/* 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f3f4f6' }}>
          <div style={{ flex: 1 }}>
            <span style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '12px' }}>
              {task.category}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>
              {task.title}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>{task.address}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f97316' }}>
              {task.amount.toLocaleString()}원
            </div>
          </div>
        </div>

        {/* 업무 정보 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>⏰ 예상 시간</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{task.duration_minutes}분</div>
          </div>
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>📅 예약일</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              {new Date(task.scheduled_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </div>
          </div>
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>⏰ 예약시간</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              {new Date(task.scheduled_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* 상세 내용 */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#111827' }}>상세 내용</h2>
          <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', lineHeight: '1.7', color: '#374151' }}>
            {task.content || '상세 내용이 없습니다.'}
          </div>
        </div>
      </div>

      {/* 구인자용: 지원자 목록 */}
      {isRequester && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
            지원자 목록 ({applications.length}명)
          </h2>

          {isLoadingApps ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              지원자 목록을 불러오는 중...
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
              <p>아직 지원자가 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {applications.map((app: any) => {
                const statusStyle = getStatusStyle(app.status)
                return (
                  <div
                    key={app.id}
                    style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '20px',
                      border: `2px solid ${statusStyle.border}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: app.helper.tier === 'PREMIUM' ? '#fbbf24' : '#f97316',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          👤
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#111827' }}>
                              {app.helper.name}
                            </span>
                            {app.helper.tier === 'PREMIUM' && (
                              <span style={{ background: '#fbbf24', color: '#78350f', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '9999px' }}>
                                프리미엄
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            ⭐ {app.helper.rating} • 완료 {app.helper.completed_tasks}건 • 리뷰 {app.helper.review_count}개
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: statusStyle.background,
                        color: statusStyle.color,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {getStatusText(app.status)}
                      </div>
                    </div>

                    {app.message && (
                      <div style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.875rem', color: '#374151' }}>
                        💬 "{app.message}"
                      </div>
                    )}

                    {app.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleUpdateApplication(app.id, 'REJECTED')}
                          style={{
                            padding: '8px 16px',
                            background: 'white',
                            color: '#ef4444',
                            border: '2px solid #ef4444',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          거절
                        </button>
                        <button
                          onClick={() => handleUpdateApplication(app.id, 'ACCEPTED')}
                          style={{
                            padding: '8px 16px',
                            background: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          수락
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 이모님용: 지원하기 섹션 */}
      {!hasApplied && isHelper && (
        <div style={{ background: '#fff7ed', border: '2px solid #f97316', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: '#9a3412' }}>이모님 지원하기</h3>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              구인자에게 전달할 메시지 (선택사항)
            </label>
            <textarea
              rows={3}
              placeholder="예: 성실히 일하겠습니다. 경험 3년입니다."
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #fed7aa',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '16px'
              }}
            />
            <button
              onClick={handleApply}
              disabled={isApplying}
              style={{
                width: '100%',
                padding: '16px',
                background: isApplying ? '#fdba74' : '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                cursor: isApplying ? 'not-allowed' : 'pointer'
              }}
            >
              {isApplying ? '지원 중...' : '지원하기 🙋‍♀️'}
            </button>
          </div>
        </div>
      )}

      {/* 지원 완료 메시지 */}
      {hasApplied && (
        <div style={{ background: '#dcfce7', border: '2px solid #22c55e', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', color: '#166534' }}>지원 완료!</h3>
          <p style={{ color: '#15803d' }}>구인자의 승인을 기다리고 있습니다</p>
        </div>
      )}
    </div>
  )
}

// 간단한 페이지 컴포넌트
const HomePage = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [tasks, setTasks] = React.useState([])
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<any>(null)

  // 업무 등록 폼 상태
  const [formData, setFormData] = React.useState({
    category: '',
    title: '',
    amount: '',
    content: '',
    address: '',
    scheduled_at: '',
    duration_minutes: '60'
  })

  // 로그인 상태 확인
  React.useEffect(() => {
    const user = localStorage.getItem('user')
    setIsLoggedIn(!!user)
  }, [])

  // 업무 목록 불러오기
  const loadTasks = React.useCallback(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data.tasks || []))
      .catch(() => setTasks([]))
  }, [])

  React.useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const quickLogin = async (type: 'user' | 'premium' | 'helper') => {
    setIsLoading(true)
    try {
      const phones = { user: '01000000001', premium: '01000000201', helper: '01000000401' }

      const response = await fetch(`/api/test/login?phone=${phones[type]}`)
      const data = await response.json()

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.access_token)
        setIsLoggedIn(true)
        alert(`${data.user.name}님 로그인 성공!`)
      }
    } catch (error) {
      alert('로그인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 업무 등록 처리
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = localStorage.getItem('token')
    if (!token) {
      alert('로그인이 필요합니다')
      return
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'USER' && user.role !== 'user') {
      alert('구인자만 업무를 등록할 수 있습니다')
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: formData.category,
          title: formData.title,
          amount: parseInt(formData.amount),
          content: formData.content,
          address: formData.address,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          duration_minutes: parseInt(formData.duration_minutes)
        })
      })

      if (response.ok) {
        alert('업무가 등록되었습니다!')
        setShowCreateForm(false)
        setFormData({
          category: '',
          title: '',
          amount: '',
          content: '',
          address: '',
          scheduled_at: '',
          duration_minutes: '60'
        })
        loadTasks()
      } else {
        const error = await response.json()
        alert(error.detail || '업무 등록에 실패했습니다')
      }
    } catch (error) {
      alert('업무 등록에 실패했습니다')
    }
  }

  // 상세 페이지가 표시되어 있으면 상세 페이지만 표시
  if (selectedTask) {
    return (
      <TaskDetailPage
        task={selectedTask}
        onBack={() => setSelectedTask(null)}
        onApplyApplied={() => {
          loadTasks()
          setSelectedTask(null)
        }}
      />
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 테스트 모드 알림 */}
      <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>🧪</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 'bold', color: '#92400e', margin: 0 }}>
            테스트 모드 {isLoggedIn && `(현재: ${JSON.parse(localStorage.getItem('user') || '{}')?.name || '사용자'})`}
          </p>
          <p style={{ color: '#b7791f', fontSize: '14px', margin: '4px 0 0 0' }}>아래 버튼을 클릭하여 계정을 전환하세요</p>
        </div>
      </div>

      {/* 히어로 섹션 */}
      <section style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', 
        borderRadius: '32px', 
        padding: '0', 
        color: '#1f2937', 
        marginBottom: '40px',
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.15)'
      }}>
        {/* 콘텐츠 영역 */}
        <div style={{ flex: '1 1 50%', padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', color: '#c2410c' }}>
            우리 동네 믿음직한 손길이 필요할 때,
          </h2>
          <h1 style={{ 
            fontSize: '5rem', 
            fontWeight: '900', 
            marginBottom: '32px', 
            background: 'linear-gradient(45deg, #ea580c 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-2px',
            lineHeight: '1.2'
          }}>
            이모~여기!
          </h1>
          
          {/* 구인하기 버튼 */}
          {isLoggedIn && (
            <div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                style={{
                  padding: '18px 40px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: '800',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 15px 20px -3px rgba(234, 88, 12, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(234, 88, 12, 0.3)'
                }}
              >
                {showCreateForm ? '× 창 닫기' : '🙋‍♀️ 도움 요청하기'}
              </button>
            </div>
          )}
        </div>
        
        {/* 이미지 영역 */}
        <div style={{
          flex: '1 1 40%',
          minHeight: '350px',
          backgroundImage: 'url(/assets/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderTopLeftRadius: '100px',
          borderBottomLeftRadius: '16px'
        }}>
        </div>
      </section>

      {/* 업무 등록 폼 */}
      {showCreateForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #f97316' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '24px', color: '#f97316' }}>📝 도움 요청하기</h2>

          <form onSubmit={handleCreateTask}>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {/* 카테고리 선택 */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  카테고리 *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="">카테고리를 선택하세요</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 제목 */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 강남구 병원 동행 구합니다"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* 금액 */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  금액 (원) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  placeholder="예: 30000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* 소요 시간 */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  예상 소요 시간 *
                </label>
                <select
                  required
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="30">30분</option>
                  <option value="60">1시간</option>
                  <option value="90">1시간 30분</option>
                  <option value="120">2시간</option>
                </select>
              </div>

              {/* 주소 */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  주소 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* 예약 날짜/시간 */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  예약 날짜 및 시간 *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* 내용 */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  상세 내용 *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="구인하려는 업무에 대한 상세 내용을 작성해주세요.&#10;예: 65세 남자분, 휠체어 사용, 동행 병원은 강남성심병원입니다."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* 버튼들 */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                등록하기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 빠른 로그인 섹션 */}
      <section style={{ background: 'linear-gradient(to right, #8b5cf6, #ec4899)', borderRadius: '16px', padding: '32px', color: 'white', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>🧪 빠른 로그인 (테스트)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {/* 구인자 */}
          <button
            onClick={() => quickLogin('user')}
            disabled={isLoading}
            style={{ padding: '24px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: 'none', color: 'white', textAlign: 'left', cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', margin: 0 }}>구인자</h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: '4px 0 0 0' }}>도움을 요청해요</p>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px', fontFamily: 'monospace' }}>
              01000000001
            </div>
          </button>

          {/* 프리미엄 이모님 */}
          <button
            onClick={() => quickLogin('premium')}
            disabled={isLoading}
            style={{ padding: '24px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: 'none', color: 'white', textAlign: 'left', cursor: isLoading ? 'not-allowed' : 'pointer', position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#fbbf24', color: '#78350f', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '9999px' }}>
              프리미엄
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#eab308', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👑</div>
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', margin: 0 }}>프리미엄 이모님</h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: '4px 0 0 0' }}>우선 알림 받아요</p>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px', fontFamily: 'monospace' }}>
              01000000201
            </div>
          </button>

          {/* 일반 이모님 */}
          <button
            onClick={() => quickLogin('helper')}
            disabled={isLoading}
            style={{ padding: '24px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: 'none', color: 'white', textAlign: 'left', cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#f97316', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👥</div>
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', margin: 0 }}>일반 이모님</h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: '4px 0 0 0' }}>도움을 드려요</p>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px', fontFamily: 'monospace' }}>
              01000000401
            </div>
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '16px', opacity: 0.75 }}>
          모든 계정의 비밀번호는 <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>test1234</span>입니다
        </p>
      </section>

      {/* 카테고리 섹션 */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '8px' }}>어떤 도움이 필요하신가요?</h2>
          <p style={{ color: '#6b7280' }}>다양한 카테고리의 도움을 받을 수 있어요</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          {['🏥 병원 동행', '🐕 강아지 산책', '🧹 가사 보조', '🛒 심부름/쇼핑', '❤️ 요양 보호', '🚗 운행 대행', '📦 기타'].map((cat) => {
            const categoryOnly = cat.split(' ')[1]
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(categoryOnly)}
                style={{
                  padding: '24px',
                  background: selectedCategory === categoryOnly ? '#fef3c7' : 'white',
                  borderRadius: '12px',
                  boxShadow: selectedCategory === categoryOnly ? '0 0 0 3px #f59e0b' : '0 1px 3px rgba(0,0,0,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>{cat.split(' ')[0]}</span>
                <span style={{ fontWeight: '500', color: '#111827' }}>{categoryOnly}</span>
              </button>
            )
          })}
        </div>

        {/* 로그인 후 업무 목록 표시 */}
        {isLoggedIn && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {selectedCategory ? `${selectedCategory} 업무` : '📋 등록된 업무'} ({selectedCategory ? tasks.filter((t: any) => t.category === selectedCategory).length : tasks.length}개)
              </h3>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  전체 보기
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {tasks
                .filter((t: any) => !selectedCategory || t.category === selectedCategory)
                .map((task: any) => (
                  <div key={task.id} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.875rem', background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '6px' }}>{task.category}</span>
                      <span style={{ fontWeight: 'bold', color: '#f97316', fontSize: '1.125rem' }}>{task.amount.toLocaleString()}원</span>
                    </div>
                    <h4 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '1rem' }}>{task.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>{task.address}</p>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>⏰ {task.duration_minutes}분</span>
                      <span>📅 {new Date(task.scheduled_at).toLocaleDateString('ko-KR')}</span>
                      {task.requester_name && <span>구인자: {task.requester_name}</span>}
                      {task.requester_rating && <span>⭐ {task.requester_rating}</span>}
                    </div>
                    <button
                      onClick={() => setSelectedTask(task)}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '10px',
                        background: '#f97316',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      자세히 보기
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* 푸터 */}
      <footer style={{ background: '#1f2937', color: '#9ca3af', padding: '48px 20px 24px', marginTop: '64px', borderRadius: '16px 16px 0 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* 회사 정보 */}
          <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #374151', textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Artractive</h2>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p style={{ margin: '4px 0' }}>관리자 : 이재명 | 사업자 등록번호 : 370-55-*****</p>
              <p style={{ margin: '4px 0' }}>주소 : 경기도 시흥시 서울대학로 59-69</p>
            </div>
          </div>

          {/* 하단 정보 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', margin: 0 }}>
              © 2024 Artractive. ALL RIGHTS RESERVED.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', margin: 0, lineHeight: '1.6', maxWidth: '800px' }}>
              아트랙티브는 통신판매중개업자로서 직접 거래 당사자가 아니며, 개인간의 정보·상태·보험·사고 및 거래에 대한 책임은 구인자와 공급자에게 있습니다.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.875rem' }}>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>이용약관</a>
              <span style={{ color: '#4b5563' }}>|</span>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>개인정보처리방침</a>
              <span style={{ color: '#4b5563' }}>|</span>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>위치정보 이용약관</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return <HomePage />
}

export default App

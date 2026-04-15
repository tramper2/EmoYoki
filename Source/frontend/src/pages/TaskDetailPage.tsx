import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { taskService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import KakaoMap from '@/components/KakaoMap'
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  Star,
  Send,
  AlertCircle,
  CheckCircle,
  Camera,
  X,
} from 'lucide-react'

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [applicationMessage, setApplicationMessage] = useState('')
  const [completionPhoto, setCompletionPhoto] = useState('')
  const [completionNote, setCompletionNote] = useState('')

  const { data: task, isLoading } = useQuery(['task', id], () =>
    taskService.getTask(id!)
  )

  const applyMutation = useMutation(
    (message?: string) => taskService.applyToTask(id!, message),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', id])
        alert('지원했습니다!')
      },
    }
  )

  const completeMutation = useMutation(
    ({ photo, note }: { photo: string; note?: string }) =>
      taskService.submitCompletion(id!, photo, note),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', id])
        alert('완료 보고를 제출했습니다!')
      },
    }
  )

  const confirmMutation = useMutation(
    (confirmed: boolean) => taskService.confirmCompletion(id!, confirmed),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', id])
      },
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">업무를 찾을 수 없어요</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600"
        >
          뒤로가기
        </button>
      </div>
    )
  }

  const isRequester = user?.id === task.requester_id
  const isHelper = user?.id === task.helper_id
  const canApply = user?.role === 'HELPER' && task.status === 'WAITING' && !isHelper
  const canComplete = isHelper && task.status === 'MATCHED'
  const canConfirm = isRequester && task.status === 'COMPLETED' && !task.confirmed_by_requester

  const statusConfig: Record<string, { label: string; className: string }> = {
    WAITING: { label: '대기 중', className: 'bg-gray-100 text-gray-700' },
    MATCHED: { label: '매칭 완료', className: 'bg-blue-100 text-blue-700' },
    ONGOING: { label: '진행 중', className: 'bg-green-100 text-green-700' },
    COMPLETED: { label: '완료', className: 'bg-gray-100 text-gray-700' },
    CANCELLED: { label: '취소됨', className: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <p className="text-gray-600">{task.category}</p>
        </div>
      </div>

      {/* 상태 배지 */}
      <div className="flex items-center justify-between">
        <span
          className={`px-4 py-2 rounded-full font-medium ${statusConfig[task.status].className}`}
        >
          {statusConfig[task.status].label}
        </span>
        <span className="text-2xl font-bold text-orange-600">
          {task.amount.toLocaleString()}원
        </span>
      </div>

      {/* 지도 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <KakaoMap
          center={{ lat: task.lat, lng: task.lng }}
          markers={[{ lat: task.lat, lng: task.lng }]}
          height="300px"
        />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-orange-600 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{task.address}</p>
              {task.building_name && (
                <p className="text-sm text-gray-600">{task.building_name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">업무 상세</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar size={20} className="text-gray-600 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">예약 일시</p>
              <p className="font-medium text-gray-900">
                {new Date(task.scheduled_at).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-gray-600 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">소요 시간</p>
              <p className="font-medium text-gray-900">{task.duration_minutes}분</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign size={20} className="text-gray-600 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">금액</p>
              <p className="font-medium text-gray-900">
                {task.amount.toLocaleString()}원
              </p>
            </div>
          </div>
          {task.description && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-700">{task.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 구인자 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">구인자 정보</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <User size={24} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{task.requester_name || '구인자'}</p>
            {task.requester_rating && (
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-gray-600">
                  {task.requester_rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 이모님 정보 (매칭 후) */}
      {task.helper_name && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">매칭된 이모님</h2>
          <div className="flex items-center gap-4">
            {task.helper_profile_image ? (
              <img
                src={task.helper_profile_image}
                alt={task.helper_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <User size={24} className="text-orange-600" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{task.helper_name}</p>
              <div className="flex items-center gap-3">
                {task.helper_rating && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-600">
                      {task.helper_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-600">
                  완료 {task.helper_completed_tasks || 0}건
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 지원하기 (이모님) */}
      {canApply && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">지원하기</h2>
          <textarea
            value={applicationMessage}
            onChange={(e) => setApplicationMessage(e.target.value)}
            placeholder="구인자에게 전달할 메시지를 작성하세요 (선택)"
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none mb-4"
          />
          <button
            onClick={() => applyMutation.mutate(applicationMessage || undefined)}
            disabled={applyMutation.isLoading}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {applyMutation.isLoading ? '지원 중...' : '지원하기'}
          </button>
        </div>
      )}

      {/* 완료 보고 (이모님) */}
      {canComplete && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">완료 보고</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                완료 사진
              </label>
              <input
                type="url"
                value={completionPhoto}
                onChange={(e) => setCompletionPhoto(e.target.value)}
                placeholder="사진 URL을 입력하세요"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                완료 메모 (선택)
              </label>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                placeholder="특이사항 등을 남겨주세요"
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={() =>
                completeMutation.mutate({ photo: completionPhoto, note: completionNote })
              }
              disabled={!completionPhoto || completeMutation.isLoading}
              className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              {completeMutation.isLoading ? '제출 중...' : '완료 보고 제출'}
            </button>
          </div>
        </div>
      )}

      {/* 완료 확인 (구인자) */}
      {canConfirm && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">완료 확인</h2>
          <p className="text-gray-600 mb-6">
            이모님이 완료 보고를 제출했습니다. 내용을 확인하신 후 승인해주세요.
          </p>
          {task.completion_photo && (
            <div className="mb-4">
              <img
                src={task.completion_photo}
                alt="완료 사진"
                className="w-full rounded-xl"
              />
            </div>
          )}
          {task.completion_note && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-700">{task.completion_note}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => confirmMutation.mutate(false)}
              disabled={confirmMutation.isLoading}
              className="flex-1 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              거절하기
            </button>
            <button
              onClick={() => confirmMutation.mutate(true)}
              disabled={confirmMutation.isLoading}
              className="flex-1 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              {confirmMutation.isLoading ? '처리 중...' : '확인하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskDetailPage

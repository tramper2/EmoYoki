import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from 'react-query'
import { taskService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import KakaoMap from '@/components/KakaoMap'
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import type { TaskCategory, Location } from '@/types'

const categories: { value: TaskCategory; label: string; icon: string }[] = [
  { value: 'HOSPITAL', label: '병원 동행', icon: '🏥' },
  { value: 'DOG_WALK', label: '강아지 산책', icon: '🐕' },
  { value: 'CLEANING', label: '가사 보조', icon: '🧹' },
  { value: 'SHOPPING', label: '심부름/쇼핑', icon: '🛒' },
  { value: 'CAREGIVING', label: '요양 보호', icon: '❤️' },
  { value: 'PET_CARE', label: '반려동물 돌봄', icon: '🐾' },
  { value: 'DRIVING', label: '운행 대행', icon: '🚗' },
  { value: 'EVENT_HELPER', label: '행사 보조', icon: '🎉' },
  { value: 'ERRAND', label: '심부름', icon: '📦' },
  { value: 'OTHER', label: '기타', icon: '📋' },
]

const durations = [
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 90, label: '1시간 30분' },
  { value: 120, label: '2시간' },
  { value: 150, label: '2시간 30분' },
  { value: 180, label: '3시간' },
  { value: 240, label: '4시간' },
]

const amounts = [
  { value: 10000, label: '1만원' },
  { value: 15000, label: '1.5만원' },
  { value: 20000, label: '2만원' },
  { value: 25000, label: '2.5만원' },
  { value: 30000, label: '3만원' },
  { value: 40000, label: '4만원' },
  { value: 50000, label: '5만원' },
  { value: 0, label: '직접 입력' },
]

const TaskCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<TaskCategory | null>(null)
  const [location, setLocation] = useState<Location | null>(null)
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(60)
  const [amount, setAmount] = useState(20000)
  const [customAmount, setCustomAmount] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = useMutation(taskService.createTask, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('tasks')
      navigate(`/tasks/${data.id}`)
    },
  })

  const handleLocationSelect = (loc: Location) => {
    setLocation(loc)
  }

  const handleSubmit = () => {
    if (!category || !location || !scheduledAt || !title) {
      alert('모든 필수 항목을 입력해주세요')
      return
    }

    const finalAmount = amount === 0 ? parseInt(customAmount) : amount

    createMutation.mutate({
      category,
      title,
      description: description || undefined,
      lat: location.lat,
      lng: location.lng,
      address: location.address,
      building_name: location.buildingName,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: duration,
      amount: finalAmount,
    })
  }

  const isFormValid =
    category && location && scheduledAt && title && (amount > 0 || customAmount)

  return (
    <div className="max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 업무 요청</h1>
          <p className="text-gray-600">도움이 필요한 내용을 입력하세요</p>
        </div>
      </div>

      {/* 진행 상태 */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step > s ? <CheckCircle size={20} /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  step > s ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Step 1: 카테고리 선택 */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              어떤 도움이 필요하신가요?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategory(cat.value)
                    setStep(2)
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    category === cat.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="font-medium text-gray-900 mt-2">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 위치 선택 */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              어디서 도움이 필요하신가요?
            </h2>
            <div className="space-y-4">
              {location && (
                <div className="p-4 bg-orange-50 rounded-xl flex items-start gap-3">
                  <MapPin size={20} className="text-orange-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{location.address}</p>
                    {location.buildingName && (
                      <p className="text-sm text-gray-600">{location.buildingName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setLocation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              )}
              <KakaoMap
                center={{ lat: 37.5665, lng: 126.9780 }}
                onClick={handleLocationSelect}
                height="400px"
              />
              <p className="text-sm text-gray-600 text-center">
                지도에서 원하는 위치를 클릭하세요
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                이전
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!location}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 시간 및 금액 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <Calendar size={20} className="text-orange-600" />
                언제 필요하신가요?
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <Clock size={20} className="text-orange-600" />
                얼마 동안 필요하신가요?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`py-3 rounded-xl font-medium transition-colors ${
                      duration === d.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <DollarSign size={20} className="text-orange-600" />
                금액을 정해주세요
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {amounts.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => {
                      setAmount(a.value)
                      if (a.value > 0) setCustomAmount('')
                    }}
                    className={`py-3 rounded-xl font-medium transition-colors ${
                      (amount === a.value && a.value > 0) ||
                      (amount === 0 && a.value === 0 && !customAmount)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              {amount === 0 && (
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="금액 입력 (원)"
                  min={5000}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                이전
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!scheduledAt}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 상세 정보 */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <FileText size={20} className="text-orange-600" />
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 동물병원 동행 도와주세요"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                상세 설명 (선택)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="추가로 전달하고 싶은 내용이 있다면 적어주세요"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>

            {/* 요약 */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">요청 내용 확인</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">카테고리</span>
                  <span className="font-medium">
                    {categories.find((c) => c.value === category)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">위치</span>
                  <span className="font-medium">{location?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">일시</span>
                  <span className="font-medium">
                    {new Date(scheduledAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">소요 시간</span>
                  <span className="font-medium">{duration}분</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">금액</span>
                  <span className="font-semibold text-orange-600">
                    {(amount === 0 ? customAmount : amount)?.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || createMutation.isLoading}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                {createMutation.isLoading ? '등록 중...' : '업무 등록하기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCreatePage

import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { taskService } from '@/services'
import { Search, MapPin, Clock, Calendar, Star, User, Filter } from 'lucide-react'
import type { Task, TaskCategory } from '@/types'

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

const HelperDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  const { data: tasksData, isLoading } = useQuery(['tasks', selectedCategory], () =>
    taskService.getTasks({
      category: selectedCategory || undefined,
      status: 'WAITING',
      page: 1,
      page_size: 50,
    })
  )

  const tasks = tasksData?.tasks || []

  // 필터링
  const filteredTasks = tasks.filter((task) => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      return (
        task.title.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword) ||
        task.address.toLowerCase().includes(keyword)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">업무 찾기</h1>
        <p className="text-gray-600 mt-1">주변에서 도움이 필요한 곳을 찾아보세요</p>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="제목, 내용, 주소로 검색"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-gray-600" />
          <span className="font-medium text-gray-900">카테고리</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !selectedCategory
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 업무 목록 */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Link
              key={task.id}
              to={`/tasks/${task.id}`}
              className="block bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                      {categories.find((c) => c.value === task.category)?.icon}{' '}
                      {categories.find((c) => c.value === task.category)?.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-orange-600">
                    {task.amount.toLocaleString()}원
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{task.duration_minutes}분</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={18} />
                  <span>
                    {new Date(task.scheduled_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={18} />
                  <span>{task.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {task.requester_name || '구인자'}
                  </span>
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
            </Link>
          ))}

          {/* 업무 없음 */}
          {filteredTasks.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchKeyword || selectedCategory
                  ? '검색 결과가 없어요'
                  : '현재 등록된 업무가 없어요'}
              </h3>
              <p className="text-gray-600">
                다른 카테고리를 선택하거나 검색어를 변경해보세요
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HelperDashboard

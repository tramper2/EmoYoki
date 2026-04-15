import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { taskService } from '@/services'
import { Plus, Calendar, MapPin, Clock, User, Star, AlertCircle } from 'lucide-react'
import type { Task, TaskStatus } from '@/types'

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  WAITING: { label: '대기 중', className: 'bg-gray-100 text-gray-700' },
  MATCHED: { label: '매칭 완료', className: 'bg-blue-100 text-blue-700' },
  ONGOING: { label: '진행 중', className: 'bg-green-100 text-green-700' },
  COMPLETED: { label: '완료', className: 'bg-gray-100 text-gray-700' },
  CANCELLED: { label: '취소됨', className: 'bg-red-100 text-red-700' },
}

const UserDashboard = () => {
  const { data: tasksData, isLoading } = useQuery('my-tasks', () =>
    taskService.getTasks({ page: 1, page_size: 20 })
  )

  const tasks = tasksData?.tasks || []

  const ongoingTasks = tasks.filter(
    (task) => task.status === 'WAITING' || task.status === 'MATCHED' || task.status === 'ONGOING'
  )
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED')

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 업무</h1>
          <p className="text-gray-600 mt-1">요청하신 도움 현황을 확인하세요</p>
        </div>
        <Link
          to="/user/tasks/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors self-start"
        >
          <Plus size={20} />
          새 업무 요청
        </Link>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-gray-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {tasks.filter((t) => t.status === 'WAITING').length}
            </span>
          </div>
          <p className="text-sm text-gray-600">대기 중</p>
        </div>
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {tasks.filter((t) => t.status === 'MATCHED').length}
            </span>
          </div>
          <p className="text-sm text-gray-600">매칭 완료</p>
        </div>
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {tasks.filter((t) => t.status === 'ONGOING').length}
            </span>
          </div>
          <p className="text-sm text-gray-600">진행 중</p>
        </div>
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{completedTasks.length}</span>
          </div>
          <p className="text-sm text-gray-600">완료된 업무</p>
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 진행 중인 업무 */}
      {!isLoading && ongoingTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">진행 중인 업무</h2>
          <div className="space-y-4">
            {ongoingTasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">#{task.category}</span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[task.status].className}`}
                      >
                        {statusConfig[task.status].label}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      {task.amount.toLocaleString()}원
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={18} />
                    <span>
                      {new Date(task.scheduled_at).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={18} />
                    <span>{task.duration_minutes}분</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={18} />
                    <span>{task.address}</span>
                  </div>
                </div>

                {task.helper_name && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{task.helper_name}</p>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {task.helper_rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 완료된 업무 */}
      {!isLoading && completedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">완료된 업무</h2>
          <div className="space-y-4">
            {completedTasks.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block bg-white rounded-xl p-6 hover:shadow-md transition-shadow opacity-80"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(task.completed_at || '').toLocaleDateString('ko-KR')} 완료
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {task.amount.toLocaleString()}원
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 업무 없음 */}
      {!isLoading && tasks.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 요청한 업무가 없어요</h3>
          <p className="text-gray-600 mb-6">
            첫 업무를 요청해서 가까운 이모님과 연결되어보세요
          </p>
          <Link
            to="/user/tasks/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            첫 업무 요청하기
          </Link>
        </div>
      )}
    </div>
  )
}

export default UserDashboard

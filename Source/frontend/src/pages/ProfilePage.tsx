import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services'
import { User, MapPin, Phone, Calendar, Star, LogOut, Camera, Save } from 'lucide-react'

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    birth_year: user?.birth_year || '',
    bank_name: user?.bank_name || '',
    account_number: user?.account_number || '',
    account_holder: user?.account_holder || '',
  })

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const updatedUser = await authService.updateProfile({
        ...formData,
        birth_year: formData.birth_year ? parseInt(formData.birth_year) : undefined,
      })
      updateUser(updatedUser)
      setIsEditing(false)
      queryClient.invalidateQueries('me')
      alert('프로필이 저장되었습니다')
    } catch (err) {
      alert('저장에 실패했습니다')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
        <p className="text-gray-600 mt-1">내 정보를 관리하세요</p>
      </div>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <User size={40} className="text-orange-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">
                {user.role === 'USER' ? '구인자' : '이모님'}
                {user.tier === 'PREMIUM' && ' (프리미엄)'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{user.rating.toFixed(1)}</span>
                <span className="text-gray-600">
                  ({user.review_count}개의 리뷰)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Phone size={20} className="text-gray-400" />
            <span>{user.phone}</span>
          </div>

          {user.birth_year && (
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar size={20} className="text-gray-400" />
              <span>{user.birth_year}년생</span>
            </div>
          )}

          {user.base_location && (
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin size={20} className="text-gray-400" />
              <span>
                활동 반경: {user.preferred_radius ? `${user.preferred_radius / 1000}km` : '-'}
              </span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              완료한 업무: <span className="font-semibold text-gray-900">{user.completed_tasks}건</span>
            </p>
          </div>
        </div>
      </div>

      {/* 편집 폼 */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">프로필 수정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                한 줄 소개
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>

            {user.role === 'HELPER' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출생년도
                  </label>
                  <input
                    type="number"
                    value={formData.birth_year}
                    onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                    placeholder="1960"
                    min="1950"
                    max="2010"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">입금 계좌 정보</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        은행명
                      </label>
                      <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        placeholder="국민은행"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        계좌번호
                      </label>
                      <input
                        type="text"
                        value={formData.account_number}
                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                        placeholder="1234567890123"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        예금주
                      </label>
                      <input
                        type="text"
                        value={formData.account_holder}
                        onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                        placeholder="홍길동"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              저장하기
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          프로필 수정하기
        </button>
      )}

      {/* 로그아웃 */}
      <button
        onClick={logout}
        className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 flex items-center justify-center gap-2"
      >
        <LogOut size={20} />
        로그아웃
      </button>
    </div>
  )
}

export default ProfilePage

import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Hospital,
  Dog,
  Home as HomeIcon,
  ShoppingBag,
  Heart,
  Car,
  Users,
  Clock,
  Shield,
  MapPin,
  CheckCircle,
  Star,
  Crown,
  User,
  FlaskConical,
} from 'lucide-react'
import { useState } from 'react'

// 테스트 모드 (항상 활성화)
const TEST_MODE = true

const categories = [
  { icon: Hospital, name: '병원 동행', color: 'bg-red-100 text-red-600' },
  { icon: Dog, name: '강아지 산책', color: 'bg-orange-100 text-orange-600' },
  { icon: HomeIcon, name: '가사 보조', color: 'bg-blue-100 text-blue-600' },
  { icon: ShoppingBag, name: '심부름/쇼핑', color: 'bg-green-100 text-green-600' },
  { icon: Heart, name: '요양 보호', color: 'bg-pink-100 text-pink-600' },
  { icon: Car, name: '운행 대행', color: 'bg-purple-100 text-purple-600' },
]

const features = [
  {
    icon: MapPin,
    title: '내 주변 이모님 찾기',
    description: '현재 위치 기반으로 가까운 이모님을 빠르게 찾을 수 있어요',
  },
  {
    icon: Shield,
    title: '안전한 신원 확인',
    description: '휴대폰 본인 인증으로 검증된 신뢰할 수 있는 이모님만 만나요',
  },
  {
    icon: Star,
    title: '투명한 평점 시스템',
    description: '이전 이용자들의 평점과 리뷰를 통해 확인할 수 있어요',
  },
  {
    icon: Clock,
    title: '30분 단위 예약',
    description: '최소 30분부터 2시간까지 필요한 시간만큼만 예약하세요',
  },
]

const HomePage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // 빠른 로그인 함수
  const quickLogin = async (type: 'user' | 'premium' | 'helper') => {
    setIsLoading(type)
    try {
      let phone = ''
      if (type === 'user') {
        phone = '01000000001' // 구인자
      } else if (type === 'premium') {
        phone = '01000000201' // 프리미엄 이모님
      } else {
        phone = '01000000401' // 일반 이모님
      }

      await login(phone, 'test1234')

      // 역할에 따라 리다이렉트
      setTimeout(() => {
        if (type === 'user') {
          navigate('/user/dashboard')
        } else {
          navigate('/helper/dashboard')
        }
      }, 100)
    } catch (error) {
      console.error('Login failed:', error)
      alert('로그인에 실패했습니다.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-12">
      {/* 테스트 모드 알림 */}
      {TEST_MODE && (
        <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-4 flex items-center gap-3">
          <FlaskConical size={24} className="text-purple-600" />
          <div className="flex-1">
            <p className="font-semibold text-purple-900">테스트 모드</p>
            <p className="text-sm text-purple-700">아래 버튼을 클릭하여 바로 로그인하세요 (비밀번호: test1234)</p>
          </div>
        </div>
      )}

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-8 md:p-12 text-white">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            우리 동네 믿음직한 손길이 필요할 때
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            이모~여기!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              도움 요청하기
              <CheckCircle size={20} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-xl font-semibold hover:bg-orange-800 transition-colors border-2 border-white/20"
            >
              이모님으로 시작하기
              <Users size={20} />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </section>

      {/* 빠른 로그인 섹션 (테스트 모드) */}
      {TEST_MODE && (
        <section className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">🧪 빠른 로그인 (테스트)</h2>
            <p className="opacity-90">버튼을 클릭하여 바로 시작하세요</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {/* 구인자 */}
            <button
              onClick={() => quickLogin('user')}
              disabled={isLoading !== null}
              className="p-6 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">구인자</h3>
                  <p className="text-sm opacity-80">도움을 요청해요</p>
                </div>
              </div>
              <div className="text-sm bg-black/20 rounded-lg p-2 font-mono">
                01000000001
              </div>
              {isLoading === 'user' && (
                <div className="mt-3 text-center text-sm">로그인 중...</div>
              )}
            </button>

            {/* 프리미엄 이모님 */}
            <button
              onClick={() => quickLogin('premium')}
              disabled={isLoading !== null}
              className="p-6 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-colors text-left relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                프리미엄
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">프리미엄 이모님</h3>
                  <p className="text-sm opacity-80">우선 알림 받아요</p>
                </div>
              </div>
              <div className="text-sm bg-black/20 rounded-lg p-2 font-mono">
                01000000201
              </div>
              {isLoading === 'premium' && (
                <div className="mt-3 text-center text-sm">로그인 중...</div>
              )}
            </button>

            {/* 일반 이모님 */}
            <button
              onClick={() => quickLogin('helper')}
              disabled={isLoading !== null}
              className="p-6 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">일반 이모님</h3>
                  <p className="text-sm opacity-80">도움을 드려요</p>
                </div>
              </div>
              <div className="text-sm bg-black/20 rounded-lg p-2 font-mono">
                01000000401
              </div>
              {isLoading === 'helper' && (
                <div className="mt-3 text-center text-sm">로그인 중...</div>
              )}
            </button>
          </div>
          <p className="text-center text-sm mt-4 opacity-75">
            모든 계정의 비밀번호는 <span className="font-mono font-bold">test1234</span>입니다
          </p>
        </section>
      )}

      {/* 카테고리 섹션 */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">어떤 도움이 필요하신가요?</h2>
          <p className="text-gray-600">다양한 카테고리의 도움을 받을 수 있어요</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.name}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${category.color}`}>
                  <Icon size={32} />
                </div>
                <span className="font-medium text-gray-900 text-center">{category.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="bg-white rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">왜 이모~여기! 인가요?</h2>
          <p className="text-gray-600">중장년층을 위해 특별히 준비된 서비스</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex gap-4 p-6 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Icon size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">지금 바로 시작해보세요</h2>
        <p className="text-gray-300 mb-6 text-lg">
          회원가입은 1분이면 충분합니다
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/test"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors text-lg"
          >
            <FlaskConical size={20} />
            테스트 페이지
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors text-lg"
          >
            무료로 회원가입
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage

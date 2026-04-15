import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Home,
  User,
  Briefcase,
  LogOut,
  Menu,
  X,
  ChevronRight,
  FlaskConical,
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || true // 개발 중엔 항상 표시

const Layout = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: '홈', href: '/', icon: Home },
    ...(TEST_MODE ? [{ name: '테스트', href: '/test', icon: FlaskConical }] : []),
    ...(isAuthenticated && user?.role === 'USER'
      ? [{ name: '내 업무', href: '/user/dashboard', icon: Briefcase }]
      : []),
    ...(isAuthenticated && user?.role === 'HELPER'
      ? [{ name: '업무 찾기', href: '/helper/dashboard', icon: Briefcase }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {TEST_MODE && (
          <div className="bg-purple-600 text-white text-xs font-medium text-center py-1">
            🔧 테스트 모드 - 인증 절차 우회
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TEST_MODE ? 'bg-purple-500' : 'bg-orange-500'}`}>
                <span className="text-white font-bold text-lg">이모</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                이모~여기!
                {TEST_MODE && <span className="text-purple-600 ml-1">(테스트)</span>}
              </span>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                const isTest = item.name === '테스트'
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                      isTest
                        ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                        : isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* 우측 메뉴 */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-orange-600" />
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    title="로그아웃"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                const isTest = item.name === '테스트'
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-medium',
                      isTest
                        ? 'bg-purple-50 text-purple-600'
                        : isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon size={20} />
                    {item.name}
                    <ChevronRight size={18} className="ml-auto" />
                  </Link>
                )
              })}

              <div className="border-t border-gray-200 pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <User size={20} />
                      프로필
                      <ChevronRight size={18} className="ml-auto" />
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={20} />
                      로그아웃
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full px-4 py-3 rounded-lg font-medium text-center text-gray-700 hover:bg-gray-100"
                    >
                      로그인
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full px-4 py-3 rounded-lg font-medium text-center bg-orange-500 text-white hover:bg-orange-600"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="font-medium">이모~여기!</p>
            <p className="text-sm mt-2">우리 동네 믿음직한 손길이 필요할 때, 이모~여기!</p>
            <p className="text-sm mt-4 text-gray-500">© 2024 이모~여기!. All rights reserved.</p>
            {TEST_MODE && (
              <p className="text-xs text-purple-600 mt-2">테스트 모드 - 개발 환경</p>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout

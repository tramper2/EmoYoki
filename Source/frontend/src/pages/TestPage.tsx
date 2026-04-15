import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import {
  FlaskConical,
  Users,
  Database,
  RefreshCw,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

const TestPage = () => {
  const navigate = useNavigate()
  const { login, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [testAccounts, setTestAccounts] = useState<any>(null)
  const [createdUser, setCreatedUser] = useState<any>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCreateUser = async (role: 'USER' | 'HELPER') => {
    setIsLoading(true)
    try {
      const response = await api.post('/test/create-user', { role })
      const data = response.data

      setCreatedUser(data.user)

      // 자동 로그인
      await login(data.user.phone, 'test1234')

      showMessage('success', `${role === 'USER' ? '구인자' : '이모님'} 계정이 생성되었습니다!`)

      // 역할에 따라 리다이렉트
      setTimeout(() => {
        if (role === 'USER') {
          navigate('/user/dashboard')
        } else {
          navigate('/helper/dashboard')
        }
      }, 1000)
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || '계정 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedData = async () => {
    setIsLoading(true)
    try {
      const response = await api.post('/test/seed-data')
      setTestAccounts(response.data.users)
      showMessage('success', '테스트 데이터가 생성되었습니다!')
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || '데이터 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAccounts = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/test/accounts')
      setTestAccounts(response.data)
    } catch (error: any) {
      showMessage('error', '계정 목록을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('모든 테스트 데이터를 삭제하시겠습니까?')) return

    setIsLoading(true)
    try {
      await api.post('/test/reset')
      setTestAccounts(null)
      setCreatedUser(null)
      logout()
      showMessage('success', '테스트 데이터가 초기화되었습니다')
    } catch (error: any) {
      showMessage('error', '초기화에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (phone: string, password: string = 'test1234') => {
    setIsLoading(true)
    try {
      await login(phone, password)
      showMessage('success', '로그인되었습니다!')

      // 역할에 따라 리다이렉트
      setTimeout(() => {
        if (phone === '01000000001') {
          navigate('/user/dashboard')
        } else {
          navigate('/helper/dashboard')
        }
      }, 500)
    } catch (error: any) {
      showMessage('error', '로그인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical size={32} />
          <h1 className="text-2xl font-bold">테스트 페이지</h1>
        </div>
        <p className="opacity-90">개발 모드 전용 테스트 도구</p>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* 생성된 사용자 정보 */}
      {createdUser && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">생성된 계정</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">이름:</span>
              <span className="font-medium">{createdUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">전화번호:</span>
              <span className="font-mono">{createdUser.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">비밀번호:</span>
              <span className="font-mono">{createdUser.password}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">역할:</span>
              <span className="font-medium">
                {createdUser.role === 'USER' ? '구인자' : '이모님'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 테스트 계정 생성 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} />
          테스트 계정 생성
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => handleCreateUser('USER')}
            disabled={isLoading}
            className="p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">구</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">구인자 계정</h3>
                <p className="text-sm text-gray-600">도움을 요청하는 계정</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleCreateUser('HELPER')}
            disabled={isLoading}
            className="p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">이</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">이모님 계정</h3>
                <p className="text-sm text-gray-600">도움을 제공하는 계정</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 테스트 데이터 관리 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database size={20} />
          테스트 데이터 관리
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          <button
            onClick={handleSeedData}
            disabled={isLoading}
            className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center"
          >
            <RefreshCw size={20} className="mx-auto mb-2 text-green-600" />
            <span className="font-medium text-gray-900">데이터 생성</span>
            <p className="text-sm text-gray-600 mt-1">더미 데이터 10개</p>
          </button>

          <button
            onClick={handleGetAccounts}
            disabled={isLoading}
            className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
          >
            <Users size={20} className="mx-auto mb-2 text-blue-600" />
            <span className="font-medium text-gray-900">계정 목록</span>
            <p className="text-sm text-gray-600 mt-1">테스트 계정 조회</p>
          </button>

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-center"
          >
            <Trash2 size={20} className="mx-auto mb-2 text-red-600" />
            <span className="font-medium text-gray-900">데이터 초기화</span>
            <p className="text-sm text-gray-600 mt-1">모든 테스트 데이터 삭제</p>
          </button>
        </div>
      </div>

      {/* 테스트 계정 목록 */}
      {testAccounts && testAccounts.accounts && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            테스트 계정 목록
          </h2>
          <div className="space-y-3">
            {testAccounts.accounts.map((account: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      account.type.includes('이모') ? 'bg-orange-100' : 'bg-blue-100'
                    }`}
                  >
                    <span className={`font-semibold ${account.type.includes('이모') ? 'text-orange-600' : 'text-blue-600'}`}>
                      {account.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-600">{account.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => quickLogin(account.phone)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  빠른 로그인
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 안내 */}
      <div className="bg-yellow-50 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-900 mb-2">테스트 모드 안내</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• 모든 테스트 계정의 비밀번호는 <span className="font-mono font-bold">test1234</span>입니다</li>
          <li>• 인증 절차가 우회되어 즉시 가입 가능합니다</li>
          <li>• 생성된 계정으로 실제 서비스와 동일하게 테스트할 수 있습니다</li>
          <li>• 테스트 데이터는 언제든지 초기화할 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
}

export default TestPage

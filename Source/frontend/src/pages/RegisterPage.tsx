import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Phone, Lock, User, CheckCircle, AlertCircle } from 'lucide-react'

const USER_ROLE = 'USER' // 구인자
const HELPER_ROLE = 'HELPER' // 이모님

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<typeof USER_ROLE | typeof HELPER_ROLE | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 인증
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [sentCode, setSentCode] = useState('') // 개발용

  // 기본 정보
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 이모님 정보
  const [tier, setTier] = useState<'NORMAL' | 'PREMIUM'>('NORMAL')
  const [birthYear, setBirthYear] = useState('')

  // 약관 동의
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)

  const handleSendCode = async () => {
    try {
      const { authService } = await import('@/services')
      const result = await authService.sendVerificationCode(phone)
      setSentCode(result.code) // 개발용 - 실제로는 제거
      setCodeSent(true)
      setError('')
    } catch (err: any) {
      setError('인증 코드 발송에 실패했습니다')
    }
  }

  const handleVerifyCode = () => {
    if (verificationCode === sentCode) {
      setIsVerified(true)
      setStep(2)
    } else {
      setError('인증 코드가 올바르지 않습니다')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    // 약관 동의 확인
    if (!termsAgreed || !privacyAgreed) {
      setError('필수 약관에 동의해주세요')
      return
    }

    setIsLoading(true)

    try {
      await register({
        phone,
        password,
        name,
        role: role!,
        verification_code: verificationCode,
        tier: role === HELPER_ROLE ? tier : undefined,
        birth_year: birthYear ? parseInt(birthYear) : undefined,
        terms_agreed: termsAgreed,
        privacy_agreed: privacyAgreed,
        service_agreed: true,
      })

      // 역할에 따라 리다이렉트
      const user = useAuthStore.getState().user
      if (user?.role === 'HELPER') {
        navigate('/helper/dashboard')
      } else {
        navigate('/user/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '회원가입에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-600 font-bold text-2xl">이모</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-gray-600 mt-2">
            {step === 1 && '휴대폰 번호로 본인 인증을 진행합니다'}
            {step === 2 && '기본 정보를 입력해주세요'}
            {step === 3 && '마지막으로 약관 동의가 필요합니다'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: 역할 선택 & 인증 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                가입 유형을 선택하세요
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole(USER_ROLE)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    role === USER_ROLE
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User size={32} className={`mx-auto mb-2 ${role === USER_ROLE ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${role === USER_ROLE ? 'text-orange-700' : 'text-gray-700'}`}>
                    도움 요청
                  </span>
                  <p className={`text-sm mt-1 ${role === USER_ROLE ? 'text-orange-600' : 'text-gray-500'}`}>
                    이모님을 찾아요
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(HELPER_ROLE)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    role === HELPER_ROLE
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle size={32} className={`mx-auto mb-2 ${role === HELPER_ROLE ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${role === HELPER_ROLE ? 'text-orange-700' : 'text-gray-700'}`}>
                    이모님
                  </span>
                  <p className={`text-sm mt-1 ${role === HELPER_ROLE ? 'text-orange-600' : 'text-gray-500'}`}>
                    도움을 드려요
                  </p>
                </button>
              </div>
            </div>

            {role && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    휴대폰 번호
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01012345678"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={!phone || codeSent}
                      className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {codeSent ? '재발송' : '인증'}
                    </button>
                  </div>
                </div>

                {codeSent && (
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                      인증 코드
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="6자리 코드"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        maxLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={!verificationCode}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        확인
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      개발용 인증 코드: <span className="font-mono font-bold">{sentCode}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: 기본 정보 */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 (8자 이상, 대문자/소문자/숫자 포함)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            {role === HELPER_ROLE && (
              <>
                <div>
                  <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-2">
                    출생년도
                  </label>
                  <input
                    id="birthYear"
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="1960"
                    min="1950"
                    max="2010"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    회원 등급
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTier('NORMAL')}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        tier === 'NORMAL'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`font-medium ${tier === 'NORMAL' ? 'text-orange-700' : 'text-gray-700'}`}>
                        일반 회원
                      </span>
                      <p className={`text-sm mt-1 ${tier === 'NORMAL' ? 'text-orange-600' : 'text-gray-500'}`}>
                        무료
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTier('PREMIUM')}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        tier === 'PREMIUM'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`font-medium ${tier === 'PREMIUM' ? 'text-orange-700' : 'text-gray-700'}`}>
                        프리미엄 회원
                      </span>
                      <p className={`text-sm mt-1 ${tier === 'PREMIUM' ? 'text-orange-600' : 'text-gray-500'}`}>
                        유료 (우선 알림)
                      </p>
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              다음
            </button>
          </form>
        )}

        {/* Step 3: 약관 동의 */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-orange-600 rounded"
                  required
                />
                <div>
                  <span className="font-medium text-gray-900">이용약관 동의 (필수)</span>
                  <p className="text-sm text-gray-600 mt-1">
                    서비스 이용을 위한 약관에 동의합니다
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-orange-600 rounded"
                  required
                />
                <div>
                  <span className="font-medium text-gray-900">개인정보 처리방침 동의 (필수)</span>
                  <p className="text-sm text-gray-600 mt-1">
                    개인정보 수집 및 이용에 동의합니다
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? '가입 중...' : '가입 완료'}
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 text-gray-600 font-medium hover:text-gray-900"
            >
              이전
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-orange-600 font-semibold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

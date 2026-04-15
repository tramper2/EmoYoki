import api from './api'
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '@/types'

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/auth/register', data)
    return response.data
  },

  async sendVerificationCode(phone: string): Promise<{ code: string }> {
    const response = await api.post<{ code: string }>('/auth/verify/send', { phone })
    return response.data
  },

  async confirmVerification(phone: string, code: string): Promise<void> {
    await api.post('/auth/verify/confirm', { phone, code })
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/me/profile', data)
    return response.data
  },
}

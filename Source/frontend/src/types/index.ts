// 공통 타입 정의

export type UserRole = 'USER' | 'HELPER' | 'ADMIN'
export type UserTier = 'NORMAL' | 'PREMIUM'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN'

export type TaskCategory =
  | 'HOSPITAL'
  | 'DOG_WALK'
  | 'CLEANING'
  | 'SHOPPING'
  | 'CAREGIVING'
  | 'PET_CARE'
  | 'DRIVING'
  | 'EVENT_HELPER'
  | 'ERRAND'
  | 'OTHER'

export type TaskStatus = 'WAITING' | 'MATCHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export interface User {
  id: string
  phone: string
  name: string
  role: UserRole
  tier?: UserTier
  status: UserStatus
  is_verified: boolean
  profile_image?: string
  bio?: string
  birth_year?: number
  rating: number
  review_count: number
  completed_tasks: number
  base_location?: string
  preferred_radius?: number
  created_at: string
  last_login_at?: string
}

export interface Task {
  id: string
  requester_id: string
  helper_id?: string
  category: TaskCategory
  status: TaskStatus
  title: string
  description?: string
  lat: number
  lng: number
  address: string
  detail_address?: string
  building_name?: string
  scheduled_at: string
  duration_minutes: number
  amount: number
  is_deposit_paid: boolean
  matched_at?: string
  helper_arrived_at?: string
  completed_at?: string
  completion_photo?: string
  completion_note?: string
  confirmed_by_requester: boolean
  requester_name?: string
  requester_rating?: number
  helper_name?: string
  helper_rating?: number
  helper_profile_image?: string
  created_at: string
  updated_at: string
}

export interface HelperApplication {
  id: string
  task_id: string
  helper_id: string
  status: string
  message?: string
  created_at: string
  helper_name?: string
  helper_rating?: number
  helper_profile_image?: string
  helper_completed_tasks?: number
}

export interface Review {
  id: string
  task_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  tags?: string[]
  created_at: string
  reviewer_name?: string
  reviewee_name?: string
}

// API 요청/응답 타입
export interface LoginRequest {
  phone: string
  password: string
}

export interface RegisterRequest {
  phone: string
  password: string
  name: string
  role: UserRole
  verification_code: string
  tier?: UserTier
  birth_year?: number
  terms_agreed: boolean
  privacy_agreed: boolean
  service_agreed: boolean
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface TaskCreateRequest {
  category: TaskCategory
  title: string
  description?: string
  lat: number
  lng: number
  address: string
  detail_address?: string
  building_name?: string
  scheduled_at: string
  duration_minutes: number
  amount: number
  requirements?: Record<string, unknown>
}

export interface Location {
  lat: number
  lng: string
  address: string
  buildingName?: string
}

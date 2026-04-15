import api from './api'
import type {
  Task,
  TaskCreateRequest,
  TaskListResponse,
  HelperApplication,
  Location,
} from '@/types'

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  page_size: number
}

export const taskService = {
  async createTask(data: TaskCreateRequest): Promise<Task> {
    const response = await api.post<Task>('/tasks', data)
    return response.data
  },

  async getTasks(params?: {
    category?: string
    status?: string
    page?: number
    page_size?: number
  }): Promise<TaskListResponse> {
    const response = await api.get<TaskListResponse>('/tasks', { params })
    return response.data
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`)
    return response.data
  },

  async applyToTask(taskId: string, message?: string): Promise<HelperApplication> {
    const response = await api.post<HelperApplication>(`/tasks/${taskId}/apply`, { message })
    return response.data
  },

  async acceptApplication(applicationId: string): Promise<Task> {
    const response = await api.post<Task>(`/tasks/applications/${applicationId}/accept`)
    return response.data
  },

  async submitCompletion(taskId: string, photoUrl: string, note?: string): Promise<Task> {
    const response = await api.post<Task>(`/tasks/${taskId}/complete`, {
      completion_photo: photoUrl,
      completion_note: note,
    })
    return response.data
  },

  async confirmCompletion(taskId: string, confirmed: boolean): Promise<Task> {
    const response = await api.post<Task>(`/tasks/${taskId}/confirm`, { confirmed })
    return response.data
  },

  // 카카오맵 주소 검색
  async searchAddress(keyword: string): Promise<Location[]> {
    if (!window.kakao || !window.kakao.maps) {
      return []
    }

    const geocoder = new window.kakao.maps.services.Geocoder()

    return new Promise((resolve) => {
      geocoder.addressSearch(keyword, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const locations = result.map((item: any) => ({
            lat: item.y,
            lng: item.x,
            address: item.address.address_name,
            buildingName: item.road_address?.building_name || '',
          }))
          resolve(locations)
        } else {
          resolve([])
        }
      })
    })
  },
}

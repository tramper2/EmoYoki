import { useEffect, useRef, useState } from 'react'
import type { Location } from '@/types'

interface KakaoMapProps {
  center?: { lat: number; lng: number }
  markers?: Array<{ lat: number; lng: number; label?: string }>
  circles?: Array<{ center: { lat: number; lng: number }; radius: number; color?: string }>
  onClick?: (location: Location) => void
  className?: string
  height?: string
}

declare global {
  interface Window {
    kakao: any
  }
}

const KakaoMap = ({
  center = { lat: 37.5665, lng: 126.9780 },
  markers = [],
  circles = [],
  onClick,
  className = '',
  height = '400px',
}: KakaoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markersRef, setMarkersRef] = useState<any[]>([])
  const [circlesRef, setCirclesRef] = useState<any[]>([])

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('Kakao Maps SDK가 로드되지 않았습니다.')
      return
    }

    // 지도 생성
    const container = mapRef.current
    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: 3,
    }

    const newMap = new window.kakao.maps.Map(container, options)
    setMap(newMap)
  }, [])

  // 마커 업데이트
  useEffect(() => {
    if (!map) return

    // 기존 마커 제거
    markersRef.forEach((marker) => marker.setMap(null))

    // 새 마커 추가
    const newMarkers = markers.map((markerData) => {
      const position = new window.kakao.maps.LatLng(markerData.lat, markerData.lng)
      const marker = new window.kakao.maps.Marker({
        position,
        label: markerData.label,
      })
      marker.setMap(map)
      return marker
    })

    setMarkersRef(newMarkers)
  }, [map, markers])

  // 원 업데이트
  useEffect(() => {
    if (!map) return

    // 기존 원 제거
    circlesRef.forEach((circle) => circle.setMap(null))

    // 새 원 추가
    const newCircles = circles.map((circleData) => {
      const position = new window.kakao.maps.LatLng(
        circleData.center.lat,
        circleData.center.lng
      )
      const circle = new window.kakao.maps.Circle({
        center: position,
        radius: circleData.radius,
        strokeWeight: 2,
        strokeColor: circleData.color || '#FF8C00',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
        fillColor: circleData.color || '#FF8C00',
        fillOpacity: 0.2,
      })
      circle.setMap(map)
      return circle
    })

    setCirclesRef(newCircles)
  }, [map, circles])

  // 클릭 이벤트
  useEffect(() => {
    if (!map || !onClick) return

    const clickListener = map.addListener('click', (mouseEvent: any) => {
      const latlng = mouseEvent.latLng
      onClick({
        lat: latlng.getLat(),
        lng: latlng.getLng(),
        address: '',
      })
    })

    return () => {
      window.kakao.maps.event.removeListener(clickListener)
    }
  }, [map, onClick])

  // 중심 이동
  useEffect(() => {
    if (!map) return
    const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng)
    map.panTo(moveLatLon)
  }, [map, center.lat, center.lng])

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden shadow-sm ${className}`}
      style={{ width: '100%', height }}
    />
  )
}

export default KakaoMap

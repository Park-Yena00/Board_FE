import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/metrics'
// import { metricsApi } from '../services/metricsApi' // 백엔드 메트릭 엔드포인트 추가 시 활성화

// 메트릭 배치 전송을 위한 인터벌 (5초마다)
// const METRICS_FLUSH_INTERVAL = 5000

export const useMetrics = () => {
  const location = useLocation()

  useEffect(() => {
    // Track page view (로컬 수집)
    trackPageView(location.pathname)

    // 백엔드에 메트릭 엔드포인트가 추가되면 아래 주석을 해제
    // 즉시 페이지뷰 메트릭 전송
    // metricsApi.sendMetric({
    //   metricName: 'http_requests_total',
    //   value: 1,
    //   labels: {
    //     method: 'GET',
    //     path: location.pathname,
    //     status: '200',
    //   },
    //   timestamp: new Date().toISOString(),
    // })
  }, [location.pathname])

  // 백엔드에 메트릭 엔드포인트가 추가되면 아래 주석을 해제
  // useEffect(() => {
  //   // 주기적으로 메트릭 배치 전송
  //   flushIntervalRef.current = setInterval(() => {
  //     metricsApi.flushMetrics()
  //   }, METRICS_FLUSH_INTERVAL)

  //   // 컴포넌트 언마운트 시 정리
  //   return () => {
  //     if (flushIntervalRef.current) {
  //       clearInterval(flushIntervalRef.current)
  //     }
  //     // 마지막 메트릭 전송
  //     metricsApi.flushMetrics()
  //   }
  // }, [])
}


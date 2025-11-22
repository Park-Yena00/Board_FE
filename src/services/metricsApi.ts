import axios from 'axios'
import { metricsCollector } from '../utils/metrics'

// 백엔드 API 기본 URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.moodie.shop'

const metricsClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
})

// 메트릭 데이터 전송 인터페이스
export interface MetricData {
  metricName: string
  value: number
  labels?: Record<string, string>
  timestamp?: string
}

export interface MetricsBatchRequest {
  metrics: MetricData[]
}

// 메트릭 전송 API
export const metricsApi = {
  // 단일 메트릭 전송
  sendMetric: async (metric: MetricData): Promise<void> => {
    try {
      // Swagger에서 확인한 실제 엔드포인트로 수정 필요
      // 예: POST /api/metrics
      await metricsClient.post('/api/metrics', metric)
    } catch (error) {
      console.error('Failed to send metric:', error)
      // 실패해도 앱 동작에는 영향 없음
    }
  },

  // 배치 메트릭 전송
  sendMetricsBatch: async (metrics: MetricData[]): Promise<void> => {
    try {
      // Swagger에서 확인한 실제 엔드포인트로 수정 필요
      // 예: POST /api/metrics/batch
      await metricsClient.post('/api/metrics/batch', { metrics })
    } catch (error) {
      console.error('Failed to send metrics batch:', error)
    }
  },

  // 수집된 메트릭을 백엔드로 전송
  flushMetrics: async (): Promise<void> => {
    try {
      const metrics: MetricData[] = []
      const timestamp = new Date().toISOString()

      // metricsCollector에서 메트릭 추출
      // getPrometheusFormat()을 파싱하여 구조화된 메트릭으로 변환
      const prometheusFormat = metricsCollector.getPrometheusFormat()
      
      if (!prometheusFormat || prometheusFormat.trim() === '') {
        return // 전송할 메트릭이 없음
      }

      // Prometheus 형식을 파싱하여 MetricData로 변환
      const lines = prometheusFormat.split('\n')
      let currentMetric: Partial<MetricData> | null = null

      for (const line of lines) {
        if (line.startsWith('# TYPE')) {
          // 타입 정의 라인 무시
          continue
        }
        
        if (line.trim() === '') {
          continue
        }

        // 메트릭 라인 파싱: metric_name{label1="value1",label2="value2"} value
        const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\{(.+)\})?\s+(\d+\.?\d*)$/)
        if (match) {
          const [, name, labelsStr, value] = match
          const labels: Record<string, string> = {}

          // 라벨 파싱
          if (labelsStr) {
            labelsStr.split(',').forEach((pair) => {
              const labelMatch = pair.match(/(\w+)="([^"]+)"/)
              if (labelMatch) {
                const [, key, val] = labelMatch
                labels[key] = val
              }
            })
          }

          metrics.push({
            metricName: name,
            value: parseFloat(value),
            labels: Object.keys(labels).length > 0 ? labels : undefined,
            timestamp,
          })
        }
      }

      // 메트릭이 있으면 전송
      if (metrics.length > 0) {
        await metricsApi.sendMetricsBatch(metrics)
        // 전송 성공 후 메트릭 초기화
        metricsCollector.reset()
      }
    } catch (error) {
      console.error('Failed to flush metrics:', error)
    }
  },
}


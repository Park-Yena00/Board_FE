// Prometheus metrics collection utility
// This can be extended to send metrics to Prometheus endpoint

export interface Metric {
  name: string
  value: number
  labels?: Record<string, string>
}

class MetricsCollector {
  private metrics: Map<string, number> = new Map()
  private counters: Map<string, number> = new Map()

  // Increment a counter metric
  incrementCounter(name: string, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + 1)
  }

  // Set a gauge metric
  setGauge(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels)
    this.metrics.set(key, value)
  }

  // Get metrics in Prometheus format
  getPrometheusFormat(): string {
    const lines: string[] = []
    
    // Counter metrics
    this.counters.forEach((value, key) => {
      const { name, labels } = this.parseMetricKey(key)
      const labelStr = labels ? this.formatLabels(labels) : ''
      lines.push(`# TYPE ${name} counter`)
      lines.push(`${name}${labelStr} ${value}`)
    })

    // Gauge metrics
    this.metrics.forEach((value, key) => {
      const { name, labels } = this.parseMetricKey(key)
      const labelStr = labels ? this.formatLabels(labels) : ''
      lines.push(`# TYPE ${name} gauge`)
      lines.push(`${name}${labelStr} ${value}`)
    })

    return lines.join('\n')
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',')
    return `${name}{${labelStr}}`
  }

  private parseMetricKey(key: string): { name: string; labels?: Record<string, string> } {
    const match = key.match(/^([^{]+)(?:\{(.+)\})?$/)
    if (!match) {
      return { name: key }
    }

    const name = match[1]
    const labelsStr = match[2]
    
    if (!labelsStr) {
      return { name }
    }

    const labels: Record<string, string> = {}
    labelsStr.split(',').forEach((pair) => {
      const [k, v] = pair.split('=')
      if (k && v) {
        labels[k.trim()] = v.trim()
      }
    })

    return { name, labels }
  }

  private formatLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
    return `{${entries.join(',')}}`
  }

  // Reset all metrics
  reset() {
    this.metrics.clear()
    this.counters.clear()
  }
}

export const metricsCollector = new MetricsCollector()

// Track page views
export const trackPageView = (path: string) => {
  metricsCollector.incrementCounter('http_requests_total', {
    method: 'GET',
    path,
    status: '200',
  })
}

// Track API calls
export const trackApiCall = (endpoint: string, method: string, status: number) => {
  metricsCollector.incrementCounter('api_requests_total', {
    method,
    endpoint,
    status: status.toString(),
  })
}

// Track errors
export const trackError = (errorType: string, component: string) => {
  metricsCollector.incrementCounter('errors_total', {
    type: errorType,
    component,
  })
}


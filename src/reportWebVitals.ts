import {getCLS, getFID, getLCP, getFCP, getTTFB, Metric} from 'web-vitals'

type ReportHandler = (metric: Metric) => void

async function sendToEndpoint(url: string, metric: Metric) {
  const body = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
  }
  const payload = JSON.stringify(body)

  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try {
      const blob = new Blob([payload], {type: 'application/json'})
      navigator.sendBeacon(url, blob)
      return
    } catch (e) {
      // fall through to fetch
    }
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      // `keepalive` allows the request to outlive the page unload
      keepalive: true,
    })
  } catch (e) {
    // swallow errors — reporting should not break the app
  }
}

export default function reportWebVitals(onPerfEntry?: ReportHandler | string) {
  const handler: ReportHandler = typeof onPerfEntry === 'string'
    ? (metric) => { void sendToEndpoint(onPerfEntry, metric) }
    : (onPerfEntry as ReportHandler) ?? ((metric) => { console.log(metric) })

  getCLS(handler)
  getFID(handler)
  getLCP(handler)
  getFCP(handler)
  getTTFB(handler)
}

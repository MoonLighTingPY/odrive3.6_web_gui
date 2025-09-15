export async function listDevices() {
  const res = await fetch('/api/devices')
  if (!res.ok) throw new Error(`listDevices failed: ${res.status}`)
  return res.json()
}

export async function getDeviceApiMetadata(serial, section) {
  const q = section ? `?section=${encodeURIComponent(section)}` : ''
  const res = await fetch(`/api/devices/${encodeURIComponent(serial)}/api-metadata${q}`)
  if (!res.ok) throw new Error(`getDeviceApiMetadata failed: ${res.status}`)
  return res.json()
}
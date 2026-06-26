// Bulk preset operations: export all user presets as a ZIP, import from file.

import JSZip from 'jszip'
import { exportPreset, importPreset, savePreset } from './presetsManager'

/** Trigger a browser download of a Blob. */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Export the given presets as a single ZIP of individual JSON files. */
export async function exportPresetsAsZip(presets) {
  const zip = new JSZip()
  for (const preset of presets) {
    const safe = preset.name.replace(/[^\w-]+/g, '_')
    zip.file(`${safe}.odrivepreset.json`, exportPreset(preset))
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const date = new Date().toISOString().slice(0, 10)
  downloadBlob(blob, `odrive_presets_${date}.zip`)
}

/** Read a preset file (JSON) and save it. Returns the imported preset. */
export async function importPresetFromFile(file) {
  const text = await file.text()
  const preset = importPreset(text)
  savePreset(preset)
  return preset
}

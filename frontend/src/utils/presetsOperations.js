import JSZip from 'jszip'
import { importPresetsFromFile } from './presetsManager'

/**
 * Export all user presets as a ZIP file
 * @param {Object} presets - All available presets
 * @param {Function} toast - Toast notification function
 * @returns {Promise<void>}
 */
export const exportPresetsAsZip = async (presets, toast) => {
  try {
    const zip = new JSZip()
    const userPresets = Object.entries(presets).filter(([name]) => !name.startsWith('factory_'))

    if (userPresets.length === 0) {
      toast({
        title: 'No user presets to export',
        description: 'Only user presets can be exported',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    // Add each preset as a separate JSON file
    userPresets.forEach(([name, preset]) => {
      const presetData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          odriveVersion: '0.5.6',
          guiVersion: '1.0.0',
          presetName: name
        },
        preset: preset
      }
      zip.file(`${name}.json`, JSON.stringify(presetData, null, 2))
    })

    // Also create a combined file with all presets
    const allPresetsData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        odriveVersion: '0.5.6',
        guiVersion: '1.0.0',
        presetCount: userPresets.length
      },
      presets: Object.fromEntries(userPresets)
    }
    zip.file('all_presets.json', JSON.stringify(allPresetsData, null, 2))

    // Generate ZIP file and download
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url

    const timestamp = new Date().toISOString().split('T')[0]
    link.download = `odrive_presets_${timestamp}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Export complete',
      description: `${userPresets.length} presets exported as ZIP`,
      status: 'success',
      duration: 3000,
    })
  } catch (error) {
    toast({
      title: 'Export failed',
      description: error.message,
      status: 'error',
      duration: 3000,
    })
    throw error
  }
}

/**
 * Import presets from a JSON file
 * @param {File} file - JSON file to import
 * @param {Function} toast - Toast notification function
 * @returns {Promise<void>}
 */
export const importJsonPresets = async (file, toast) => {
  const results = await importPresetsFromFile(file, false)

  let resultMessage = `Imported: ${results.imported}`
  if (results.skipped > 0) {
    resultMessage += `, Skipped: ${results.skipped} (already exist)`
  }
  if (results.errors.length > 0) {
    resultMessage += `, Errors: ${results.errors.length}`
  }

  toast({
    title: 'Import complete',
    description: resultMessage,
    status: results.errors.length > 0 ? 'warning' : 'success',
    duration: 5000,
  })
}

/**
 * Import presets from a ZIP file
 * @param {File} file - ZIP file to import
 * @param {Function} toast - Toast notification function
 * @returns {Promise<void>}
 */
export const importZipPresets = async (file, toast) => {
  const zip = new JSZip()
  const contents = await zip.loadAsync(file)

  let imported = 0
  let skipped = 0
  let errors = []

  // Process each file in the ZIP
  for (const [filename, fileObj] of Object.entries(contents.files)) {
    if (filename.endsWith('.json') && !fileObj.dir) {
      try {
        const content = await fileObj.async('text')
        const data = JSON.parse(content)

        // Handle both single preset format and multi-preset format
        if (data.preset) {
          // Single preset format
          const presetName = data.preset.name || filename.replace('.json', '')
          const existingPresets = JSON.parse(localStorage.getItem('odrive_config_presets') || '{}')

          if (existingPresets[presetName]) {
            skipped++
          } else {
            existingPresets[presetName] = data.preset
            localStorage.setItem('odrive_config_presets', JSON.stringify(existingPresets))
            imported++
          }
        } else if (data.presets) {
          // Multi-preset format
          const existingPresets = JSON.parse(localStorage.getItem('odrive_config_presets') || '{}')

          Object.entries(data.presets).forEach(([name, preset]) => {
            if (existingPresets[name]) {
              skipped++
            } else {
              existingPresets[name] = preset
              imported++
            }
          })

          localStorage.setItem('odrive_config_presets', JSON.stringify(existingPresets))
        }
      } catch (error) {
        errors.push(`Error processing ${filename}: ${error.message}`)
      }
    }
  }

  let resultMessage = `Imported: ${imported}`
  if (skipped > 0) {
    resultMessage += `, Skipped: ${skipped} (already exist)`
  }
  if (errors.length > 0) {
    resultMessage += `, Errors: ${errors.length}`
  }

  toast({
    title: 'ZIP import complete',
    description: resultMessage,
    status: errors.length > 0 ? 'warning' : 'success',
    duration: 5000,
  })
}

/**
 * Handle file import (supports both JSON and ZIP)
 * @param {File} file - File to import
 * @param {Function} toast - Toast notification function
 * @returns {Promise<void>}
 */
export const handleFileImport = async (file, toast) => {
  if (file.name.endsWith('.zip')) {
    await importZipPresets(file, toast)
  } else if (file.name.endsWith('.json')) {
    await importJsonPresets(file, toast)
  } else {
    throw new Error('Unsupported file type. Please select a JSON or ZIP file.')
  }
}
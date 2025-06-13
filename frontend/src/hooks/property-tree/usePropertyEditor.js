import { useState } from 'react'

export const usePropertyEditor = (updateProperty, refreshProperty) => {
  const [editingProperty, setEditingProperty] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startEditing = (path, currentValue) => {
    setEditingProperty(path)
    setEditValue(String(currentValue))
  }

  const saveEdit = async () => {
    if (!editingProperty) return
    
    let parsedValue = editValue
    
    // Try to parse as number first
    if (!isNaN(editValue) && editValue.trim() !== '') {
      parsedValue = parseFloat(editValue)
    } else if (editValue.toLowerCase() === 'true') {
      parsedValue = true
    } else if (editValue.toLowerCase() === 'false') {
      parsedValue = false
    }
    
    // Build the correct device path for the API call
    let devicePath
    if (editingProperty.startsWith('system.')) {
      const systemProp = editingProperty.replace('system.', '')
      if (['dc_bus_overvoltage_trip_level', 'dc_bus_undervoltage_trip_level', 'dc_max_positive_current', 
           'dc_max_negative_current', 'enable_brake_resistor', 'brake_resistance'].includes(systemProp)) {
        devicePath = `device.config.${systemProp}`
      } else {
        devicePath = `device.${systemProp}`
      }
    } else if (editingProperty.startsWith('axis0.') || editingProperty.startsWith('axis1.')) {
      devicePath = `device.${editingProperty}`
    } else {
      devicePath = `device.${editingProperty}`
    }
    
    console.log('Updating property:', devicePath, 'with value:', parsedValue)
    
    try {
      await updateProperty(devicePath, parsedValue)
      setEditingProperty(null)
      setEditValue('')
      // Refresh the property after successful update
      await refreshProperty(editingProperty)
    } catch (error) {
      console.error('Failed to update property:', error)
    }
  }

  const cancelEdit = () => {
    setEditingProperty(null)
    setEditValue('')
  }

  return {
    editingProperty,
    editValue,
    setEditValue,
    startEditing,
    saveEdit,
    cancelEdit
  }
}
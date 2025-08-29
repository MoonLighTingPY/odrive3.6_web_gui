import { useState } from 'react'
import { parseValue } from '../../utils/valueHelpers'
import { getPathResolver } from '../../utils/odrivePathResolver'

export const usePropertyEditor = (updateProperty, refreshProperty) => {
  const [editingProperty, setEditingProperty] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startEditing = (path, currentValue) => {
    setEditingProperty(path)
    setEditValue(String(currentValue))
  }

  const saveEdit = async () => {
    if (!editingProperty) return
    
    // Use unified value parsing
    const parsedValue = parseValue(editValue, { type: 'auto', defaultValue: editValue })
    
    // Use dynamic path resolution
    const pathResolver = getPathResolver()
    const devicePath = pathResolver.resolveToApiPath(editingProperty)
    
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
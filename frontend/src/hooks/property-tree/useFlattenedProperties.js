import { useMemo } from 'react'

export const useFlattenedProperties = (filteredTree, collapsedSections, getValueFromState) => {
  return useMemo(() => {
    const flattened = []
    
    const flattenSection = (section, sectionPath = '', depth = 0) => {
      // Add section header
      flattened.push({
        type: 'section',
        name: section.name,
        path: sectionPath,
        depth,
        isCollapsed: collapsedSections.has(sectionPath),
        description: section.description
      })
      
      if (!collapsedSections.has(sectionPath)) {
        // Add properties
        if (section.properties) {
          Object.entries(section.properties).forEach(([propName, prop]) => {
            const displayPath = sectionPath ? `${sectionPath}.${propName}` : propName
            flattened.push({
              type: 'property',
              displayPath,
              prop,
              value: getValueFromState(displayPath),
              depth: depth + 1,
              propName
            })
          })
        }
        
        // Add child sections
        if (section.children) {
          Object.entries(section.children).forEach(([childName, childSection]) => {
            const childPath = sectionPath ? `${sectionPath}.${childName}` : childName
            flattenSection(childSection, childPath, depth + 1)
          })
        }
      }
    }
    
    Object.entries(filteredTree).forEach(([sectionName, section]) => {
      flattenSection(section, sectionName)
    })
    
    return flattened
  }, [filteredTree, collapsedSections, getValueFromState])
}
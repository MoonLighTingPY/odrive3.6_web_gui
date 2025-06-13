import { useMemo } from 'react'

export const usePropertyTreeFilter = (odrivePropertyTree, searchFilter) => {
  const filteredTree = useMemo(() => {
    if (!searchFilter) {
      return { ...odrivePropertyTree }
    }

    const searchTerm = searchFilter.toLowerCase()
    const filtered = {}

    // Helper function to recursively filter a section
    const filterSection = (section, sectionPath = '') => {
      const filteredSection = {
        name: section.name,
        description: section.description,
        properties: {},
        children: {}
      }

      let hasMatches = false

      // Filter properties
      if (section.properties) {
        Object.entries(section.properties).forEach(([propName, prop]) => {
          const fullPath = sectionPath ? `${sectionPath}.${propName}` : propName
          const propNameLower = propName.toLowerCase()
          const pathLower = fullPath.toLowerCase()
          const propDisplayName = prop.name ? prop.name.toLowerCase() : propNameLower
          const propDescription = prop.description ? prop.description.toLowerCase() : ''

          // Check if this property matches the search
          if (
            propDisplayName.includes(searchTerm) ||
            propDescription.includes(searchTerm) ||
            propNameLower.includes(searchTerm) ||
            pathLower.includes(searchTerm)
          ) {
            filteredSection.properties[propName] = prop
            hasMatches = true
          }
        })
      }

      // Filter children recursively
      if (section.children) {
        Object.entries(section.children).forEach(([childName, childSection]) => {
          const childPath = sectionPath ? `${sectionPath}.${childName}` : childName
          const filteredChild = filterSection(childSection, childPath)
          
          // Include child if it has matches or if its name matches
          if (filteredChild.hasMatches || childSection.name.toLowerCase().includes(searchTerm)) {
            filteredSection.children[childName] = {
              name: filteredChild.name,
              description: filteredChild.description,
              properties: filteredChild.properties,
              children: filteredChild.children
            }
            hasMatches = true
          }
        })
      }

      // Check if section name itself matches
      if (section.name.toLowerCase().includes(searchTerm)) {
        hasMatches = true
        // If section name matches, include all its content
        filteredSection.properties = section.properties || {}
        filteredSection.children = section.children || {}
      }

      return { ...filteredSection, hasMatches }
    }

    // Filter each top-level section
    Object.entries(odrivePropertyTree).forEach(([sectionName, section]) => {
      const filteredSection = filterSection(section, sectionName)
      
      if (filteredSection.hasMatches) {
        filtered[sectionName] = {
          name: filteredSection.name,
          description: filteredSection.description,
          properties: filteredSection.properties,
          children: filteredSection.children
        }
      }
    })

    return filtered
  }, [searchFilter, odrivePropertyTree])

  return { filteredTree }
}
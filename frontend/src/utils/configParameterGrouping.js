export function getParameterGroup(param, groupMap) {
  if (param.uiGroup) return param.uiGroup;
  if (groupMap[param.configKey]) return groupMap[param.configKey].group;
  // Fallbacks for special cases
  if (param.path && param.path.includes('fet_thermistor')) return 'FET Thermistor';
  if (param.path && param.path.includes('brake')) return 'Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'DC Bus Voltage Protection';
  if (param.path && param.path.includes('voltage')) return 'DC Bus Voltage Protection';
  if (param.path && param.path.includes('lockin')) return 'Lock-in Configuration';
  if (param.path && param.path.includes('sensorless')) return 'Sensorless Ramp';
  if (param.path && param.path.includes('thermistor')) return 'Thermistor';
  return 'System'; // No more "Miscellaneous"
}

export function getParameterSubgroup(param, groupMap) {
  if (param.uiSubgroup) return param.uiSubgroup;
  if (groupMap[param.configKey]) return groupMap[param.configKey].subgroup;
  // Fallbacks for special cases
  if (param.path && param.path.includes('fet_thermistor')) return 'Thermistor';
  if (param.path && param.path.includes('brake')) return 'Brake Resistor';
  if (param.path && param.path.includes('overvoltage_ramp')) return 'Ramp';
  if (param.path && param.path.includes('voltage')) return 'Trip Levels';
  if (param.path && param.path.includes('lockin')) return 'Lock-in';
  if (param.path && param.path.includes('sensorless')) return 'Sensorless Ramp';
  if (param.path && param.path.includes('thermistor')) return 'Motor Thermistor';
  return 'Other';
}

export function getParameterImportance(param, groupMap) {
  if (param.importance) return param.importance;
  if (groupMap[param.configKey]) return groupMap[param.configKey].importance;
  return 'advanced'; // Default to advanced instead of optional
}

// Updated function with new importance levels
export function getParametersByImportance(params, groupMap, importance = 'essential') {
  const importanceLevels = {
    essential: ['essential'],
    advanced: ['essential', 'advanced'],
    all: ['essential', 'advanced']
  }
  
  const targetLevels = importanceLevels[importance] || importanceLevels.all
  
  return params.filter(param => {
    const paramImportance = getParameterImportance(param, groupMap)
    return targetLevels.includes(paramImportance)
  })
}

// Enhanced function for organized advanced parameters
export const getGroupedAdvancedParameters = (params, paramGroups) => {
  const grouped = {}
  const addedParams = new Set() // Track already added parameters
  
  params.forEach(param => {
    const paramGroup = getParameterGroup(param, paramGroups)
    const paramSubgroup = getParameterSubgroup(param, paramGroups)
    const importance = getParameterImportance(param, paramGroups)
    
    // Only include advanced parameters that haven't been added yet
    if (importance === 'advanced' && !addedParams.has(param.configKey)) {
      if (!grouped[paramGroup]) grouped[paramGroup] = {}
      if (!grouped[paramGroup][paramSubgroup]) grouped[paramGroup][paramSubgroup] = []
      
      grouped[paramGroup][paramSubgroup].push(param)
      addedParams.add(param.configKey) // Mark as added
    }
  })
  
  return grouped
}

export function getOrderedGroupedParameters(params, groupMap, importance = 'all') {
  const filteredParams = getParametersByImportance(params, groupMap, importance)
  
  const groupOrder = []
  const subgroupOrder = {}
  Object.values(groupMap).forEach(({ group, subgroup }) => {
    if (!groupOrder.includes(group)) groupOrder.push(group)
    if (!subgroupOrder[group]) subgroupOrder[group] = []
    if (!subgroupOrder[group].includes(subgroup)) subgroupOrder[group].push(subgroup)
  })

  const grouped = {}
  groupOrder.forEach(group => {
    grouped[group] = {}
    subgroupOrder[group].forEach(subgroup => {
      grouped[group][subgroup] = filteredParams.filter(
        param =>
          getParameterGroup(param, groupMap) === group &&
          getParameterSubgroup(param, groupMap) === subgroup
      )
    })
  })

  return { groupOrder, subgroupOrder, grouped }
}
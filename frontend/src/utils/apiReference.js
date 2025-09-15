// Central API reference selector + property tree builder

import ref05x from './odriveApiReference05x.json'
import ref06x from './odriveApiReference06x.json'

/**
 * Select raw reference JSON based on firmware major.
 * @param {number | undefined} fwMajor
 */
export function selectApiRef(fwMajor) {
  if (fwMajor >= 6) return ref06x
  return ref05x
}

/**
 * Build a normalized property tree structure expected by PropertyTree/PropertyItem.
 * Sections: system, axis0, axis1 (auto-expanded), plus any other top-level groups without axis prefix.
 *
 * Returned shape:
 * {
 *   system: { name: 'system', properties: { torque_setpoint: {...}, ... } },
 *   axis0: { name: 'axis0', properties: { input_pos: {...}, vel_estimate: {...} } },
 *   ...
 * }
 *
 * Each property object:
 * {
 *   name,
 *   description,
 *   path,        // full backend path
 *   valueType,   // raw type (e.g. Float32Property)
 *   type,        // simplified input kind: 'number' | 'boolean' | 'text'
 *   writable     // boolean
 * }
 */
export function buildPropertyTree(apiRef, maxAxes = 2) {
  const tree = {}

  const ensureSection = (key) => {
    if (!tree[key]) {
      tree[key] = { name: key, properties: {} }
    }
    return tree[key]
  }

  const simplifyType = (valueType) => {
    if (!valueType) return 'text'
    const vt = valueType.toLowerCase()
    if (vt.includes('bool')) return 'boolean'
    if (vt.includes('int') || vt.includes('float')) return 'number'
    return 'text'
  }

  const addProp = (sectionKey, propKeyBase, meta, fullPath) => {
    const section = ensureSection(sectionKey)

    // Avoid collisions inside a section
    let propKey = propKeyBase
    let i = 2
    while (section.properties[propKey]) {
      propKey = `${propKeyBase}_${i++}`
    }

    section.properties[propKey] = {
      name: meta.name || propKeyBase,
      description: meta.description,
      path: fullPath,
      valueType: meta.type,
      type: simplifyType(meta.type),
      writable: meta.access !== 'ro'
    }
  }

  const groups = apiRef?.properties || {}

  Object.entries(groups).forEach(([, props]) => {
    if (!props || typeof props !== 'object') return

    Object.entries(props).forEach(([, meta]) => {
      if (!meta || typeof meta !== 'object') return
      if (!meta.path || !meta.type) return // skip incomplete
      const basePath = meta.path

      // Axis expansion
      if (basePath.includes('axis{n}')) {
        for (let ax = 0; ax < maxAxes; ax += 1) {
          const fullPath = basePath.replace(/axis\{n\}/g, `axis${ax}`)
          // Section is axis{n} root (first segment: axis0 / axis1)
            const sectionKey = `axis${ax}`
          // Property key = last segment of path
          const leaf = fullPath.split('.').pop()
          addProp(sectionKey, leaf, meta, fullPath)
        }
      } else {
        // Non-axis property
        const firstSegment = basePath.split('.')[0]
        const sectionKey = firstSegment
        const leaf = basePath.split('.').pop()
        addProp(sectionKey, leaf, meta, basePath)
      }
    })
  })

  return tree
}

/**
 * Convenience: build tree directly from fw major
 */
export function getPropertyTree(fwMajor) {
  const ref = selectApiRef(fwMajor)
  return buildPropertyTree(ref)
}
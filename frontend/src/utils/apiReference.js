// Central API reference selector + property tree builder

import ref05x from './odriveApiReference05x.json'
import ref06x from './odriveApiReference06x.json'

/**
 * Select raw reference JSON based on firmware line.
 * @param {number | undefined} fwLine 5 for 0.5.x, 6 for 0.6.x.
 */
export function selectApiRef(fwLine) {
  return fwLine === 6 ? ref06x : ref05x
}

/** Build { value, label } options for a `Property[Enum.Name]` type, else null. */
function enumOptions(apiRef, valueType) {
  const m = /Property\[(.+)\]/.exec(valueType || '')
  if (!m) return null
  const en = apiRef?.enums?.[m[1]]
  if (!en?.values) return null
  return Object.entries(en.values).map(([name, info]) => ({
    value: typeof info?.value === 'number' ? info.value : Number(info?.value ?? 0),
    label: name,
  }))
}

/**
 * Build a normalized, *nested* property tree consumed by PropertyTree/PropertyItem.
 *
 * Top-level sections:
 *   - `system`  — every non-axis property (grouped by its path segments)
 *   - `axis0`, `axis1` — per-axis properties (grouped by their sub-paths)
 *
 * Each node has the shape:
 * {
 *   name,
 *   description?,        // only on leaf-bearing group nodes when known
 *   properties: { leaf: <prop> },   // direct leaf properties
 *   children:   { sub: <node> },    // nested sub-groups
 * }
 *
 * Each leaf <prop>:
 * {
 *   name,
 *   description,
 *   path,        // full backend path (axis-expanded), used for read/write/charts/favourites
 *   valueType,   // raw type (e.g. Float32Property)
 *   type,        // simplified input kind: 'number' | 'boolean' | 'enum' | 'text'
 *   writable,    // boolean
 *   selectOptions? // for enum types
 * }
 */
export function buildPropertyTree(apiRef, maxAxes = 2) {
  const tree = {
    system: { name: 'system', description: 'Device-level properties', properties: {}, children: {} },
  }
  for (let ax = 0; ax < maxAxes; ax += 1) {
    tree[`axis${ax}`] = { name: `axis${ax}`, description: `Axis ${ax} properties`, properties: {}, children: {} }
  }

  const simplifyType = (valueType) => {
    if (!valueType) return 'text'
    const vt = valueType.toLowerCase()
    if (vt.includes('bool')) return 'boolean'
    if (vt.includes('int') || vt.includes('float')) return 'number'
    return 'text'
  }

  const makeProp = (meta, fullPath) => {
    const options = enumOptions(apiRef, meta.type)
    return {
      name: meta.name || fullPath.split('.').pop(),
      description: meta.description,
      path: fullPath,
      valueType: meta.type,
      type: options ? 'enum' : simplifyType(meta.type),
      writable: meta.access !== 'ro',
      ...(options ? { selectOptions: options } : {}),
    }
  }

  // Insert a leaf into `section` following `segments` (the path beneath the
  // section), creating intermediate child group nodes as needed.
  const insert = (section, segments, meta, fullPath) => {
    let node = section
    for (let i = 0; i < segments.length - 1; i += 1) {
      const seg = segments[i]
      if (!node.children[seg]) {
        node.children[seg] = { name: seg, properties: {}, children: {} }
      }
      node = node.children[seg]
    }
    let leaf = segments[segments.length - 1]
    // Avoid clobbering an existing leaf or a sub-group sharing the name.
    let i = 2
    while (node.properties[leaf]) leaf = `${segments[segments.length - 1]}_${i++}`
    node.properties[leaf] = makeProp(meta, fullPath)
  }

  const groups = apiRef?.properties || {}
  Object.values(groups).forEach((props) => {
    if (!props || typeof props !== 'object') return
    Object.values(props).forEach((meta) => {
      if (!meta || typeof meta !== 'object') return
      if (!meta.path || !meta.type) return // skip incomplete
      const basePath = meta.path

      if (basePath.includes('axis{n}')) {
        for (let ax = 0; ax < maxAxes; ax += 1) {
          const fullPath = basePath.replace(/axis\{n\}/g, `axis${ax}`)
          const segments = fullPath.split('.').slice(1) // drop the `axisN` prefix
          if (segments.length === 0) continue
          insert(tree[`axis${ax}`], segments, meta, fullPath)
        }
      } else {
        const segments = basePath.split('.')
        insert(tree.system, segments, meta, basePath)
      }
    })
  })

  return tree
}

/**
 * Convenience: build tree directly from firmware line (5 or 6).
 */
export function getPropertyTree(fwLine) {
  const ref = selectApiRef(fwLine)
  return buildPropertyTree(ref)
}
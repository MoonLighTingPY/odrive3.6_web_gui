import { describe, it, expect } from 'vitest'
import { buildPropertyTree, getPropertyTree, selectApiRef } from '../apiReference'

// Recursively collect every leaf property from the nested tree.
function collectProps(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (node.properties) out.push(...Object.values(node.properties))
  if (node.children) Object.values(node.children).forEach((child) => collectProps(child, out))
  return out
}

function collectTreeProps(tree) {
  return Object.values(tree).flatMap((section) => collectProps(section))
}

describe('buildPropertyTree', () => {
  it('marks enum properties and attaches selectOptions', () => {
    const tree = getPropertyTree(5)
    // axis0 section exists and nests its sub-groups.
    expect(tree.axis0).toBeTruthy()
    const controlMode = collectProps(tree.axis0).find((p) => p.name === 'control_mode')
    expect(controlMode).toBeTruthy()
    expect(controlMode.type).toBe('enum')
    expect(Array.isArray(controlMode.selectOptions)).toBe(true)
    expect(controlMode.selectOptions.length).toBeGreaterThan(0)
    // Options are { value:number, label:string }.
    expect(controlMode.selectOptions[0]).toHaveProperty('value')
    expect(controlMode.selectOptions[0]).toHaveProperty('label')
  })

  it('classifies scalar types without selectOptions', () => {
    const tree = buildPropertyTree(selectApiRef(5))
    const allProps = collectTreeProps(tree)
    const polePairs = allProps.find((p) => p.name === 'pole_pairs')
    expect(polePairs.type).toBe('number')
    expect(polePairs.selectOptions).toBeUndefined()
  })

  it('groups non-axis properties under the system section', () => {
    const tree = getPropertyTree(5)
    expect(tree.system).toBeTruthy()
    const vbus = collectProps(tree.system).find((p) => p.path === 'vbus_voltage')
    expect(vbus).toBeTruthy()
    expect(vbus.writable).toBe(false)
  })
})

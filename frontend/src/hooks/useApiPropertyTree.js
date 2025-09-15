import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { getPropertyTree } from '../utils/apiReference'

/**
 * Returns memoized property tree based on connected device firmware.
 * Falls back to 0.5.x layout if no device connected.
 */
export function useApiPropertyTree() {
  const { connectedDevice } = useSelector(s => s.device)
  const fwMajor = connectedDevice?.fw_version_major
  const tree = useMemo(() => getPropertyTree(fwMajor || 0), [fwMajor])
  return tree
}
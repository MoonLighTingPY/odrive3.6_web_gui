import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { getPropertyTree } from '../utils/apiReference'

/**
 * Returns memoized property tree based on connected device firmware line.
 * Falls back to 0.5.x layout if no device connected.
 */
export function useApiPropertyTree() {
  const fwLine = useSelector((s) => s.device.fw_line)
  const tree = useMemo(() => getPropertyTree(fwLine || 5), [fwLine])
  return tree
}
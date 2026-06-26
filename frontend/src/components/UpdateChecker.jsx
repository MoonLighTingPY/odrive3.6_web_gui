import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  Badge,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import * as backend from '../api/backend'

const GITHUB_RELEASES = 'https://api.github.com/repos/MoonLighTingPY/odrive3.6_web_gui/releases/latest'

// Extract a comparable [major, minor, patch] tuple from a version-ish string.
function parseSemver(s) {
  const m = String(s || '').match(/(\d+)\.(\d+)\.(\d+)/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

function isNewer(latest, current) {
  const a = parseSemver(latest)
  const b = parseSemver(current)
  if (!a || !b) return false
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return true
    if (a[i] < b[i]) return false
  }
  return false
}

/**
 * Checks GitHub for a newer release and shows an "Update available" button that
 * links to the release page. Read-only — no in-app auto-update (keeps it
 * reliable across platforms). Manual re-check via the button.
 */
const UpdateChecker = () => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [current, setCurrent] = useState(null)
  const [release, setRelease] = useState(null)
  const [checking, setChecking] = useState(false)
  // Auto-pop the modal only once per session so re-checks don't reopen it after
  // the user has dismissed it.
  const autoOpenedRef = useRef(false)

  const check = useCallback(
    async (manual = false) => {
      setChecking(true)
      try {
        const [{ backend_version }, res] = await Promise.all([
          backend.getBackendVersion().catch(() => ({ backend_version: null })),
          fetch(GITHUB_RELEASES, { headers: { Accept: 'application/vnd.github+json' } }),
        ])
        setCurrent(backend_version)
        if (!res.ok) throw new Error(`GitHub returned ${res.status}`)
        const data = await res.json()
        setRelease(data)
        const newer = isNewer(data.tag_name, backend_version)
        // On the initial silent check, surface the updater modal automatically
        // (same as clicking “Update available”).
        if (!manual && newer && !autoOpenedRef.current) {
          autoOpenedRef.current = true
          onOpen()
        }
        if (manual && !newer) {
          toast({ title: 'Up to date', description: `Running the latest version (${backend_version || '?'}).`, status: 'info', duration: 3000 })
        }
      } catch (err) {
        if (manual) toast({ title: 'Update check failed', description: String(err.message || err), status: 'error', duration: 4000 })
      } finally {
        setChecking(false)
      }
    },
    [toast, onOpen]
  )

  // Silent check shortly after load.
  useEffect(() => {
    const t = setTimeout(() => check(false), 1500)
    return () => clearTimeout(t)
  }, [check])

  const updateAvailable = release && isNewer(release.tag_name, current)

  return (
    <>
      {updateAvailable ? (
        <Button size="sm" colorScheme="green" variant="solid" onClick={onOpen}>
          Update available
        </Button>
      ) : (
        <Button size="sm" variant="ghost" colorScheme="gray" onClick={() => check(true)} isLoading={checking}>
          Check for updates
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="green.300">
            <HStack>
              <Text>Update available</Text>
              {release && <Badge colorScheme="green">{release.tag_name}</Badge>}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color="gray.400">
                You&apos;re running <b>{current || '?'}</b>. A newer release is available.
              </Text>
              {release?.body && (
                <Box bg="gray.900" borderRadius="md" p={3} fontSize="sm" className="markdown-body">
                  <ReactMarkdown>{release.body}</ReactMarkdown>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Later</Button>
            {release?.html_url && (
              <Link href={release.html_url} isExternal _hover={{ textDecoration: 'none' }}>
                <Button colorScheme="green">Open Release Page</Button>
              </Link>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateChecker

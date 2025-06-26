import React, { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Box,
  Button,
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
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'

const UpdateChecker = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [updateInfo, setUpdateInfo] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [hasChecked, setHasChecked] = useState(false)
  const toast = useToast()

  const checkForUpdates = useCallback(async (isManual = false) => {
    setIsChecking(true)
    try {
      console.log('Checking for updates...')
      const response = await fetch('/api/system/check_updates')
      
      
      // Get the raw response text first
      const responseText = await response.text()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }
      
      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`)
      }
      
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setUpdateInfo(data)
      setHasChecked(true)
      if (data.update_available) {
        onOpen()
      } else if (isManual) {
        // Only show toast for manual checks
        toast({
          title: 'No Updates Available',
          description: `You're running the latest version (${data.current_version})`,
          status: 'info',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Update check failed:', error)
      setHasChecked(true)
      // Only show error toast if it's a manual check
      if (isManual) {
        toast({
          title: 'Update Check Failed',
          description: error.message,
          status: 'error',
          duration: 5000,
        })
      }
    } finally {
      setIsChecking(false)
    }
  }, [onOpen, toast])

  // Auto-check for updates on component mount (no toast)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [checkForUpdates])

  const performUpdate = async () => {
    if (!updateInfo) return
    
    setIsUpdating(true)
    setUpdateProgress(0)
    
    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUpdateProgress(prev => Math.min(prev + 10, 90))
      }, 500)
      
      const response = await fetch('/api/system/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          download_url: updateInfo.download_url,
          file_name: updateInfo.file_name
        })
      })
      
      clearInterval(progressInterval)
      setUpdateProgress(100)
      
      const responseText = await response.text()
      
      if (!response.ok) {
        let errorMessage = `Update failed (HTTP ${response.status})`
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = responseText || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      toast({
        title: 'Update Started',
        description: 'The application will restart with the new version in a few seconds...',
        status: 'success',
        duration: 10000,
      })
      onClose()
      
      // Show countdown message
      setTimeout(() => {
        toast({
          title: 'Restarting Application...',
          description: 'The application is being updated and will restart automatically.',
          status: 'info',
          duration: 5000,
        })
      }, 2000)
      
    } catch (error) {
      console.error('Update failed:', error)
      toast({
        title: 'Update Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
      setUpdateProgress(0)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getButtonText = () => {
    if (isChecking) return "Checking..."
    if (!hasChecked) return "Check for Updates"
    if (updateInfo?.update_available) return "🔄 Update Available!"
    return "✅ Latest Version"
  }

  const getButtonColorScheme = () => {
    if (!hasChecked) return "blue"
    if (updateInfo?.update_available) return "orange"
    return "green"
  }

  // Manual check button (shows toast)
  const handleManualCheck = () => {
    checkForUpdates(true)
  }

  return (
    <>
      <Button
        colorScheme={getButtonColorScheme()}
        variant="outline"
        size="sm"
        onClick={handleManualCheck}
        isLoading={isChecking}
        loadingText="Checking..."
      >
        {getButtonText()}
      </Button>
      
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Text>Update Available</Text>
              <Badge colorScheme="green" variant="solid">
                {updateInfo?.latest_version}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>New Version Available!</AlertTitle>
                  <AlertDescription>
                    Current: {updateInfo?.current_version} → Latest: {updateInfo?.latest_version}
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <Text fontWeight="bold" mb={2}>Download Size:</Text>
                <Text>{formatFileSize(updateInfo?.file_size || 0)}</Text>
              </Box>

              {updateInfo?.release_notes && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Release Notes:</Text>                  
                  <Box
                    maxH="200px"
                    overflowY="auto"
                    py={2}
                  >
                    <ReactMarkdown
                      components={{
                        // Style headings
                        h1: ({ children }) => {
                          // Skip if it's a "release notes" header
                          const text = children?.toString?.()?.toLowerCase() || ''
                          if (text.includes('release notes')) return null
                          
                          return (
                            <Text fontSize="xl" fontWeight="bold" mb={2} color="blue.600" _dark={{ color: "blue.300" }}>
                              {children}
                            </Text>
                          )
                        },
                        h2: ({ children }) => {
                          // Skip if it's a "release notes" header
                          const text = children?.toString?.()?.toLowerCase() || ''
                          if (text.includes('release notes')) return null
                          
                          return (
                            <Text fontSize="lg" fontWeight="bold" mb={2} mt={3} color="blue.600" _dark={{ color: "blue.400" }}>
                              {children}
                            </Text>
                          )
                        },
                        h3: ({ children }) => {
                          // Skip if it's a "release notes" header
                          const text = children?.toString?.()?.toLowerCase() || ''
                          if (text.includes('release notes')) return null
                          
                          return (
                            <Text fontSize="md" fontWeight="bold" mb={1} mt={2} color="blue.600" _dark={{ color: "blue.300" }}>
                              {children}
                            </Text>
                          )
                        },
                        // Style lists
                        ul: ({ children }) => (
                          <Box as="ul" pl={4} mb={2}>
                            {children}
                          </Box>
                        ),
                        li: ({ children }) => (
                          <Box as="li" mb={1} fontSize="md" color="blue.700" _dark={{ color: "blue.200" }}>
                            {children}
                          </Box>
                        ),
                        // Style paragraphs
                        p: ({ children }) => (
                          <Text mb={2} fontSize="md" lineHeight="1.5" color="blue.700" _dark={{ color: "blue.200" }}>
                            {children}
                          </Text>
                        ),
                        // Style code
                        code: ({ children, inline }) => (
                        <Text
                          as={inline ? 'span' : 'div'}
                          fontFamily="mono"
                          fontSize="sm"
                          bg="blue.50"
                          px={1}
                          borderRadius="sm"
                          color="blue.800"
                          _dark={{ 
                            bg: "blue.900",
                            color: "blue.200"
                          }}
                        >
                          {children}
                        </Text>
                      ),
                        // Style strong/bold text
                        strong: ({ children }) => (
                          <Text as="span" fontWeight="bold" color="blue.800" _dark={{ color: "blue.100" }}>
                            {children}
                          </Text>
                        ),
                        // Style horizontal rules
                        hr: () => (
                          <Box
                            w="100%"
                            h="1px"
                            bg="blue.300"
                            _dark={{ bg: "blue.600" }}
                            my={3}
                          />
                        )
                      }}
                    >
                      {updateInfo.release_notes}
                    </ReactMarkdown>
                  </Box>
                </Box>
              )}

              {isUpdating && (
                <Box>
                  <Text mb={2}>Downloading update...</Text>
                  <Progress value={updateProgress} colorScheme="blue" />
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {updateProgress}% complete
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={onClose} isDisabled={isUpdating}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={performUpdate}
                isLoading={isUpdating}
                loadingText="Updating..."
                isDisabled={isUpdating}
              >
                Install Update
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateChecker
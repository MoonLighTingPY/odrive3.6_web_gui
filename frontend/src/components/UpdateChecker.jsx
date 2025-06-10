import React, { useState } from 'react'
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
  Textarea,
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
  const toast = useToast()

  const checkForUpdates = async () => {
    setIsChecking(true)
    try {
      console.log('Checking for updates...')
      const response = await fetch('/api/system/check_updates')
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers.get('content-type'))
      
      // Get the raw response text first
      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
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
      
      console.log('Parsed update data:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setUpdateInfo(data)
      if (data.update_available) {
        onOpen()
      } else {
        toast({
          title: 'No Updates Available',
          description: `You're already running the latest version (${data.current_version})`,
          status: 'info',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Update check failed:', error)
      toast({
        title: 'Update Check Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsChecking(false)
    }
  }

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

  return (
    <>
      <Button
        colorScheme="blue"
        variant="outline"
        size="sm"
        onClick={checkForUpdates}
        isLoading={isChecking}
        loadingText="Checking..."
      >
        🔄 Check for Updates
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
                  <Textarea
                    value={updateInfo.release_notes}
                    isReadOnly
                    resize="vertical"
                    minH="120px"
                    maxH="200px"
                  />
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
import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Alert,
  AlertIcon,
  Text
} from '@chakra-ui/react'

const PresetSaveDialog = ({
  isOpen,
  onClose,
  onSave,
  existingPresets = []
}) => {
  const [presetName, setPresetName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!presetName.trim()) return

    setIsLoading(true)
    try {
      await onSave(presetName.trim(), description.trim())
      setPresetName('')
      setDescription('')
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPresetName('')
    setDescription('')
    onClose()
  }

  const isNameTaken = existingPresets.includes(presetName.trim())
  const isValidName = presetName.trim().length > 0

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Save Configuration Preset</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!isValidName && presetName.length > 0}>
              <FormLabel>Preset Name</FormLabel>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name..."
                autoFocus
              />
            </FormControl>

            {isNameTaken && (
              <Alert status="warning" size="sm">
                <AlertIcon />
                <Text fontSize="sm">
                  A preset with this name already exists. Saving will overwrite the existing preset.
                </Text>
              </Alert>
            )}

            <FormControl>
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description for this preset..."
                rows={3}
                resize="vertical"
              />
            </FormControl>

            <Alert status="info" size="sm">
              <AlertIcon />
              <Text fontSize="sm">
                This will save your current ODrive configuration including power,
                motor, encoder, control, and interface settings.
              </Text>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSave}
            isDisabled={!isValidName}
            isLoading={isLoading}
          >
            {isNameTaken ? 'Overwrite Preset' : 'Save Preset'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PresetSaveDialog
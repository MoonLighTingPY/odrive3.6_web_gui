import React, { useRef, useState } from 'react'
import {
  VStack,
  HStack,
  Button,
  Text,
  Input,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  List,
  ListItem,
  ListIcon,
  Box
} from '@chakra-ui/react'
import { DownloadIcon, AttachmentIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons'
import {
  exportPresetsToFile,
  importPresetsFromFile
} from '../../utils/presetsManager'

const PresetImportExport = ({ onImportComplete, compact = false }) => {
  const fileInputRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const toast = useToast()

  const handleExportAll = async () => {
    setExporting(true)
    try {
      exportPresetsToFile(null) // Export all presets
      toast({
        title: 'Export Successful',
        description: 'All presets exported',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImporting(true)
    try {
      toast({
        title: 'Importing Presets',
        description: 'Processing preset file...',
        status: 'info',
        duration: 2000,
      })

      const results = await importPresetsFromFile(file, overwriteExisting)
      setImportResults(results)
      setShowResults(true)

      let resultMessage = `Imported: ${results.imported}`
      if (results.overwritten > 0) {
        resultMessage += `, Overwritten: ${results.overwritten}`
      }
      if (results.skipped > 0) {
        resultMessage += `, Skipped: ${results.skipped}`
      }
      if (results.errors.length > 0) {
        resultMessage += `, Errors: ${results.errors.length}`
      }

      toast({
        title: 'Import Complete',
        description: resultMessage,
        status: results.errors.length > 0 ? 'warning' : 'success',
        duration: 5000,
      })

      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
      console.error('Import failed:', error)
    } finally {
      setImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const closeResults = () => {
    setShowResults(false)
    setImportResults(null)
  }

  if (compact) {
    return (
      <HStack spacing={2}>
        <Button
          size="xs"
          leftIcon={<AttachmentIcon />}
          onClick={handleImportClick}
          isLoading={importing}
          variant="outline"
        >
          Import
        </Button>

        <Button
          size="xs"
          leftIcon={<DownloadIcon />}
          onClick={handleExportAll}
          isLoading={exporting}
          variant="outline"
        >
          Export All
        </Button>

        <Input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Keep the existing results modal */}
        <Modal isOpen={showResults} onClose={closeResults} size="md">
          {/* ... existing modal content ... */}
        </Modal>
      </HStack>
    )
  }

  return (
    <>
      <VStack spacing={3} align="stretch">
        <Text fontSize="sm" fontWeight="medium">Import / Export</Text>

        <VStack spacing={2} align="stretch">
          <Checkbox
            isChecked={overwriteExisting}
            onChange={(e) => setOverwriteExisting(e.target.checked)}
            size="sm"
          >
            <Text fontSize="sm">Overwrite existing presets when importing</Text>
          </Checkbox>

          <HStack spacing={2}>
            <Button
              size="sm"
              leftIcon={<AttachmentIcon />}
              onClick={handleImportClick}
              isLoading={importing}
              loadingText="Importing"
              flex={1}
            >
              Import Presets
            </Button>

            <Button
              size="sm"
              leftIcon={<DownloadIcon />}
              onClick={handleExportAll}
              isLoading={exporting}
              loadingText="Exporting"
              flex={1}
            >
              Export All
            </Button>
          </HStack>
        </VStack>

        <Input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </VStack>

      {/* Import Results Modal */}
      <Modal isOpen={showResults} onClose={closeResults} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import Results</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {importResults && (
              <VStack spacing={4} align="stretch">
                {/* Summary */}
                <Box>
                  <Text fontWeight="medium" mb={2}>Summary:</Text>
                  <List spacing={1}>
                    {importResults.imported > 0 && (
                      <ListItem>
                        <ListIcon as={CheckIcon} color="green.500" />
                        {importResults.imported} preset(s) imported
                      </ListItem>
                    )}
                    {importResults.overwritten > 0 && (
                      <ListItem>
                        <ListIcon as={WarningIcon} color="orange.500" />
                        {importResults.overwritten} preset(s) overwritten
                      </ListItem>
                    )}
                    {importResults.skipped > 0 && (
                      <ListItem>
                        <ListIcon as={WarningIcon} color="yellow.500" />
                        {importResults.skipped} preset(s) skipped (already exist)
                      </ListItem>
                    )}
                  </List>
                </Box>

                {/* Errors */}
                {importResults.errors && importResults.errors.length > 0 && (
                  <Alert status="error">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Errors occurred:</Text>
                      {importResults.errors.map((error, index) => (
                        <Text key={index} fontSize="sm">{error}</Text>
                      ))}
                    </VStack>
                  </Alert>
                )}

                {/* Success message */}
                {importResults.errors.length === 0 &&
                  (importResults.imported > 0 || importResults.overwritten > 0) && (
                    <Alert status="success">
                      <AlertIcon />
                      Import completed successfully!
                    </Alert>
                  )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={closeResults}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PresetImportExport
import { useState } from 'react'
import {
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Button,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { getErrorDescription } from '../../utils/odriveErrors'

const ErrorDisplay = ({ odriveState }) => {
  const toast = useToast()
  const [clearingErrors, setClearingErrors] = useState(false)

  const getAllErrors = () => {
    if (!odriveState || Object.keys(odriveState).length === 0) return []

    const errors = []
    
    // Collect all error types
    const errorSources = [
      { path: 'axis0.error', name: 'Axis Error', value: odriveState.axis0?.error },
      { path: 'axis0.motor.error', name: 'Motor Error', value: odriveState.axis0?.motor?.error },
      { path: 'axis0.encoder.error', name: 'Encoder Error', value: odriveState.axis0?.encoder?.error },
      { path: 'axis0.controller.error', name: 'Controller Error', value: odriveState.axis0?.controller?.error },
      { path: 'axis0.sensorless_estimator.error', name: 'Sensorless Error', value: odriveState.axis0?.sensorless_estimator?.error },
    ]

    errorSources.forEach(source => {
      if (source.value && source.value !== 0) {
        // Parse individual error flags
        const errorFlags = parseErrorFlags(source.value)
        errors.push({
          ...source,
          hexValue: '0x' + source.value.toString(16).toUpperCase(),
          flags: errorFlags
        })
      }
    })

    return errors
  }

  const parseErrorFlags = (errorValue) => {
    const flags = []
    for (let bit = 0; bit < 32; bit++) {
      if (errorValue & (1 << bit)) {
        flags.push({
          bit,
          value: 1 << bit,
          hexValue: '0x' + (1 << bit).toString(16).toUpperCase(),
          description: getErrorDescription(1 << bit) || `Unknown error bit ${bit}`
        })
      }
    }
    return flags
  }

  const clearAllErrors = async () => {
    setClearingErrors(true)
    try {
      const response = await fetch('/api/odrive/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'odrv0.clear_errors()' })
      })

      if (response.ok) {
        toast({
          title: 'Errors cleared',
          description: 'All error flags have been cleared',
          status: 'success',
          duration: 3000,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to clear errors')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to clear errors: ${error.message}`,
        status: 'error',
        duration: 5000,
      })
    }
    setClearingErrors(false)
  }

  const errors = getAllErrors()

  return (
    <Card bg="gray.800" variant="elevated">
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md" color="white">
            Error Analysis ({errors.length} error sources)
          </Heading>
          {errors.length > 0 && (
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={clearAllErrors}
              isLoading={clearingErrors}
            >
              Clear All Errors
            </Button>
          )}
        </HStack>
      </CardHeader>
      <CardBody>
        {errors.length === 0 ? (
          <Alert status="success" variant="subtle">
            <AlertIcon />
            <Text>No errors detected</Text>
          </Alert>
        ) : (
          <Accordion allowMultiple>
            {errors.map((error, index) => (
              <AccordionItem key={index}>
                <AccordionButton>
                  <HStack flex="1" justify="space-between">
                    <HStack>
                      <Text fontWeight="bold" color="white">
                        {error.name}
                      </Text>
                      <Badge colorScheme="red" variant="solid">
                        {error.flags.length} flags
                      </Badge>
                    </HStack>
                    <Code fontSize="sm" colorScheme="red">
                      {error.hexValue}
                    </Code>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontSize="sm" color="gray.400" mb={2}>
                        Error path: <Code fontSize="xs" color="gray.300">{error.path}</Code>
                      </Text>
                      <Text fontSize="sm" color="gray.400" mb={2}>
                        Raw value: <Code fontSize="xs" color="gray.300">{error.value}</Code>
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold" color="white" mb={2}>
                        Active Error Flags:
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {error.flags.map((flag, flagIndex) => (
                          <Box key={flagIndex} p={3} bg="red.900" borderRadius="md" border="1px solid" borderColor="red.700">
                            <HStack justify="space-between" mb={1}>
                              <Text fontWeight="bold" color="red.200">
                                Bit {flag.bit}
                              </Text>
                              <HStack spacing={2}>
                                <Badge colorScheme="red" variant="outline">
                                  {flag.hexValue}
                                </Badge>
                                <Badge colorScheme="red" variant="solid">
                                  {flag.value}
                                </Badge>
                              </HStack>
                            </HStack>
                            <Text fontSize="sm" color="red.300">
                              {flag.description}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardBody>
    </Card>
  )
}

export default ErrorDisplay
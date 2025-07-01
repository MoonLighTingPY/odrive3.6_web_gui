import React from 'react'
import {
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code
} from '@chakra-ui/react'
import { compareConfigWithPreset } from '../../utils/presetsActions'

const PresetComparison = ({ currentConfig, presetName }) => {
  if (!currentConfig || !presetName) {
    return (
      <Alert status="info">
        <AlertIcon />
        Select a preset to compare with current configuration
      </Alert>
    )
  }

  let comparison
  try {
    comparison = compareConfigWithPreset(currentConfig, presetName)
  } catch (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to compare configurations: {error.message}
      </Alert>
    )
  }

  if (!comparison.hasDifferences) {
    return (
      <Alert status="success">
        <AlertIcon />
        Current configuration matches the selected preset perfectly!
      </Alert>
    )
  }

  const renderValue = (value) => {
    if (value === undefined) return <Code colorScheme="gray">undefined</Code>
    if (value === null) return <Code colorScheme="gray">null</Code>
    if (typeof value === 'boolean') return <Code colorScheme={value ? 'green' : 'red'}>{String(value)}</Code>
    if (typeof value === 'number') return <Code colorScheme="blue">{value}</Code>
    if (typeof value === 'string') return <Code colorScheme="purple">"{value}"</Code>
    return <Code>{String(value)}</Code>
  }

  const getDiffBadge = (diff) => {
    if (diff.added) return <Badge colorScheme="green" size="sm">Added</Badge>
    if (diff.removed) return <Badge colorScheme="red" size="sm">Removed</Badge>
    if (diff.changed) return <Badge colorScheme="orange" size="sm">Changed</Badge>
    return null
  }

  return (
    <VStack spacing={4} align="stretch">
      <Alert status="warning">
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">
            Configuration Differences Found
          </Text>
          <Text fontSize="sm">
            {comparison.totalChanges} difference(s) between current config and "{presetName}"
          </Text>
        </VStack>
      </Alert>

      <Accordion allowMultiple>
        {Object.entries(comparison.differences).map(([section, diffs]) => (
          <AccordionItem key={section}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <HStack>
                  <Text fontWeight="medium" textTransform="capitalize">
                    {section}
                  </Text>
                  <Badge colorScheme="blue" size="sm">
                    {Object.keys(diffs).length} change(s)
                  </Badge>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel pb={4}>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Parameter</Th>
                    <Th>Current Value</Th>
                    <Th>Preset Value</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(diffs).map(([param, diff]) => (
                    <Tr key={param}>
                      <Td>
                        <Code fontSize="xs">{param}</Code>
                      </Td>
                      <Td>{renderValue(diff.current)}</Td>
                      <Td>{renderValue(diff.preset)}</Td>
                      <Td>{getDiffBadge(diff)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  )
}

export default PresetComparison
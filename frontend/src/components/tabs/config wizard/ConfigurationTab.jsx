import { Box, Heading, Text } from '@chakra-ui/react'

const ConfigurationTab = () => {
  return (
    <Box p={6}>
      <Heading size="md" color="odrive.300">Configuration</Heading>
      <Text mt={2} color="gray.300">Configure your ODrive settings here.</Text>
    </Box>
  )
}

export default ConfigurationTab
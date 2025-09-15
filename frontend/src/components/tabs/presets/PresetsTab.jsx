import { Box, Heading, Text } from '@chakra-ui/react'

const PresetsTab = () => {
  return (
    <Box p={6}>
      <Heading size="md" color="odrive.300">Presets</Heading>
      <Text mt={2} color="gray.300">Manage your ODrive presets here.</Text>
    </Box>
  )
}

export default PresetsTab
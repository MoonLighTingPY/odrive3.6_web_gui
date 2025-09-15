import { Box, Heading, Text } from '@chakra-ui/react'

const CommandConsoleTab = () => {
  return (
    <Box p={6}>
      <Heading size="md" color="odrive.300">Command Console</Heading>
      <Text mt={2} color="gray.300">Run commands against the device.</Text>
    </Box>
  )
}

export default CommandConsoleTab
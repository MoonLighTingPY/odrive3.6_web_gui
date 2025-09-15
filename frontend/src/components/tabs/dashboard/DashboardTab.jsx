import { Box, Heading, Text } from '@chakra-ui/react'

const DashboardTab = () => {
  return (
    <Box p={6}>
      <Heading size="md" color="odrive.300">Dashboard</Heading>
      <Text mt={2} color="gray.300">Live telemetry and status.</Text>
    </Box>
  )
}

export default DashboardTab
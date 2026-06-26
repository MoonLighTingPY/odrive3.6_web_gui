import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Select,
  FormControl,
  FormLabel,
  SimpleGrid,
  Code,
  Tooltip,
  IconButton,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { Send, Copy, Clock, Trash2, CheckCircle, AlertCircle, Terminal, WifiOff } from 'lucide-react'
import * as backend from '../../../api/backend'
import { parseConsoleCommand } from '../../../utils/consoleCommand'
import { COMMAND_LIBRARY, withAxis } from '../../../utils/commandLibrary'

const CommandConsoleTab = () => {
  const { connectedDevice, isConnected } = useSelector((s) => s.device)
  const selectedAxis = useSelector((s) => s.ui.selectedAxis)
  const serial = connectedDevice?.serial_number

  const [input, setInput] = useState('')
  const [categoryIdx, setCategoryIdx] = useState('')
  const [commandIdx, setCommandIdx] = useState('')
  const [history, setHistory] = useState([])
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  const category = categoryIdx !== '' ? COMMAND_LIBRARY[Number(categoryIdx)] : null
  const quickCommand = category && commandIdx !== '' ? category.commands[Number(commandIdx)] : null

  const append = (entry) => {
    setHistory((h) => [...h, entry])
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }

  const insertQuick = () => {
    if (quickCommand) setInput(withAxis(quickCommand.command, selectedAxis))
  }

  const run = async () => {
    const line = input.trim()
    if (!line || !serial) return
    setBusy(true)
    const timestamp = new Date().toLocaleTimeString()
    try {
      const parsed = parseConsoleCommand(line)
      let result
      if (parsed.error) throw new Error(parsed.error)
      if (parsed.type === 'read') {
        const res = await backend.readProperties(serial, [parsed.path])
        result = `${parsed.path} = ${fmt(res[parsed.path])}`
      } else if (parsed.type === 'write') {
        const res = await backend.writeProperties(serial, [{ path: parsed.path, value: parsed.value }])
        if (res[0].status !== 'ok') throw new Error(res[0].error)
        result = `${parsed.path} = ${parsed.value}`
      } else {
        const res = await backend.invokeCommand(serial, parsed.path, parsed.args)
        result = `${parsed.path}(${parsed.args.join(', ')}) → ${fmt(res.result)}`
      }
      append({ command: line, timestamp, success: true, result })
      setInput('')
    } catch (err) {
      append({ command: line, timestamp, success: false, result: String(err.message || err) })
    } finally {
      setBusy(false)
    }
  }

  const copyCommand = (text) => navigator.clipboard?.writeText(text)

  return (
    <Box h="100%" display="flex" flexDirection="column" bg="gray.900">
      {/* Header */}
      <HStack px={4} py={3} bg="gray.800" borderBottom="1px solid" borderColor="gray.600" justify="space-between">
        <HStack>
          <Terminal size={18} color="#4fd1c7" />
          <Text fontWeight="bold" color="white">Command Console</Text>
        </HStack>
        <HStack>
          {isConnected ? (
            <Badge colorScheme="green" variant="solid">CONNECTED</Badge>
          ) : (
            <Badge colorScheme="red" variant="solid"><HStack spacing={1}><WifiOff size={12} /><Text>DISCONNECTED</Text></HStack></Badge>
          )}
          {serial && <Badge colorScheme="gray" fontFamily="mono">{serial}</Badge>}
        </HStack>
      </HStack>

      {!isConnected && (
        <Alert status="warning" fontSize="sm"><AlertIcon />Device not connected. Connect a device to run commands.</Alert>
      )}

      {/* Quick Commands */}
      <Box p={4} bg="gray.700" borderBottom="1px solid" borderColor="gray.600">
        <HStack justify="space-between" mb={3}>
          <Text fontWeight="semibold" color="white" fontSize="sm">Quick Commands</Text>
          <Badge colorScheme="blue" variant="solid" fontSize="xs">Axis {selectedAxis}</Badge>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
          <FormControl>
            <FormLabel color="gray.300" fontSize="xs" mb={1}>Category</FormLabel>
            <Select value={categoryIdx} onChange={(e) => { setCategoryIdx(e.target.value); setCommandIdx('') }}
              bg="gray.600" borderColor="gray.500" size="sm" placeholder="Select category">
              {COMMAND_LIBRARY.map((c, i) => (
                <option key={c.category} value={i}>{c.category.toUpperCase()}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel color="gray.300" fontSize="xs" mb={1}>Command</FormLabel>
            <Select value={commandIdx} onChange={(e) => setCommandIdx(e.target.value)}
              bg="gray.600" borderColor="gray.500" size="sm" placeholder="Select command" isDisabled={!category}>
              {category?.commands.map((c, i) => (
                <option key={c.label} value={i}>{c.label} — {withAxis(c.command, selectedAxis)}</option>
              ))}
            </Select>
          </FormControl>
          <VStack align="stretch" spacing={1}>
            <Text color="gray.300" fontSize="xs" mb={1}>Action</Text>
            <Button colorScheme="blue" size="sm" onClick={insertQuick} isDisabled={!quickCommand} leftIcon={<Copy size={14} />}>
              Insert
            </Button>
          </VStack>
        </SimpleGrid>
        {quickCommand && (
          <Box mt={3} p={3} bg="gray.600" borderRadius="md">
            <Text fontSize="xs" color="gray.200" mb={2}>{quickCommand.description}</Text>
            <Code fontSize="xs" colorScheme="blue" p={2} borderRadius="md">{withAxis(quickCommand.command, selectedAxis)}</Code>
          </Box>
        )}
      </Box>

      {/* Command input */}
      <Box p={4} bg="gray.700" borderBottom="1px solid" borderColor="gray.600">
        <HStack>
          <Input
            fontFamily="mono"
            placeholder={`Enter ODrive command (e.g. axis${selectedAxis}.requested_state = 1)`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            isDisabled={busy}
            bg="gray.800"
          />
          <Button onClick={run} isLoading={busy} colorScheme="blue" leftIcon={<Send size={16} />} isDisabled={!serial}>Send</Button>
        </HStack>
      </Box>

      {/* History */}
      <Box flex="1" overflow="hidden" display="flex" flexDirection="column" p={4}>
        <HStack justify="space-between" mb={2}>
          <HStack><Clock size={16} color="#a0aec0" /><Text fontSize="sm" color="gray.300">History ({history.length})</Text></HStack>
          <Tooltip label="Clear history">
            <IconButton aria-label="Clear history" size="xs" variant="ghost" icon={<Trash2 size={16} />} onClick={() => setHistory([])} />
          </Tooltip>
        </HStack>
        <Box ref={scrollRef} flex="1" overflowY="auto" bg="gray.900" borderRadius="md" border="1px solid" borderColor="gray.700" p={3}>
          {history.length === 0 ? (
            <Text color="gray.600" fontSize="sm">No commands executed yet</Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              {history.map((e, i) => (
                <Box key={i} bg="gray.800" borderRadius="md" p={2}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      {e.success ? <CheckCircle size={14} color="#68d391" /> : <AlertCircle size={14} color="#fc8181" />}
                      <Code fontSize="sm" bg="transparent" color="odrive.300">{e.command}</Code>
                    </HStack>
                    <HStack spacing={1}>
                      <Text fontSize="2xs" color="gray.500">{e.timestamp}</Text>
                      <Tooltip label="Copy command">
                        <IconButton aria-label="Copy" size="2xs" variant="ghost" icon={<Copy size={12} />} onClick={() => copyCommand(e.command)} />
                      </Tooltip>
                    </HStack>
                  </HStack>
                  <Text fontSize="xs" color={e.success ? 'gray.300' : 'red.300'} fontFamily="mono" pl={6} whiteSpace="pre-wrap">{e.result}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  )
}

function fmt(value) {
  if (value && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default CommandConsoleTab

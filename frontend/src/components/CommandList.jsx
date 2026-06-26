import { useState } from 'react'
import {
  VStack,
  HStack,
  Code,
  Input,
  IconButton,
  Tooltip,
  Button,
  Checkbox,
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'

/**
 * Editable list of generated commands (matches the dev Apply tab). Supports
 * per-command edit, disable (strike-through), reset and adding custom commands.
 */
const CommandList = ({
  commands,
  customCommands,
  disabledCommands,
  enableEditing,
  onCustomCommandChange,
  onCommandToggle,
  onAddCustomCommand,
}) => {
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editingCommand, setEditingCommand] = useState('')

  const startEditing = (index, value) => {
    setEditingIndex(index)
    setEditingCommand(value)
  }
  const saveEdit = () => {
    if (editingCommand.trim()) onCustomCommandChange(editingIndex, editingCommand.trim())
    setEditingIndex(-1)
    setEditingCommand('')
  }
  const cancelEdit = () => {
    setEditingIndex(-1)
    setEditingCommand('')
  }

  const renderRow = (index, baseCommand) => {
    const isEditing = editingIndex === index
    const isCustom = customCommands[index] !== undefined
    const isDisabled = disabledCommands.has(index)
    const displayCommand = customCommands[index] ?? baseCommand

    return (
      <HStack key={index} spacing={2} opacity={isDisabled ? 0.5 : 1}>
        {enableEditing && (
          <Tooltip label={isDisabled ? 'Enable command' : 'Disable command'}>
            <span>
              <Checkbox isChecked={!isDisabled} onChange={() => onCommandToggle(index)} colorScheme="teal" />
            </span>
          </Tooltip>
        )}

        {isEditing ? (
          <HStack flex={1} spacing={1}>
            <Input
              size="sm"
              value={editingCommand}
              onChange={(e) => setEditingCommand(e.target.value)}
              bg="gray.800"
              borderColor="blue.400"
              fontFamily="mono"
              fontSize="sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit()
                if (e.key === 'Escape') cancelEdit()
              }}
            />
            <IconButton size="xs" colorScheme="green" icon={<CheckIcon />} onClick={saveEdit} aria-label="Save" />
            <IconButton size="xs" colorScheme="red" icon={<CloseIcon />} onClick={cancelEdit} aria-label="Cancel" />
          </HStack>
        ) : (
          <Code
            display="block"
            whiteSpace="pre"
            color={isCustom ? 'yellow.300' : 'green.300'}
            bg="transparent"
            p={1}
            fontSize="sm"
            flex={1}
            textDecoration={isDisabled ? 'line-through' : 'none'}
          >
            {displayCommand}
          </Code>
        )}

        {enableEditing && !isEditing && (
          <HStack spacing={1}>
            <Tooltip label="Edit command">
              <IconButton size="xs" variant="ghost" icon={<EditIcon />} color="gray.400" aria-label="Edit"
                onClick={() => startEditing(index, displayCommand)} />
            </Tooltip>
            {isCustom && (
              <Tooltip label="Reset to original">
                <IconButton size="xs" variant="ghost" icon={<DeleteIcon />} color="gray.400" aria-label="Reset"
                  onClick={() => onCustomCommandChange(index, null)} />
              </Tooltip>
            )}
          </HStack>
        )}
      </HStack>
    )
  }

  const customExtraKeys = Object.keys(customCommands)
    .map(Number)
    .filter((k) => k >= commands.length)

  return (
    <VStack spacing={2} align="stretch">
      {enableEditing && (
        <Button size="sm" variant="outline" colorScheme="blue" onClick={onAddCustomCommand} leftIcon={<EditIcon />} mb={2}>
          Add Custom Command
        </Button>
      )}
      {commands.length === 0 && customExtraKeys.length === 0 && (
        <Code bg="transparent" color="gray.500">No commands.</Code>
      )}
      {commands.map((command, index) => renderRow(index, command))}
      {customExtraKeys.map((index) => renderRow(index, ''))}
    </VStack>
  )
}

export default CommandList

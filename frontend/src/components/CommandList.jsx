import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Code,
  Input,
  IconButton,
  Tooltip,
  Button,
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'

const CommandList = ({
  commands,
  customCommands,
  disabledCommands,
  enableEditing,
  onCustomCommandChange,
  onCommandToggle,
  onAddCustomCommand
}) => {
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editingCommand, setEditingCommand] = useState('')

  const startEditing = (index) => {
    setEditingIndex(index)
    setEditingCommand(customCommands[index] || commands[index])
  }

  const saveEdit = () => {
    if (editingCommand.trim()) {
      onCustomCommandChange(editingIndex, editingCommand.trim())
    }
    setEditingIndex(-1)
    setEditingCommand('')
  }

  const cancelEdit = () => {
    setEditingIndex(-1)
    setEditingCommand('')
  }

  const resetCommand = (index) => {
    onCustomCommandChange(index, null) // null means delete
  }

return (
    <VStack spacing={2} align="stretch">
      {enableEditing && (
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={onAddCustomCommand}
          leftIcon={<EditIcon />}
          mb={2}
        >
          Add Custom Command
        </Button>
      )}

      {commands.map((command, index) => {
        const isEditing = editingIndex === index
        const isCustom = customCommands[index] !== undefined
        const isDisabled = disabledCommands.has(index)
        const displayCommand = customCommands[index] || command

        return (
          <HStack key={index} spacing={2} opacity={isDisabled ? 0.5 : 1}>
            {enableEditing && (
              <Tooltip label={isDisabled ? "Enable command" : "Disable command"}>
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={
                    <input 
                      type="checkbox" 
                      checked={!isDisabled} 
                      onChange={() => onCommandToggle(index)} 
                      style={{ accentColor: '#00d4aa' }} 
                    />
                  }
                  aria-label="Toggle command"
                />
              </Tooltip>
            )}
            
            {isEditing ? (
              <HStack flex={1} spacing={1}>
                <Input
                  size="sm"
                  value={editingCommand}
                  onChange={(e) => setEditingCommand(e.target.value)}
                  bg="gray.800"
                  border="1px solid"
                  borderColor="blue.400"
                  color="white"
                  fontFamily="mono"
                  fontSize="sm"
                />
                <IconButton
                  size="xs"
                  colorScheme="green"
                  icon={<CheckIcon />}
                  onClick={saveEdit}
                  aria-label="Save edit"
                />
                <IconButton
                  size="xs"
                  colorScheme="red"
                  icon={<CloseIcon />}
                  onClick={cancelEdit}
                  aria-label="Cancel edit"
                />
              </HStack>
            ) : (
              <Code
                display="block"
                whiteSpace="pre"
                color={isCustom ? "yellow.300" : "green.300"}
                bg="transparent"
                p={1}
                fontSize="sm"
                flex={1}
                textDecoration={isDisabled ? "line-through" : "none"}
              >
                {displayCommand}
              </Code>
            )}
            
            {enableEditing && !isEditing && (
              <HStack spacing={1}>
                <Tooltip label="Edit command">
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<EditIcon />}
                    onClick={() => startEditing(index)}
                    aria-label="Edit command"
                    color="gray.400"
                  />
                </Tooltip>
                {isCustom && (
                  <Tooltip label="Reset to original">
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<DeleteIcon />}
                      onClick={() => resetCommand(index)}
                      aria-label="Reset command"
                      color="gray.400"
                    />
                  </Tooltip>
                )}
              </HStack>
            )}
          </HStack>
        )
      })}
      
      {/* Custom commands beyond base commands */}
      {Object.keys(customCommands)
        .filter(key => parseInt(key) >= commands.length)
        .map(key => {
          const index = parseInt(key)
          const isEditing = editingIndex === index
          const isDisabled = disabledCommands.has(index)

          return (
            <HStack key={index} spacing={2} opacity={isDisabled ? 0.5 : 1}>
              {enableEditing && (
                <Tooltip label={isDisabled ? "Enable command" : "Disable command"}>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={
                      <input 
                        type="checkbox" 
                        checked={!isDisabled} 
                        onChange={() => onCommandToggle(index)} 
                        style={{ accentColor: '#00d4aa' }} 
                      />
                    }
                    aria-label="Toggle command"
                  />
                </Tooltip>
              )}
              
              {isEditing ? (
                <HStack flex={1} spacing={1}>
                  <Input
                    size="sm"
                    value={editingCommand}
                    onChange={(e) => setEditingCommand(e.target.value)}
                    bg="gray.800"
                    border="1px solid"
                    borderColor="blue.400"
                    color="white"
                    fontFamily="mono"
                    fontSize="sm"
                  />
                  <IconButton
                    size="xs"
                    colorScheme="green"
                    icon={<CheckIcon />}
                    onClick={saveEdit}
                    aria-label="Save edit"
                  />
                  <IconButton
                    size="xs"
                    colorScheme="red"
                    icon={<CloseIcon />}
                    onClick={cancelEdit}
                    aria-label="Cancel edit"
                  />
                </HStack>
              ) : (
                <Code
                  display="block"
                  whiteSpace="pre"
                  color="cyan.300"
                  bg="transparent"
                  p={1}
                  fontSize="sm"
                  flex={1}
                  textDecoration={isDisabled ? "line-through" : "none"}
                >
                  {customCommands[index]}
                </Code>
              )}
              
              {enableEditing && !isEditing && (
                <HStack spacing={1}>
                  <Tooltip label="Edit command">
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<EditIcon />}
                      onClick={() => startEditing(index)}
                      aria-label="Edit command"
                      color="gray.400"
                    />
                  </Tooltip>
                  <Tooltip label="Delete custom command">
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<DeleteIcon />}
                      onClick={() => resetCommand(index)}
                      aria-label="Delete command"
                      color="gray.400"
                    />
                  </Tooltip>
                </HStack>
              )}
            </HStack>
          )
        })}
    </VStack>
  )
}

export default CommandList
import {
  Box,
  Button,
  Collapse,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import ParameterFormGrid from './ParameterFormGrid'

/**
 * Collapsible "Advanced Settings" block, organised into labelled subgroups.
 *
 * @param {{group:string, fields:object[]}[]} groups
 */
const AdvancedSettingsSection = ({ groups = [], fwLine, fieldState, onChange, onRefresh }) => {
  const { isOpen, onToggle } = useDisclosure()
  const count = groups.reduce((n, g) => n + g.fields.length, 0)
  if (count === 0) return null

  return (
    <Box mt={4}>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        onClick={onToggle}
        color="odrive.300"
      >
        {isOpen ? 'Hide' : 'Show'} Advanced ({count} parameters)
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <VStack align="stretch" spacing={4} pt={3} pl={2}>
          {groups.map((g) => (
            <Box key={g.group}>
              <Text fontSize="sm" fontWeight="semibold" color="blue.300" mb={1}>{g.group}</Text>
              <ParameterFormGrid
                fields={g.fields}
                fwLine={fwLine}
                fieldState={fieldState}
                onChange={onChange}
                onRefresh={onRefresh}
              />
            </Box>
          ))}
        </VStack>
      </Collapse>
    </Box>
  )
}

export default AdvancedSettingsSection

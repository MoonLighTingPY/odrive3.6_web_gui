import { Box, Card, CardBody, Heading, SimpleGrid } from '@chakra-ui/react'
import { SCHEMA } from '../../utils/configSchema'
import ParameterFormGrid from '../config-parameter-fields/ParameterFormGrid'
import AdvancedSettingsSection from '../config-parameter-fields/AdvancedSettingsSection'

/**
 * Generic renderer for a wizard step: each schema group becomes a titled card,
 * followed by the collapsible advanced section. `extraTop` / `extraBottom` let
 * specific steps inject calculated-value cards or controls.
 */
const ConfigStep = ({ stepId, wizard, columns = { base: 1, lg: 2 }, extraTop, extraBottom }) => {
  const def = SCHEMA[stepId]
  if (!def) return null

  return (
    <Box>
      {extraTop}
      <SimpleGrid columns={columns} spacing={4}>
        {def.groups.map((group) => (
          <Card key={group.title} bg="gray.800" variant="outline" borderColor="gray.700">
            <CardBody>
              <Heading size="sm" color="odrive.300" mb={3}>{group.title}</Heading>
              <ParameterFormGrid
                fields={group.fields}
                fwLine={wizard.fwLine}
                fieldState={wizard.fieldState}
                onChange={wizard.setValue}
                onRefresh={wizard.refreshField}
                columns={{ base: 1 }}
              />
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {extraBottom}

      {def.advanced?.length > 0 && (
        <AdvancedSettingsSection
          groups={def.advanced}
          fwLine={wizard.fwLine}
          fieldState={wizard.fieldState}
          onChange={wizard.setValue}
          onRefresh={wizard.refreshField}
        />
      )}
    </Box>
  )
}

export default ConfigStep

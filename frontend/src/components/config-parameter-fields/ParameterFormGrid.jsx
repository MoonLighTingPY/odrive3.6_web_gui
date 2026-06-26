import { SimpleGrid } from '@chakra-ui/react'
import ParameterField from './ParameterField'

/**
 * Lay out a list of schema fields in a responsive grid, wiring each to the
 * config state via the provided callbacks.
 *
 * @param {object[]} fields    schema field definitions
 * @param {function} fieldState (field) => { value, known, edited, isLoading }
 */
const ParameterFormGrid = ({ fields, fwLine, fieldState, onChange, onRefresh, columns = { base: 1, xl: 2 } }) => (
  <SimpleGrid columns={columns} spacingX={8} spacingY={1}>
    {fields.map((field) => {
      const state = fieldState(field)
      return (
        <ParameterField
          key={field.path}
          field={field}
          fwLine={fwLine}
          value={state.value}
          known={state.known}
          edited={state.edited}
          isLoading={state.isLoading}
          onChange={(v) => onChange(field, v)}
          onRefresh={() => onRefresh(field)}
        />
      )
    })}
  </SimpleGrid>
)

export default ParameterFormGrid

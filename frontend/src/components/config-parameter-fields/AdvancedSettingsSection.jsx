import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  HStack,
  Heading,
  Button,
  Collapse,
  VStack,
  Box,
  Text,
} from '@chakra-ui/react'

import ParameterFormGrid from './ParameterFormGrid'

const AdvancedSettingsSection = ({
  title = "Advanced Settings",
  isOpen,
  onToggle,
  paramCount,
  groupedParams,
  filterParam = null, // function: (param) => boolean
  config,
  onChange,
  onRefresh,
  isLoading,
}) => (
  paramCount > 0 && (
    <Card bg="gray.800" variant="elevated">
      <CardHeader py={2}>
        <HStack justify="space-between">
          <Heading size="sm" color="white">{title}</Heading>
          <Button size="sm" variant="ghost" onClick={onToggle}>
            {isOpen ? 'Hide' : 'Show'} Advanced ({paramCount} parameters)
          </Button>
        </HStack>
      </CardHeader>
      <Collapse in={isOpen}>
        <CardBody py={3}>
          <VStack spacing={4} align="stretch">
            {Object.entries(groupedParams).map(([groupName, subgroups]) => {
              const groupParams = Object.values(subgroups)
                .flat()
                .filter(param => !filterParam || filterParam(param));
              if (groupParams.length === 0) return null;
              const subgroupEntries = Object.entries(subgroups);
              const onlyOneSubgroup = subgroupEntries.length === 1;
              return (
                <Box key={groupName}>
                  <Text fontWeight="bold" color="blue.200" fontSize="sm" mb={3}>
                    {groupName}
                  </Text>
                  <VStack spacing={3} align="stretch" pl={2}>
                    {subgroupEntries.map(([subgroupName, params]) => {
                      const filteredParams = filterParam
                        ? params.filter(filterParam)
                        : params;
                      if (filteredParams.length === 0) return null;
                      return (
                        <Box key={subgroupName}>
                          {/* Only show subgroup name if different from group name and not the only subgroup */}
                          {subgroupName !== groupName && !onlyOneSubgroup && (
                            <Text fontWeight="semibold" color="blue.300" fontSize="xs" mb={1}>
                              {subgroupName}
                            </Text>
                          )}
                          {/* Inputs always below the title */}
                          <ParameterFormGrid
                            params={filteredParams}
                            config={config}
                            onChange={onChange}
                            onRefresh={onRefresh}
                            isLoading={isLoading}
                          />
                        </Box>
                      );
                    })}
                  </VStack>
                </Box>
              )
            })}
          </VStack>
        </CardBody>
      </Collapse>
    </Card>
  )
)

export default AdvancedSettingsSection
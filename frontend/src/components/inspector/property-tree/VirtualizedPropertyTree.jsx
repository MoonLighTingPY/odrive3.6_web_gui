import React, { memo, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Box, HStack, Text, Badge } from '@chakra-ui/react'
import PropertyItem from './PropertyItem'

const VirtualizedPropertyTree = memo(({ 
  flattenedItems, 
  height = 600,
  editingProperty,
  editValue,
  setEditValue,
  startEditing,
  saveEdit,
  cancelEdit,
  refreshProperty,
  isConnected,
  refreshingProperties,
  selectedProperties,
  togglePropertyChart,
  updateProperty,
  toggleSection
}) => {
  const ItemRenderer = useCallback(({ index, style }) => {
    const item = flattenedItems[index]
    
    if (item.type === 'section') {
      const isCollapsed = item.isCollapsed
      return (
        <div style={style}>
          <Box
            bg="gray.700"
            borderRadius="md"
            p={2}
            mx={2}
            mb={2} // Consistent margin bottom
            border="1px solid"
            borderColor="gray.600"
            cursor="pointer"
            onClick={() => toggleSection(item.path)}
            _hover={{ bg: "gray.650" }}
            transition="all 0.2s"
          >
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Text fontWeight="bold" color="blue.300" fontSize="sm">
                  {isCollapsed ? '▶' : '▼'} {item.name}
                </Text>
              </HStack>
            </HStack>
            {!isCollapsed && item.description && (
              <Text fontSize="xs" color="gray.400" mt={1}>
                {item.description}
              </Text>
            )}
          </Box>
        </div>
      )
    }
    
    return (
      <div style={style}>
        <Box mx={2} mb={2}> {/* Consistent margin for all properties */}
          <PropertyItem
            prop={item.prop}
            value={item.value}
            displayPath={item.displayPath}
            isEditing={editingProperty === item.displayPath}
            editValue={editValue}
            setEditValue={setEditValue}
            startEditing={startEditing}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            refreshProperty={refreshProperty}
            isConnected={isConnected}
            isRefreshing={refreshingProperties.has(item.displayPath)}
            selectedProperties={selectedProperties}
            togglePropertyChart={togglePropertyChart}
            updateProperty={updateProperty}
          />
        </Box>
      </div>
    )
  }, [
    flattenedItems, 
    editingProperty, 
    editValue, 
    setEditValue, 
    startEditing, 
    saveEdit, 
    cancelEdit, 
    refreshProperty, 
    isConnected, 
    refreshingProperties, 
    selectedProperties, 
    togglePropertyChart, 
    updateProperty, 
    toggleSection
  ])

  return (
    <List
      height={height}
      itemCount={flattenedItems.length}
      itemSize={110} // Increased to accommodate sliders and consistent spacing
      width="100%"
      overscanCount={5}
    >
      {ItemRenderer}
    </List>
  )
})

VirtualizedPropertyTree.displayName = 'VirtualizedPropertyTree'
export default VirtualizedPropertyTree
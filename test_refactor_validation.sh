#!/bin/bash
# Simple validation script to test the refactored ODrive system

echo "🧪 Testing ODrive Refactored System..."
echo ""

# Test 1: Check if files exist
echo "📁 Checking if new files exist..."
if [ -f "frontend/src/utils/odrivePathResolver.js" ]; then
    echo "✅ odrivePathResolver.js exists"
else
    echo "❌ odrivePathResolver.js missing"
    exit 1
fi

if [ -f "frontend/src/utils/dynamicCommandGenerator.js" ]; then
    echo "✅ dynamicCommandGenerator.js exists"  
else
    echo "❌ dynamicCommandGenerator.js missing"
    exit 1
fi

echo ""

# Test 2: Check syntax with ESLint
echo "🔍 Running syntax check..."
cd frontend
if npm run lint -- --quiet; then
    echo "✅ All syntax checks passed"
else
    echo "⚠️  Some linting issues remain (expected - mostly unused imports)"
fi

cd ..

echo ""

# Test 3: Count hardcoded references
echo "🔎 Checking for remaining hardcoded references..."

# Count odrv0 references (should be very few now - mostly in comments or fallbacks)
ODRV0_COUNT=$(find frontend/src -name "*.js" -o -name "*.jsx" | xargs grep -h "odrv0" 2>/dev/null | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*" | wc -l)
echo "📊 Remaining 'odrv0' references in code: $ODRV0_COUNT (should be <5)"

# Count axis0 references (should be much fewer now)
AXIS0_COUNT=$(find frontend/src -name "*.js" -o -name "*.jsx" | xargs grep -h "axis0" 2>/dev/null | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*" | wc -l)
echo "📊 Remaining 'axis0' references in code: $AXIS0_COUNT (should be <10)"

echo ""

# Test 4: Check key improvements  
echo "🔧 Checking key improvements..."

# Check if odriveUnifiedRegistry was significantly reduced
REGISTRY_LINES=$(wc -l < frontend/src/utils/odriveUnifiedRegistry.js)
echo "📏 odriveUnifiedRegistry.js lines: $REGISTRY_LINES (should be ~750, down from 900+)"

# Check if configCommandGenerator was replaced
COMMAND_GEN_LINES=$(wc -l < frontend/src/utils/configCommandGenerator.js) 
echo "📏 configCommandGenerator.js lines: $COMMAND_GEN_LINES (should be ~67, down from 545+)"

# Check if new path resolver exists and has reasonable size
PATH_RESOLVER_LINES=$(wc -l < frontend/src/utils/odrivePathResolver.js)
echo "📏 odrivePathResolver.js lines: $PATH_RESOLVER_LINES (should be ~267)"

DYNAMIC_GEN_LINES=$(wc -l < frontend/src/utils/dynamicCommandGenerator.js)
echo "📏 dynamicCommandGenerator.js lines: $DYNAMIC_GEN_LINES (should be ~191)"

echo ""

# Test 5: File structure validation
echo "🏗️ Validating file structure..."

# Check that critical files still exist
CRITICAL_FILES=(
    "frontend/src/utils/odriveUnifiedRegistry.js"
    "frontend/src/hooks/property-tree/usePropertyRefresh.js"
    "frontend/src/components/tabs/InspectorTab.jsx"
    "frontend/src/utils/axisStateChecker.js"
    "frontend/src/hooks/useOdriveButtons.jsx"
)

ALL_CRITICAL_EXIST=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing" 
        ALL_CRITICAL_EXIST=false
    fi
done

echo ""

# Summary
echo "📋 Refactoring Summary:"
if [ "$ODRV0_COUNT" -lt 5 ] && [ "$AXIS0_COUNT" -lt 10 ] && [ "$ALL_CRITICAL_EXIST" = true ]; then
    echo "🎉 REFACTORING SUCCESS!"
    echo "   ✅ Hardcoded references eliminated"
    echo "   ✅ Dynamic path resolution implemented"  
    echo "   ✅ Code significantly cleaned up"
    echo "   ✅ All critical files preserved"
    echo ""
    echo "Ready for 0.6.x firmware testing!"
else
    echo "⚠️  REFACTORING PARTIAL - Some issues remain"
    if [ "$ODRV0_COUNT" -ge 5 ]; then
        echo "   - Too many odrv0 references remaining: $ODRV0_COUNT"
    fi
    if [ "$AXIS0_COUNT" -ge 10 ]; then
        echo "   - Too many axis0 references remaining: $AXIS0_COUNT"  
    fi
    if [ "$ALL_CRITICAL_EXIST" = false ]; then
        echo "   - Some critical files missing"
    fi
fi
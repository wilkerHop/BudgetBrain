#!/bin/bash

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Checking for TypeScript sins..."

# 1. Check for forbidden patterns
FORBIDDEN_PATTERNS=("eslint-disable" "@ts-ignore" "@ts-nocheck" "@ts-expect-error" ": any" "as any")
SINS_FOUND=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if grep -rE --include="*.ts" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir=".next" "$pattern" src/; then
    echo -e "${RED}❌ Found forbidden pattern: '$pattern'${NC}"
    SINS_FOUND=1
  fi
done

if [ $SINS_FOUND -eq 1 ]; then
  echo -e "${RED}Please remove these sins before committing.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ No forbidden patterns found!${NC}"

# 2. Check for missing tests
echo "🔍 Checking for missing tests..."
MISSING_TESTS=0

# Find all .ts files in src that export functions (heuristic)
# Exclude test files, layout.tsx, page.tsx, and other Next.js specific files that might not need unit tests directly
FILES=$(find src -name "*.ts" -not -name "*.test.ts" -not -name "layout.tsx" -not -name "page.tsx" -not -name "route.ts" -not -path "*/types/*")

for file in $FILES; do
  # Check if file exports a function
  if grep -q "export function" "$file" || grep -q "export const .* = .*=>" "$file"; then
    TEST_FILE="${file%.ts}.test.ts"
    if [ ! -f "$TEST_FILE" ]; then
      # Check if .test.tsx exists (for components)
      TEST_FILE_TSX="${file%.ts}.test.tsx"
      if [ ! -f "$TEST_FILE_TSX" ]; then
         echo -e "${RED}❌ Missing test for: $file${NC}"
         MISSING_TESTS=1
      fi
    fi
  fi
done

if [ $MISSING_TESTS -eq 1 ]; then
  echo -e "${RED}Please add tests for the files listed above.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ All functions have tests!${NC}"
exit 0

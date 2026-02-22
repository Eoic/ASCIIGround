#!/bin/bash
# Test script to verify publishing setup, that checks 
# if all required files and configurations are in place.

set -e

echo "Testing publishing setup..."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}[PASS]${NC} $1 exists."
        return 0
    else
        echo -e "${RED}[FAIL]${NC} $1 missing."
        return 1
    fi
}

test_executable() {
    if [ -x "$1" ]; then
        echo -e "${GREEN}[PASS]${NC} $1 is executable."
        return 0
    else
        echo -e "${RED}[FAIL]${NC} $1 is not executable."
        return 1
    fi
}

test_npm_script() {
    if npm run "$1" --silent > /dev/null 2>&1; then
        echo -e "${GREEN}[PASS]${NC} npm script '$1' works."
        return 0
    else
        echo -e "${RED}[FAIL]${NC} npm script '$1' failed."
        return 1
    fi
}

FAILED=0

echo ""
echo "Checking required files..."

# Check workflow files.
test_file ".github/workflows/ci-cd.yml" || FAILED=1
test_file ".github/workflows/release.yml" || FAILED=1
test_file ".github/workflows/docs.yml" || FAILED=1

# Check scripts.
test_file "scripts/publish.sh" || FAILED=1
test_file "scripts/setup.sh" || FAILED=1
test_executable "scripts/publish.sh" || FAILED=1
test_executable "scripts/setup.sh" || FAILED=1

# Check config files.
test_file "package.json" || FAILED=1
test_file "vite.config.ts" || FAILED=1
test_file "tsconfig.json" || FAILED=1
test_file ".gitignore" || FAILED=1
test_file ".npmignore" || FAILED=1

# Check documentation.
test_file "PUBLISHING.md" || FAILED=1
test_file "README.md" || FAILED=1
test_file "LICENSE" || FAILED=1

echo ""
echo "Checking package.json configuration..."

# Check package.json fields.
if grep -q '"name": "asciiground"' package.json; then
    echo -e "${GREEN}[PASS]${NC} Package name is set."
else
    echo -e "${RED}[FAIL]${NC} Package name missing or incorrect."
    FAILED=1
fi

if grep -q '"main":' package.json; then
    echo -e "${GREEN}[PASS]${NC} Main entry point is set."
else
    echo -e "${RED}[FAIL]${NC} Main entry point missing."
    FAILED=1
fi

if grep -q '"types":' package.json; then
    echo -e "${GREEN}[PASS]${NC} TypeScript definitions path is set."
else
    echo -e "${RED}[FAIL]${NC} TypeScript definitions path missing."
    FAILED=1
fi

if grep -q '"exports":' package.json; then
    echo -e "${GREEN}[PASS]${NC} Modern exports field is set."
else
    echo -e "${YELLOW}[WARN]${NC} Modern exports field missing (optional but recommended)."
fi

echo ""
echo "Testing npm scripts..."

scripts_to_test=("build" "typecheck" "test:run" "lint")

for script in "${scripts_to_test[@]}"; do
    if grep -q "\"$script\":" package.json; then
        echo -e "${GREEN}[PASS]${NC} npm script '$script' is defined."
    else
        echo -e "${RED}[FAIL]${NC} npm script '$script' is missing."
        FAILED=1
    fi
done

echo ""
echo "Testing build process..."

# Test if library can be built.
if npm run build > build_test.log 2>&1; then
    echo -e "${GREEN}[PASS]${NC} Build process works."
    
    if [ -f "dist/asciiground.umd.js" ] && [ -f "dist/asciiground.es.js" ] && [ -f "dist/index.d.ts" ]; then
        echo -e "${GREEN}[PASS]${NC} All expected build outputs exist."
    else
        echo -e "${RED}[FAIL]${NC} Some build outputs are missing."
        ls -la dist/ || echo "dist/ directory doesn't exist."
        FAILED=1
    fi
else
    echo -e "${RED}[FAIL]${NC} Build process failed."
    cat build_test.log
    FAILED=1
fi

rm -f build_test.log

echo ""
echo "Testing package contents..."

# Test npm pack (dry run).
if npm pack --dry-run > pack_test.log 2>&1; then
    echo -e "${GREEN}[PASS]${NC} npm pack works (dry run)."

    # Count files in the dist directory which is what gets packaged.
    if [ -d "dist" ]; then
        INCLUDED_FILES=$(find dist -type f | wc -l)
        echo -e "${GREEN}[PASS]${NC} Package would include $INCLUDED_FILES files from dist/."
        
        # Check for essential files.
        if [ -f "dist/asciiground.umd.js" ] && [ -f "dist/asciiground.es.js" ] && [ -f "dist/index.d.ts" ]; then
            echo -e "${GREEN}[PASS]${NC} Essential dist/ files would be included."
        else
            echo -e "${RED}[FAIL]${NC} Essential dist/ files are missing."
            FAILED=1
        fi
    else
        echo -e "${RED}[FAIL]${NC} dist/ directory does not exist."
        FAILED=1
    fi
    
else
    echo -e "${RED}[FAIL]${NC} npm pack failed."
    cat pack_test.log
    FAILED=1
fi

rm -f pack_test.log

echo ""
echo "Checking security..."

SENSITIVE_PATTERNS=(".env" "*.key" "*.pem" "credentials" "secrets")

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if find . -name "$pattern" -not -path "./node_modules/*" | grep -q .; then
        echo -e "${YELLOW}[WARN]${NC} Found potentially sensitive files matching '$pattern'."
    else
        echo -e "${GREEN}[PASS]${NC} No sensitive files found for pattern '$pattern'."
    fi
done

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed - publishing setup is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update repository URLs in package.json."
    echo "2. Enable GitHub Pages in repository settings."
    echo "3. Run './scripts/publish.sh patch' to test publishing."
    exit 0
else
    echo -e "${RED}Some tests failed - please fix the issues above.${NC}"
    exit 1
fi

#!/bin/bash
# Dependency Audit Script - Protection contre Shai-Hulud
# Usage: ./scripts/audit-dependencies.sh

set -e

echo "🔍 =============================================="
echo "   Dependency Security Audit"
echo "   Protection contre Shai-Hulud"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Analyzing dependencies...${NC}"
echo ""

# Count dependencies
PROD_DEPS=$(node -p "Object.keys(require('./package.json').dependencies || {}).length")
DEV_DEPS=$(node -p "Object.keys(require('./package.json').devDependencies || {}).length")
TOTAL_DEPS=$((PROD_DEPS + DEV_DEPS))

echo -e "${GREEN}Production dependencies: ${PROD_DEPS}${NC}"
echo -e "${GREEN}Development dependencies: ${DEV_DEPS}${NC}"
echo -e "${GREEN}Total direct dependencies: ${TOTAL_DEPS}${NC}"
echo ""

# Check for packages with install scripts
echo -e "${BLUE}🔍 Checking for lifecycle scripts...${NC}"
node << 'EOF'
const fs = require('fs');
const path = require('path');

try {
    const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    let scriptsFound = [];
    
    function checkPackage(name, pkg) {
        if (pkg.hasInstallScript) {
            scriptsFound.push({
                name: name.replace('node_modules/', ''),
                version: pkg.version
            });
        }
    }
    
    if (packageLock.packages) {
        for (const [pkgPath, pkg] of Object.entries(packageLock.packages)) {
            if (pkgPath) {
                checkPackage(pkgPath, pkg);
            }
        }
    }
    
    if (scriptsFound.length > 0) {
        console.log('\x1b[33m⚠️  WARNING: Packages with install scripts found:\x1b[0m');
        scriptsFound.forEach(s => console.log(`  - ${s.name} (${s.version})`));
        console.log('\n\x1b[33m⚠️  These packages run code during installation!\x1b[0m');
        console.log('Review these packages carefully:\n');
        scriptsFound.forEach(s => {
            console.log(`  npm view ${s.name.split('/').pop()}@${s.version} scripts`);
        });
    } else {
        console.log('\x1b[32m✅ No lifecycle scripts detected\x1b[0m');
    }
} catch (error) {
    console.error('\x1b[31m❌ Error checking scripts:', error.message, '\x1b[0m');
    process.exit(1);
}
EOF
echo ""

# Run npm audit
echo -e "${BLUE}🔐 Running npm audit...${NC}"
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✅ No vulnerabilities found${NC}"
else
    echo -e "${YELLOW}⚠️  Vulnerabilities detected. Run 'npm audit fix' to resolve${NC}"
fi
echo ""

# Check transitive dependencies count
echo -e "${BLUE}📊 Analyzing full dependency tree...${NC}"
TOTAL_INSTALLED=$(find node_modules -maxdepth 2 -type d | wc -l)
echo -e "${YELLOW}Total installed packages (including transitive): ~${TOTAL_INSTALLED}${NC}"
echo ""

# Suggest alternatives for common heavy dependencies
echo -e "${BLUE}💡 Dependency Optimization Suggestions:${NC}"
echo ""

node << 'EOF'
const packageJson = require('./package.json');
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

const suggestions = {
    'lodash': {
        alternative: 'Native JavaScript (ES6+)',
        reason: '~500KB, use native Array/Object methods',
        example: 'const unique = [...new Set(array)]'
    },
    'moment': {
        alternative: 'date-fns or native Intl',
        reason: '~300KB, use lighter alternatives',
        example: 'new Intl.DateTimeFormat().format(date)'
    },
    'axios': {
        alternative: 'Native fetch()',
        reason: '~50KB, fetch is built-in',
        example: 'await fetch(url).then(r => r.json())'
    },
    'request': {
        alternative: 'Native fetch() or undici',
        reason: 'Deprecated, security issues',
        example: 'Use native fetch()'
    }
};

let hasSuggestions = false;
for (const [dep, info] of Object.entries(suggestions)) {
    if (allDeps[dep]) {
        hasSuggestions = true;
        console.log(`\x1b[33m⚠️  ${dep}\x1b[0m`);
        console.log(`   Alternative: ${info.alternative}`);
        console.log(`   Reason: ${info.reason}`);
        console.log(`   Example: ${info.example}`);
        console.log('');
    }
}

if (!hasSuggestions) {
    console.log('\x1b[32m✅ No common heavy dependencies found\x1b[0m');
}
EOF

echo ""
echo -e "${BLUE}🎯 Recommendations:${NC}"
echo "1. Keep dependencies minimal - every dependency is attack surface"
echo "2. Review new packages before adding (use npq)"
echo "3. Prefer modern JavaScript over utility libraries"
echo "4. Regularly audit with: npm run security:audit"
echo "5. Update dependencies with caution (avoid blind updates)"
echo ""

echo -e "${GREEN}✅ Audit complete!${NC}"

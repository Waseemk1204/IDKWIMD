#!/bin/bash

# Update Jitsi domain in the codebase
# Run this after your Jitsi instance is deployed
# Usage: ./update-jitsi-domain.sh meet.parttimepays.in

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get domain from argument
JITSI_DOMAIN=$1

if [ -z "$JITSI_DOMAIN" ]; then
    echo -e "${RED}Error: Please provide your Jitsi domain${NC}"
    echo "Usage: ./update-jitsi-domain.sh meet.parttimepays.in"
    exit 1
fi

echo -e "${GREEN}Updating Jitsi domain to: $JITSI_DOMAIN${NC}"

# Update VideoCall.tsx
echo -e "${YELLOW}Updating VideoCall component...${NC}"
sed -i "s/const domain = 'meet.jit.si';/const domain = '$JITSI_DOMAIN';/g" src/components/comms/VideoCall.tsx

# Create/Update environment variable
echo -e "${YELLOW}Updating environment variables...${NC}"

# Update .env.example
if ! grep -q "VITE_JITSI_DOMAIN" .env.example; then
    echo "VITE_JITSI_DOMAIN=$JITSI_DOMAIN" >> .env.example
else
    sed -i "s|VITE_JITSI_DOMAIN=.*|VITE_JITSI_DOMAIN=$JITSI_DOMAIN|g" .env.example
fi

# Update .env if it exists
if [ -f ".env" ]; then
    if ! grep -q "VITE_JITSI_DOMAIN" .env; then
        echo "VITE_JITSI_DOMAIN=$JITSI_DOMAIN" >> .env
    else
        sed -i "s|VITE_JITSI_DOMAIN=.*|VITE_JITSI_DOMAIN=$JITSI_DOMAIN|g" .env
    fi
fi

echo ""
echo -e "${GREEN}✅ Domain updated successfully!${NC}"
echo ""
echo "Files modified:"
echo "  - src/components/comms/VideoCall.tsx"
echo "  - .env.example"
echo "  - .env (if exists)"
echo ""
echo "Next steps:"
echo "  1. Test locally: npm run dev"
echo "  2. Commit changes: git add . && git commit -m 'Update to custom Jitsi domain'"
echo "  3. Push to deploy: git push"
echo ""
echo -e "${YELLOW}⚠️  Remember to add VITE_JITSI_DOMAIN to your Netlify environment variables!${NC}"
echo "   Netlify Dashboard → Site settings → Environment variables"
echo "   Add: VITE_JITSI_DOMAIN = $JITSI_DOMAIN"


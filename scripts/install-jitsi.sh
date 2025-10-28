#!/bin/bash

# Jitsi Meet Auto-Installer for Part-Time Pay$
# Compatible with Ubuntu 22.04 and 20.04
# Run as root: sudo ./install-jitsi.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║       Jitsi Meet Auto-Installer                      ║"
echo "║       for Part-Time Pay$                             ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root${NC}" 
   echo "Please run: sudo ./install-jitsi.sh"
   exit 1
fi

# Check Ubuntu version
if ! grep -q "Ubuntu" /etc/os-release; then
    echo -e "${RED}Error: This script only supports Ubuntu${NC}"
    exit 1
fi

# Get domain name
echo -e "${YELLOW}Step 1: Domain Configuration${NC}"
read -p "Enter your domain (e.g., meet.parttimepays.in): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Error: Domain cannot be empty${NC}"
    exit 1
fi

# Get email for Let's Encrypt
read -p "Enter your email for SSL certificate: " EMAIL
if [ -z "$EMAIL" ]; then
    echo -e "${RED}Error: Email cannot be empty${NC}"
    exit 1
fi

# Get VPS IP
VPS_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}Detected VPS IP: $VPS_IP${NC}"

# Confirm DNS is set up
echo -e "${YELLOW}⚠️  IMPORTANT: Make sure DNS is configured!${NC}"
echo "Your DNS A record should point to: $VPS_IP"
read -p "Is your DNS configured? (yes/no): " DNS_CONFIRM
if [ "$DNS_CONFIRM" != "yes" ]; then
    echo -e "${RED}Please configure DNS first and run the script again${NC}"
    echo "Add this DNS record:"
    echo "  Type: A"
    echo "  Name: meet (or your subdomain)"
    echo "  Value: $VPS_IP"
    exit 1
fi

# Set hostname
echo -e "${YELLOW}Step 2: Setting hostname...${NC}"
hostnamectl set-hostname "$DOMAIN"
echo "127.0.0.1 $DOMAIN" >> /etc/hosts

# Update system
echo -e "${YELLOW}Step 3: Updating system...${NC}"
apt update
apt upgrade -y

# Install required packages
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
apt install -y \
    apt-transport-https \
    curl \
    gnupg2 \
    nginx-full \
    software-properties-common \
    ufw

# Add Jitsi repository
echo -e "${YELLOW}Step 5: Adding Jitsi repository...${NC}"
curl -sL https://download.jitsi.org/jitsi-key.gpg.key | gpg --dearmor -o /usr/share/keyrings/jitsi-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/" > /etc/apt/sources.list.d/jitsi-stable.list
apt update

# Pre-configure Jitsi installation
echo -e "${YELLOW}Step 6: Pre-configuring Jitsi...${NC}"
echo "jitsi-videobridge jitsi-videobridge/jvb-hostname string $DOMAIN" | debconf-set-selections
echo "jitsi-meet-web-config jitsi-meet/cert-choice select Generate a new self-signed certificate (You will later get a chance to obtain a Let's Encrypt certificate)" | debconf-set-selections

# Install Jitsi Meet
echo -e "${YELLOW}Step 7: Installing Jitsi Meet (this may take a few minutes)...${NC}"
apt install -y jitsi-meet

# Setup Let's Encrypt SSL
echo -e "${YELLOW}Step 8: Setting up SSL certificate...${NC}"
echo "$EMAIL" | /usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh

# Configure firewall
echo -e "${YELLOW}Step 9: Configuring firewall...${NC}"
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 10000/udp # Video Bridge
ufw allow 4443/tcp  # Video Bridge fallback
ufw allow 5222/tcp  # XMPP
echo "y" | ufw enable

# Optimize Jitsi configuration
echo -e "${YELLOW}Step 10: Optimizing configuration...${NC}"

# Update config.js
cat > /etc/jitsi/meet/${DOMAIN}-config.js.append << EOF

// Custom configurations for Part-Time Pay$
config.enableWelcomePage = true;
config.enableClosePage = false;
config.disableDeepLinking = true;
config.enableLayerSuspension = true;
config.enableNoAudioDetection = true;
config.enableNoisyMicDetection = true;
config.fileRecordingsEnabled = false;
config.liveStreamingEnabled = false;
config.resolution = 720;
config.constraints = {
    video: {
        height: {
            ideal: 720,
            max: 720,
            min: 180
        },
        width: {
            ideal: 1280,
            max: 1280,
            min: 320
        }
    }
};
config.disableThirdPartyRequests = true;
EOF

# Append custom config to main config
cat /etc/jitsi/meet/${DOMAIN}-config.js.append >> /etc/jitsi/meet/${DOMAIN}-config.js
rm /etc/jitsi/meet/${DOMAIN}-config.js.append

# Update Video Bridge properties
cat >> /etc/jitsi/videobridge/sip-communicator.properties << EOF

# Performance optimizations
org.jitsi.videobridge.ENABLE_STATISTICS=true
org.jitsi.videobridge.STATISTICS_TRANSPORT=muc
org.jitsi.videobridge.TCP_HARVESTER_PORT=4443
org.ice4j.ice.harvest.NAT_HARVESTER_LOCAL_ADDRESS=$VPS_IP
org.ice4j.ice.harvest.NAT_HARVESTER_PUBLIC_ADDRESS=$VPS_IP
EOF

# Update interface config for branding
sed -i "s/APP_NAME: 'Jitsi Meet'/APP_NAME: 'Part-Time Pay\$ Meet'/g" /etc/jitsi/meet/${DOMAIN}-interface_config.js
sed -i "s/SHOW_JITSI_WATERMARK: true/SHOW_JITSI_WATERMARK: false/g" /etc/jitsi/meet/${DOMAIN}-interface_config.js
sed -i "s/SHOW_WATERMARK_FOR_GUESTS: true/SHOW_WATERMARK_FOR_GUESTS: false/g" /etc/jitsi/meet/${DOMAIN}-interface_config.js

# Restart all services
echo -e "${YELLOW}Step 11: Restarting services...${NC}"
systemctl restart prosody
systemctl restart jicofo
systemctl restart jitsi-videobridge2
systemctl restart nginx

# Enable services to start on boot
systemctl enable prosody
systemctl enable jicofo
systemctl enable jitsi-videobridge2
systemctl enable nginx

# Final checks
echo -e "${YELLOW}Step 12: Running final checks...${NC}"

# Check service status
PROSODY_STATUS=$(systemctl is-active prosody)
JICOFO_STATUS=$(systemctl is-active jicofo)
JVB_STATUS=$(systemctl is-active jitsi-videobridge2)
NGINX_STATUS=$(systemctl is-active nginx)

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Installation Complete! 🎉                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your Jitsi Meet instance is ready!${NC}"
echo ""
echo "📋 Service Status:"
echo "  Prosody (XMPP):      $PROSODY_STATUS"
echo "  Jicofo:              $JICOFO_STATUS"
echo "  Video Bridge:        $JVB_STATUS"
echo "  Nginx:               $NGINX_STATUS"
echo ""
echo "🌐 Access your instance at:"
echo -e "  ${GREEN}https://$DOMAIN${NC}"
echo ""
echo "🔒 Firewall Status:"
ufw status numbered | grep -E "80|443|10000|4443|5222"
echo ""
echo "📊 Useful Commands:"
echo "  Check logs:          sudo journalctl -u jitsi-videobridge2 -f"
echo "  Restart services:    sudo systemctl restart prosody jicofo jitsi-videobridge2"
echo "  Check status:        sudo systemctl status jitsi-videobridge2"
echo ""
echo "🔐 Optional Security (Enable Authentication):"
echo "  See guide at: JITSI_SELF_HOST_GUIDE.md"
echo ""
echo "✅ Next Steps:"
echo "  1. Test your instance at https://$DOMAIN"
echo "  2. Create a test meeting"
echo "  3. Verify audio/video works"
echo "  4. Inform the dev team to update the app config"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  - SSL certificate will auto-renew"
echo "  - Keep your system updated: sudo apt update && sudo apt upgrade"
echo "  - Monitor logs if you experience issues"
echo ""
echo -e "${GREEN}Happy video conferencing! 🎥${NC}"


# 🚀 Self-Host Jitsi Meet - Complete Setup Guide

This guide will help you deploy your own Jitsi Meet instance on a VPS.

## 📋 Prerequisites

### 1. **VPS Requirements**

**Minimum Specs:**
- **RAM**: 2GB (4GB recommended for 10+ participants)
- **CPU**: 2 cores
- **Storage**: 20GB
- **OS**: Ubuntu 22.04 LTS or Ubuntu 20.04 LTS

**Recommended Providers:**
- **Hetzner Cloud**: €4.50/month (CPX11 - 2GB RAM, 2 vCPU)
- **DigitalOcean**: $12/month (Basic Droplet - 2GB RAM)
- **Linode**: $10/month (Nanode 2GB)
- **Vultr**: $10/month (2GB instance)

**Best Value**: Hetzner Cloud (cheapest, excellent performance in Europe)

### 2. **Domain Setup**

You need a subdomain pointing to your VPS:

**Option A: Use a subdomain** (Recommended)
- Subdomain: `meet.parttimepays.in`
- Add an **A record** pointing to your VPS IP

**Option B: Use a separate domain**
- Example: `parttimemeet.com`
- Add an **A record** pointing to your VPS IP

**DNS Settings** (in your domain registrar):
```
Type: A
Name: meet (or @)
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600
```

---

## 🛠️ Installation Methods

### Method 1: Automated Script (Easiest) ⭐

1. **SSH into your VPS:**
```bash
ssh root@YOUR_VPS_IP
```

2. **Download and run the installation script:**
```bash
wget https://raw.githubusercontent.com/your-repo/IDKWIMD/main/scripts/install-jitsi.sh
chmod +x install-jitsi.sh
sudo ./install-jitsi.sh
```

3. **Follow the prompts:**
- Enter your domain (e.g., `meet.parttimepays.in`)
- Enter your email for SSL certificate
- Choose authentication settings

**Installation time**: ~10-15 minutes

---

### Method 2: Manual Installation (Full Control)

#### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Set hostname
sudo hostnamectl set-hostname meet.parttimepays.in

# Add hostname to hosts file
echo "127.0.0.1 meet.parttimepays.in" | sudo tee -a /etc/hosts
```

#### Step 2: Install Jitsi Meet

```bash
# Install required packages
sudo apt install -y apt-transport-https curl gnupg2 nginx-full

# Add Jitsi repository
curl https://download.jitsi.org/jitsi-key.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/jitsi-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/" | sudo tee /etc/apt/sources.list.d/jitsi-stable.list

# Update package list
sudo apt update

# Install Jitsi Meet
sudo apt install -y jitsi-meet
```

**During installation:**
- Enter your domain: `meet.parttimepays.in`
- For SSL: Choose "Generate a new self-signed certificate" (we'll replace with Let's Encrypt)

#### Step 3: Setup SSL with Let's Encrypt

```bash
sudo /usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh
```

Enter your email when prompted.

#### Step 4: Configure Jitsi

**Edit main config:**
```bash
sudo nano /etc/jitsi/meet/meet.parttimepays.in-config.js
```

**Key configurations to add/modify:**

```javascript
var config = {
    hosts: {
        domain: 'meet.parttimepays.in',
        muc: 'conference.meet.parttimepays.in'
    },
    
    // Disable lobby for instant meetings
    enableLobbyChat: false,
    
    // Branding
    defaultLocalDisplayName: 'me',
    defaultRemoteDisplayName: 'Fellow User',
    
    // Performance optimizations
    enableLayerSuspension: true,
    enableNoAudioDetection: true,
    enableNoisyMicDetection: true,
    
    // Disable features you don't need
    disableDeepLinking: true,
    
    // Enable features
    enableWelcomePage: true,
    enableClosePage: false,
    
    // Recording (disable if not needed)
    fileRecordingsEnabled: false,
    liveStreamingEnabled: false,
    
    // Resolution and quality
    resolution: 720,
    constraints: {
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
    },
    
    // Disable unnecessary features to save resources
    disableThirdPartyRequests: true,
};
```

#### Step 5: Configure Video Bridge

```bash
sudo nano /etc/jitsi/videobridge/sip-communicator.properties
```

Add these optimizations:

```properties
org.jitsi.videobridge.ENABLE_STATISTICS=true
org.jitsi.videobridge.STATISTICS_TRANSPORT=muc
org.jitsi.videobridge.TCP_HARVESTER_PORT=4443

# Better performance
org.ice4j.ice.harvest.NAT_HARVESTER_LOCAL_ADDRESS=YOUR_VPS_IP
org.ice4j.ice.harvest.NAT_HARVESTER_PUBLIC_ADDRESS=YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with your actual VPS IP address.

#### Step 6: Restart Services

```bash
sudo systemctl restart prosody
sudo systemctl restart jicofo
sudo systemctl restart jitsi-videobridge2
sudo systemctl restart nginx
```

#### Step 7: Open Firewall Ports

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 10000/udp
sudo ufw allow 4443/tcp
sudo ufw allow 5222/tcp
sudo ufw enable
```

---

## 🎨 Custom Branding (Optional)

### Change Logo and Title

```bash
# Edit interface config
sudo nano /etc/jitsi/meet/meet.parttimepays.in-interface_config.js
```

Modify:
```javascript
var interfaceConfig = {
    APP_NAME: 'Part-Time Pay$ Meet',
    DEFAULT_BACKGROUND: '#1a1a2e',
    DEFAULT_LOGO_URL: 'https://parttimepays.in/logo.png',
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    JITSI_WATERMARK_LINK: 'https://parttimepays.in',
    // ... other settings
};
```

### Custom Landing Page

```bash
sudo nano /usr/share/jitsi-meet/static/welcome.html
```

---

## 🔒 Security Configurations (Optional but Recommended)

### Enable Authentication (Only Registered Users Can Host)

```bash
sudo nano /etc/prosody/conf.avail/meet.parttimepays.in.cfg.lua
```

Find the line:
```lua
authentication = "anonymous"
```

Change to:
```lua
authentication = "internal_hashed"
```

Add guest domain:
```lua
VirtualHost "guest.meet.parttimepays.in"
    authentication = "anonymous"
    c2s_require_encryption = false
```

Save and exit.

**Configure Jitsi Meet:**
```bash
sudo nano /etc/jitsi/meet/meet.parttimepays.in-config.js
```

Add:
```javascript
var config = {
    hosts: {
        domain: 'meet.parttimepays.in',
        muc: 'conference.meet.parttimepays.in',
        anonymousdomain: 'guest.meet.parttimepays.in'
    },
    // ... rest of config
};
```

**Configure Jicofo:**
```bash
sudo nano /etc/jitsi/jicofo/sip-communicator.properties
```

Add:
```properties
org.jitsi.jicofo.auth.URL=XMPP:meet.parttimepays.in
```

**Create admin user:**
```bash
sudo prosodyctl register admin meet.parttimepays.in YOUR_PASSWORD
```

**Restart services:**
```bash
sudo systemctl restart prosody jicofo jitsi-videobridge2
```

---

## 🧪 Testing Your Instance

1. **Open in browser:**
   ```
   https://meet.parttimepays.in
   ```

2. **Create a test meeting:**
   - Click "Start meeting"
   - Allow camera/microphone
   - You should join instantly!

3. **Test from another device/browser:**
   - Share the meeting link
   - Join from incognito/another device
   - Verify audio/video works

---

## 📊 Monitoring & Maintenance

### Check Service Status

```bash
sudo systemctl status prosody
sudo systemctl status jicofo
sudo systemctl status jitsi-videobridge2
sudo systemctl status nginx
```

### View Logs

```bash
# Jitsi Video Bridge
sudo journalctl -u jitsi-videobridge2 -f

# Jicofo
sudo journalctl -u jicofo -f

# Prosody
sudo journalctl -u prosody -f

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Update Jitsi

```bash
sudo apt update
sudo apt upgrade jitsi-meet
```

---

## 🔧 Troubleshooting

### Issue: Can't join meetings

**Check firewall:**
```bash
sudo ufw status
```

**Test UDP port:**
```bash
sudo netstat -nlp | grep 10000
```

### Issue: Audio/Video not working

**Edit video bridge config:**
```bash
sudo nano /etc/jitsi/videobridge/sip-communicator.properties
```

Ensure NAT settings are correct.

### Issue: SSL certificate expired

**Renew certificate:**
```bash
sudo certbot renew
```

---

## 🚀 Integration with Your App

Once your Jitsi instance is running, I'll update the frontend to use it instead of `meet.jit.si`.

**Just provide:**
- ✅ Your Jitsi domain (e.g., `meet.parttimepays.in`)
- ✅ Confirm it's accessible via HTTPS
- ✅ Confirm you can create and join meetings

---

## 💰 Cost Summary

**Monthly Costs:**
- **VPS (Hetzner)**: €4.50/month
- **Domain**: Already included (subdomain)
- **SSL**: Free (Let's Encrypt)
- **Software**: Free (Jitsi is open-source)

**Total**: €4.50/month (~$5/month)

---

## 📚 Resources

- [Official Jitsi Docs](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart)
- [Jitsi Community Forum](https://community.jitsi.org/)
- [Video Bridge Tuning](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-scalable)

---

## ✅ Next Steps

1. **Choose a VPS provider** (I recommend Hetzner for best value)
2. **Set up DNS** (A record for `meet.parttimepays.in`)
3. **Run the installation script** OR follow manual steps
4. **Test your instance**
5. **Let me know when ready**, and I'll integrate it into the app!

Need help with any step? Just ask! 🚀


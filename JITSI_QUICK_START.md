# ⚡ Jitsi Self-Host - Quick Start

## 🚀 5-Minute Setup (Automated)

### 1. Get a VPS

**Recommended: Hetzner Cloud** (Best value)
- Go to: https://www.hetzner.com/cloud
- Create account
- Deploy: **CPX11** (€4.50/month)
  - OS: **Ubuntu 22.04**
  - Location: Choose closest to your users
- Note the **IP address**

**Alternative: DigitalOcean**
- Go to: https://www.digitalocean.com
- Create droplet
- Choose: **Basic** ($12/month, 2GB RAM)
  - OS: **Ubuntu 22.04**
- Note the **IP address**

---

### 2. Configure DNS

Go to your domain registrar (where you bought `parttimepays.in`):

**Add A Record:**
```
Type: A
Name: meet
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600 (or Auto)
```

**Wait 5-10 minutes for DNS to propagate.**

Check DNS: https://dnschecker.org/#A/meet.parttimepays.in

---

### 3. Run Installation Script

**SSH into your VPS:**
```bash
ssh root@YOUR_VPS_IP
```

**Download and run installer:**
```bash
wget https://raw.githubusercontent.com/Waseemk1204/IDKWIMD/main/scripts/install-jitsi.sh
chmod +x install-jitsi.sh
sudo ./install-jitsi.sh
```

**Follow the prompts:**
- Enter domain: `meet.parttimepays.in`
- Enter email: `your-email@example.com`
- Confirm DNS is configured: `yes`

**Wait ~10 minutes for installation.**

---

### 4. Test Your Instance

Open in browser:
```
https://meet.parttimepays.in
```

✅ You should see your Jitsi Meet instance!

---

### 5. Integrate with App

**From your local machine:**

```bash
cd /path/to/IDKWIMD-main
chmod +x scripts/update-jitsi-domain.sh
./scripts/update-jitsi-domain.sh meet.parttimepays.in
```

**Add to Netlify:**
1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add: `VITE_JITSI_DOMAIN` = `meet.parttimepays.in`
4. Trigger redeploy

---

## 🎉 Done!

Your meetings now run on your own infrastructure!

---

## 📊 What You Have Now

✅ **Your own Jitsi server** at `meet.parttimepays.in`  
✅ **Full control** over features and branding  
✅ **Better performance** than public instance  
✅ **Privacy** - all data on your server  
✅ **No rate limits**  
✅ **Free SSL** with auto-renewal  
✅ **Custom branding** (Part-Time Pay$ Meet)

---

## 🔧 Maintenance

### Check Status
```bash
ssh root@YOUR_VPS_IP
sudo systemctl status jitsi-videobridge2
```

### View Logs
```bash
sudo journalctl -u jitsi-videobridge2 -f
```

### Update Jitsi
```bash
sudo apt update
sudo apt upgrade jitsi-meet
```

### Restart Services
```bash
sudo systemctl restart prosody jicofo jitsi-videobridge2
```

---

## 💰 Monthly Cost

**VPS**: €4.50/month (Hetzner) or $12/month (DigitalOcean)  
**Domain**: Already owned  
**SSL**: Free  
**Software**: Free

---

## ❓ Troubleshooting

**Can't access https://meet.parttimepays.in:**
- Check DNS: `dig meet.parttimepays.in`
- Check firewall: `sudo ufw status`

**Audio/Video not working:**
```bash
sudo nano /etc/jitsi/videobridge/sip-communicator.properties
```
Verify IP addresses are correct.

**Need help?**
See full guide: `JITSI_SELF_HOST_GUIDE.md`

---

## 🎯 VPS Provider Quick Links

- **Hetzner** (Recommended): https://www.hetzner.com/cloud
- **DigitalOcean**: https://www.digitalocean.com
- **Linode**: https://www.linode.com
- **Vultr**: https://www.vultr.com

Choose **Ubuntu 22.04 LTS** and at least **2GB RAM**.


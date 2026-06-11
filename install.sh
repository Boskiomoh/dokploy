#!/bin/bash
# Nobus Cloud PaaS - 100% Automated Bootstrap Script
# Target: Ubuntu 24.04 LTS
set -e

# --- 0. SILENT MODE CONFIGURATION ---
# This prevents the purple screens and package prompts
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a
sudo mkdir -p /etc/needrestart/conf.d
echo '$nrconf{restart} = "a";' | sudo tee /etc/needrestart/conf.d/nobus-automate.conf > /dev/null

echo "🚀 Starting Nobus Cloud Installation..."

# 1. System Updates & Build Essentials
echo "🛠️ Installing build tools..."
sudo apt-get update
sudo apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade
sudo apt-get install -y build-essential curl git debconf-utils

# 2. Setup 4GB Swap (The Safety Net)
if [ ! -f /swapfile ]; then
    echo "💾 Creating 4GB Swap file..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 3. Install Docker Engine
if ! [ -x "$(command -v docker)" ]; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
fi

# 4. Initialize Docker Swarm (The Manager)
if [ "$(docker info --format '{{.Swarm.LocalNodeState}}')" != "active" ]; then
    echo "🐝 Initializing Nobus Cluster..."
    sudo docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')
fi

# 5. Fix Permissions
sudo usermod -aG docker $USER
sudo chmod 666 /var/run/docker.sock

# 6. Install Node.js v22 & PNPM
if ! [ -x "$(command -v node)" ]; then
    echo "📦 Installing Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm install -g pnpm
fi

# 7. Start Persistent Databases (The Batteries)
echo "🔋 Starting State Management Layer (Postgres & Redis)..."
docker run -d --name dev-postgres -p 5432:5432 -e POSTGRES_USER=dokploy -e POSTGRES_DB=dokploy -e POSTGRES_HOST_AUTH_METHOD=trust --restart always postgres:16 || true
docker run -d --name dev-redis -p 6379:6379 --restart always redis:7 || true

# 8. PNPM Security Whitelist
echo "🔑 Pre-authorizing build scripts..."
pnpm config set only-built-dependencies --json '["@prisma/client", "@prisma/engines", "prisma", "node-pty", "bcrypt", "better-sqlite3", "sharp"]'

# 9. DIRECTORY PROVISIONING (The fix for your ENOENT error)
echo "📂 Provisioning network directories..."
mkdir -p apps/dokploy/.docker/traefik

# 10. Build & Launch Nobus Dashboard
echo "🏗️ Building Nobus Cloud Production Version..."
pnpm install --frozen-lockfile
pnpm run build

echo "--------------------------------------------------------"
echo "✅ Nobus Cloud is live at http://$(hostname -I | awk '{print $1}'):3000"
echo "--------------------------------------------------------"

cd apps/dokploy
nohup pnpm run start > nobus.log 2>&1 &
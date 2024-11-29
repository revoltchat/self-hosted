#!/usr/bin/env bash

# set hostname for Caddy
echo "HOSTNAME=https://$1" > .env.web
echo "REVOLT_PUBLIC_URL=https://$1/api" >> .env.web

# hostnames
echo "[hosts]" >> Revolt.toml
echo "app = \"https://$1\"" >> Revolt.toml
echo "api = \"https://$1/api\"" >> Revolt.toml
echo "events = \"wss://$1/ws\"" >> Revolt.toml
echo "autumn = \"https://$1/autumn\"" >> Revolt.toml
echo "january = \"https://$1/january\"" >> Revolt.toml
echo "voso_legacy = \"https://$1/vortex\"" >> Revolt.toml
echo "voso_legacy_ws = \"wss://$1/vortex\"" >> Revolt.toml

# VAPID keys
echo "" >> Revolt.toml
echo "[api.vapid]" >> Revolt.toml
openssl ecparam -name prime256v1 -genkey -noout -out vapid_private.pem
echo "private_key = \"$(base64 vapid_private.pem | tr -d '\n')\"" >> Revolt.toml
echo "public_key = \"$(openssl ec -in vapid_private.pem -outform DER|tail -c 65|base64|tr '/+' '_-'|tr -d '\n')\"" >> Revolt.toml
rm vapid_private.pem

# encryption key for files
echo "" >> Revolt.toml
echo "[files]" >> Revolt.toml
echo "encryption_key = \"$(openssl rand -base64 32)\"" >> Revolt.toml

# configure vortex
vortex_manage_token=$(openssl rand -base64 32)
echo "WS_URL=wss://$1/vortex" > .env.vortex
echo "MANAGE_TOKEN=$vortex_manage_token" >> .env.vortex
echo "RTC_IPS=$2" >> .env.vortex
echo "" >> Revolt.toml
echo "[api.security]" >> Revolt.toml
echo "voso_legacy_token = \"$vortex_manage_token\"" >> Revolt.toml

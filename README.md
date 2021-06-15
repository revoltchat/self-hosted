This is still a work-in-progress and some things may not work, notably Autumn does not auto-create S3 buckets yet and the app points to api.revolt.chat by default.

## Quick Start

This repository provides reasonable defaults, so you can immediately get started with it on your local machine.

> ⚠️ Not recommended for production, see below for full guide.

```bash
git clone https://gitlab.insrt.uk/revolt/self-hosted revolt
cd revolt
cp .env.example .env
docker-compose up -d
```

## Usage

Copy the `.env` file and edit according to your needs.

```bash
cp .env.example .env
```

Then bring up REVOLT:

```bash
docker-compose up -d
```

## To-Do

- Interactive setup.
- Add Caddy.
- Add voso.

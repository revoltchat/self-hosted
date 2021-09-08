This is still a work-in-progress and some things may not work but for the most part everything has been tested without issue!

## Quick Start

This repository provides reasonable defaults, so you can immediately get started with it on your local machine.

> ⚠️ Not recommended for production, see below for full guide.

```bash
git clone https://github.com/revoltchat/self-hosted revolt
cd revolt
cp .env.example .env
docker-compose up -d
```

Then simply go to http://local.revolt.chat:5000

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

This is still a work-in-progress and some things may not work but for the most part everything has been tested without issue!

## Errata Notice

The CI for the API server (revoltchat/server) is currently being reworked, I was having a few issues with building both amd64/arm64.

Please make sure you're using the correct image for your platform:
- amd64: `revoltchat/server:master`
- arm64: `revoltchat/server:latest`

I hope to get this resolved soon, thank you.

Related issue: https://github.com/revoltchat/delta/issues/116

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

## Setup

Clone this repository.

```bash
git clone https://github.com/revoltchat/self-hosted revolt
cd revolt
```

Copy the `.env` file and edit according to your needs.

> ⚠️ The default configuration is intended for testing and only works on your local machine. If you want to deploy to a remote server, you need to edit the URLs in the `.env` file. \
> If you get a network error when trying to log in, **double check your configuration before opening an issue.**

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

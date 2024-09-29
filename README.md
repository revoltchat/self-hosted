<div align="center">
<h1>
  Revolt Self-Hosted
  
  [![Stars](https://img.shields.io/github/stars/revoltchat/self-hosted?style=flat-square&logoColor=white)](https://github.com/revoltchat/self-hosted/stargazers)
  [![Forks](https://img.shields.io/github/forks/revoltchat/self-hosted?style=flat-square&logoColor=white)](https://github.com/revoltchat/self-hosted/network/members)
  [![Pull Requests](https://img.shields.io/github/issues-pr/revoltchat/self-hosted?style=flat-square&logoColor=white)](https://github.com/revoltchat/self-hosted/pulls)
  [![Issues](https://img.shields.io/github/issues/revoltchat/self-hosted?style=flat-square&logoColor=white)](https://github.com/revoltchat/self-hosted/issues)
  [![Contributors](https://img.shields.io/github/contributors/revoltchat/self-hosted?style=flat-square&logoColor=white)](https://github.com/revoltchat/self-hosted/graphs/contributors)
  [![License](https://img.shields.io/github/license/revoltchat/self-hosted?style=flat-square&logoColor=white)](https://github.com/revoltchat/self-hosted/blob/main/LICENSE)
</h1>
Self-hosting Revolt using Docker
</div>
<br/>

This repository contains configurations and instructions that can be used for deploying Revolt.

> [!NOTE]
> Please consult _[What can I do with Revolt and how do I self-host?](https://developers.revolt.chat/faq.html#admonition-what-can-i-do-with-revolt-and-how-do-i-self-host)_ on our developer site for information about licensing and brand use.

> [!NOTE]
> amd64 builds are only available for `backend` and `bonfire` images currently, more to come.

## Quick Start

This repository provides reasonable defaults, so you can immediately get started with it on your local machine.

> [!WARNING]
> This is not fit for production usage; see below for the full guide.

```bash
git clone https://github.com/revoltchat/self-hosted revolt
cd revolt
cp .env.example .env
docker compose up
```

Now navigate to http://local.revolt.chat in your browser.

## Production Setup

Prerequisites before continuing:

- [Git](https://git-scm.com)
- [Docker](https://www.docker.com)

Clone this repository.

```bash
git clone https://github.com/revoltchat/self-hosted revolt
cd revolt
```

Copy `.env` and download `Revolt.toml`, then modify them according to your requirements.

> [!WARNING]
> The default configurations are intended exclusively for testing and will only work locally. If you wish to deploy to a remote server, you **must** edit the URLs in `.env` and `Revolt.toml`. Please reference the section below on [configuring a custom domain](#custom-domain).

```bash
cp .env.example .env
wget -O Revolt.toml https://raw.githubusercontent.com/revoltchat/backend/main/crates/core/config/Revolt.toml
```

Then start Revolt:

```bash
docker compose up
```

## Updating

Before updating, ensure you consult the notices at the top of this README to check if there are any important changes to be aware of.

Pull the latest version of this repository:

```bash
git pull
```

Then pull all the latest images:

```bash
docker compose pull
```

Then restart the services:

```bash
docker compose up
```

## Additional Notes

### Custom domain

To configure a custom domain, you will need to replace all instances of `local.revolt.chat` in the `Revolt.toml` and `.env` files, like so:

```diff
# .env
- REVOLT_APP_URL=http://local.revolt.chat
+ REVOLT_APP_URL=http://my.domain
```

```diff
# Revolt.toml
- app = "http://local.revolt.chat"
+ app = "http://my.domain"
```

You will also want to change the protocols to enable HTTPS:

```diff
# .env
- REVOLT_APP_URL=http://my.domain
+ REVOLT_APP_URL=https://my.domain

- REVOLT_EXTERNAL_WS_URL=ws://my.domain/ws
+ REVOLT_EXTERNAL_WS_URL=wss://my.domain/ws
```

```diff
# Revolt.toml
- app = "http://local.revolt.chat"
+ app = "https://my.domain"

- events = "ws://my.domain/ws"
+ events = "wss://my.domain/ws"
```

In the case of `HOSTNAME`, you must strip the protocol prefix:

```diff
# .env
- HOSTNAME=https://my.domain
+ HOSTNAME=my.domain
```

### Putting Revolt behind another reverse proxy (or on a non-standard port)

Override the port definitions on `caddy`:

```yml
# compose.yml
services:
  caddy:
    ports:
      - "1234:80"
```

> [!WARNING]
> This file is not Git ignored. It may be sufficient to use an override file, but that will not remove port 80 / 443 allocations.

Update the hostname used by the web server:

```diff
# .env
- HOSTNAME=http://local.revolt.chat
+ HOSTNAME=:80
```

You can now reverse proxy to http://localhost:1234.

### Insecurely expose database

You can insecurely expose the database by adding a port definition:

```yml
# compose.override.yml
services:
  database:
    ports:
      - "27017:27017"
```

### Mongo compatibility

Older processors may not support the latest MongoDB version, you may pin to MongoDB 4.4 as such:

```yml
# compose.override.yml
services:
  database:
    image: mongo:4.4
```

### Making your instance invite-only

Enable invite-only mode by setting `REVOLT_INVITE_ONLY` in `.env` to `1` and `invite_only` in `Revolt.toml` to `true`.

Create an invite:

```bash
# drop into mongo shell
docker compose exec database mongosh

# create the invite
use revolt
db.invites.insertOne({ _id: "enter_an_invite_code_here" })
```

## Notices

> [!IMPORTANT]
> If you deployed Revolt before [2022-10-29](https://github.com/minio/docs/issues/624#issuecomment-1296608406), you may have to tag the `minio` image release if it's configured in "fs" mode.
>
> ```yml
> image: minio/minio:RELEASE.2022-10-24T18-35-07Z
> ```

> [!IMPORTANT]
> If you deployed Revolt before [2023-04-21](https://github.com/revoltchat/backend/commit/32542a822e3de0fc8cc7b29af46c54a9284ee2de), you may have to flush your Redis database.
>
> ```bash
> # for stock Redis and older KeyDB images:
> docker compose exec redis redis-cli
> # ...or for newer KeyDB images:
> docker compose exec redis keydb-cli
>
> # then run:
> FLUSHDB
> ```

> [!IMPORTANT]
> As of 30th September 2024, Autumn has undergone a major refactor which requires a manual migration.
>
> To begin, add a temporary container that we can work from:
>
> ```yml
> # compose.override.yml
> services:
>   migration:
>     image: node:21
>     volumes:
>       - ./migrations:/cwd
>     command: "bash -c 'while true; do sleep 86400; done'"
> ```
>
> Then switch to the shell:
>
> ```bash
> docker compose up -d database migration
> docker compose exec migration bash
> ```
>
> Now we can run the migration:
>
> ```bash
> cd /cwd
> npm i mongodb
> node ./20240929-autumn-rewrite.mjs
> ```

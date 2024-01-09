# Before you get started

Please [read the FAQ before running your own server](https://developers.revolt.chat/faq/usage#guidelines-for-third-party-instances). You may also want to read about our [additional notes relating to third-party instances](https://developers.revolt.chat/faq/instances).

## Errata Notice

> [!NOTE]
> amd64 builds are only available for `backend` and `bonfire` images currently. More are planned in future.

> [!IMPORTANT]
> If you deployed Revolt before [2022-10-29](https://github.com/minio/docs/issues/624#issuecomment-1296608406), you may have to tag the `minio` image release if it's configured in "fs" mode.
> ```yml
> image: minio/minio:RELEASE.2022-10-24T18-35-07Z
> ```

> [!IMPORTANT]
> If you deployed Revolt before [2023-04-21](https://github.com/revoltchat/backend/commit/32542a822e3de0fc8cc7b29af46c54a9284ee2de), you may have to flush your Redis database.
> ```bash
> # for stock Redis and older KeyDB images:
> docker-compose exec redis redis-cli
> # ...or for newer KeyDB images:
> docker-compose exec redis keydb-cli
>
> # then run:
> FLUSHDB
> ```

## Quick Start

This repository provides reasonable defaults, allowing you to get started on your local machine with ease.

> [!WARNING]
> This is not recommended for production usage - see [below](#Setup) for the full guide.

```bash
git clone https://github.com/revoltchat/self-hosted revolt
cd revolt
cp .env.example .env
docker-compose up -d
```

Then simply go to http://local.revolt.chat.

# Setup

Prerequisites before continuing:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

Clone this repository and open it:
```bash
git clone https://github.com/revoltchat/self-hosted revolt
cd revolt
```

> [!WARNING]
> The default configuration is intended for testing and only works on your local machine. If you want to deploy to a remote server, you need to edit the URLs in the `.env` file. Please see the section below on [configuring a custom domain](#custom-domain). \
> If you get a network error when trying to log in, **double check your configuration prior to opening an issue.**

Copy the `.env` file:
```bash
cp .env.example .env
```

Edit the `.env` file according to your requirements.

Then bring up Revolt:
```bash
docker-compose up -d
```

## Updating Revolt

Before updating Revolt, check the errata at the top for important information and check if there are any new required environment variables now present in the `.env` file.

To update Revolt, first pull the latest copy of this repository to ensure you have the latest tags:
```bash
git pull
```

Then pull all the latest images:
```bash
docker-compose pull
```

Now you can restart your services:
```bash
docker-compose up -d
```

## Additional Notes

### Custom domain

To configure a custom domain, you should be able to do a search and replace on `local.revolt.chat` in the `.env` file, like so:
```diff
# .env
- REVOLT_APP_URL=http://local.revolt.chat
+ REVOLT_APP_URL=http://my.domain
```

You will also want to change the protocols to enable HTTPS:
```diff
# .env
- REVOLT_APP_URL=http://my.domain
+ REVOLT_APP_URL=https://my.domain

- REVOLT_EXTERNAL_WS_URL=ws://my.domain/ws
+ REVOLT_EXTERNAL_WS_URL=wss://my.domain/ws
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
# docker-compose.yml
services:
  caddy:
    ports:
      - "1234:80"
```

> [!WARNING]
> This file is not Git ignored, it may be sufficient to use an override file, but that will not remove port 80 / 443 allocations.

Update the hostname used by the web server:
```diff
# .env
- HOSTNAME=http://local.revolt.chat
+ HOSTNAME=:80
```

You can now reverse proxy to http://localhost:1234.

### Expose database

You can insecurely expose the database by adding a port definition:
```yml
# docker-compose.override.yml
services:
  database:
    ports:
      - "27017:27017"
```

### Mongo compatibility

Older processors may not support the latest MongoDB version. You may pin to MongoDB 4.4 as such:
```yml
# docker-compose.override.yml
services:
  database:
    image: mongo:4.4
```

### Making your instance invite-only

Enable invite-only mode by setting `REVOLT_INVITE_ONLY` in `.env` to `1`.

Create an invite:
```bash
# drop into mongo shell
docker-compose exec database mongosh

# create the invite
use revolt
db.invites.insertOne({ _id: "enter_an_invite_code_here" })
```

# Before you get started

This is still a work-in-progress and some things may not work but for the most part everything has been tested without issue!

**Note**: the Revolt team is primarily focused on other components of the app, don't expect any immediate support, some issues may also be seen as out of scope for what this repo is trying to achieve so they may be marked as WONTFIX.

Please [read the FAQ before running your own server](https://developers.revolt.chat/faq/usage#guidelines-for-third-party-instances) and you may want to read about [additional notes relating to third-party instances](https://developers.revolt.chat/faq/instances).

## Errata Notice

amd64 builds are currently unavailable.

Related issue: https://github.com/revoltchat/delta/issues/116

## Quick Start

This repository provides reasonable defaults, so you can immediately get started with it on your local machine.

> **Warning**
> This is not recommended for production usage - see below for the full guide.

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

> **Warning**: The default configuration is intended for testing and only works on your local machine. If you want to deploy to a remote server, you need to edit the URLs in the `.env` file. \
> If you get a network error when trying to log in, **double check your configuration before opening an issue.**

```bash
cp .env.example .env
```

Then bring up Revolt:

```bash
docker-compose up -d
```

## Updating Revolt

To update Revolt, first pull the latest copy of this repository to ensure you have the latest tags:

```
git pull
```

Then pull all the latest images:

```
docker-compose pull
```

Now you can restart your services:

```
docker-compose up -d
```

## Additional Notes

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

Older processors may not support the latest MongoDB version, you may pin to MongoDB 4.4 as such:

```yml
# docker-compose.override.yml
services:
  database:
    image: mongo:4.4
```

### Making your instance invite-only

Enable invite-only mode by setting `REVOLT_INVITE_ONLY` in `.env` to `1`

Create an invite (Replace "YOUR INVITE HERE" with what you want the invite code to be)
```bash
docker-compose exec database mongosh
use revolt
db.invites.insertOne({ _id: "YOUR INVITE HERE" })
```

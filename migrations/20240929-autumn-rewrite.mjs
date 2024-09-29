// This script is intended for migrating to the new Autumn release.
// Please read all TODOs in this file as they will help guide you
// to migrate your data properly. Please do Ctrl + F "TODO".

import { MongoClient } from "mongodb";

/**
 * Map of tags to S3 bucket names
 *
 * TODO: if you've used AUTUMN_S3_BUCKET_PREFIX in the past
 *       update the bucket names below to include the prefix
 *
 *       NOTE: update `files.s3.default_bucket` in Revolt.toml!
 */
const BUCKET_MAP = {
  attachments: "attachments",
  avatars: "avatars",
  backgrounds: "backgrounds",
  icons: "icons",
  banners: "banners",
  emojis: "emojis",
};

/**
 * Connection URL for MongoDB instance
 *
 * TODO: change if necessary
 */
const CONNECTION_URL = "mongodb://database";

const mongo = new MongoClient(CONNECTION_URL);
await mongo.connect();

async function determineUploaderIdAndUse(f, v, i) {
  if (f.tag === "attachments" && v === "attachments") {
    if (typeof f.message_id !== "string") {
      console.warn(i, "No message id specified.");
      return null;
    }

    if (!objectLookup[f.message_id]) {
      objectLookup[f.message_id] = await mongo
        .db("revolt")
        .collection("messages")
        .findOne({
          _id: f.message_id,
        });
    }

    if (!objectLookup[f.message_id]) {
      console.warn(i, "Message", f.message_id, "doesn't exist anymore!");
      return null;
    }

    return {
      uploaded_at: new Date(decodeTime(f.message_id)),
      uploader_id: objectLookup[f.message_id].author,
      used_for: {
        type: "message",
        id: f.message_id,
      },
    };
  } else if (f.tag === "banners" && v === "banners") {
    if (typeof f.server_id !== "string") {
      console.warn(i, "No server id specified.");
      return null;
    }

    if (!objectLookup[f.server_id]) {
      objectLookup[f.server_id] = await mongo
        .db("revolt")
        .collection("servers")
        .findOne({
          _id: f.server_id,
        });
    }

    if (!objectLookup[f.server_id]) {
      console.warn(i, "Server", f.server_id, "doesn't exist anymore!");
      return null;
    }

    return {
      uploaded_at: new Date(),
      uploader_id: objectLookup[f.server_id].owner,
      used_for: {
        type: "serverBanner",
        id: f.server_id,
      },
    };
  } else if (f.tag === "emojis" && v === "emojis") {
    if (typeof f.object_id !== "string") {
      return null;
    }

    if (!objectLookup[f.object_id]) {
      objectLookup[f.object_id] = await mongo
        .db("revolt")
        .collection("emojis")
        .findOne({
          _id: f.object_id,
        });
    }

    if (!objectLookup[f.object_id]) {
      console.warn(i, "Emoji", f.object_id, "doesn't exist anymore!");
      return null;
    }

    return {
      uploaded_at: new Date(decodeTime(f.object_id)),
      uploader_id: objectLookup[f.object_id].creator_id,
      used_for: {
        type: "emoji",
        id: f.object_id,
      },
    };
  } else if (f.tag === "avatars" && v === "avatars") {
    if (typeof f.user_id !== "string") {
      return null;
    }

    if (!objectLookup[f.user_id]) {
      objectLookup[f.user_id] = await mongo
        .db("revolt")
        .collection("users")
        .findOne({
          _id: f.user_id,
        });
    }

    if (!objectLookup[f.user_id]) {
      console.warn(i, "User", f.user_id, "doesn't exist anymore!");
      return null;
    }

    if (objectLookup[f.user_id].avatar?._id !== f._id) {
      console.warn(
        i,
        "Attachment no longer in use.",
        f._id,
        "for",
        f.user_id,
        "current:",
        objectLookup[f.user_id].avatar?._id
      );
      return null;
    }

    return {
      uploaded_at: new Date(),
      uploader_id: f.user_id,
      used_for: {
        type: "userAvatar",
        id: f.user_id,
      },
    };
  } else if (f.tag === "backgrounds" && v === "backgrounds") {
    if (typeof f.user_id !== "string") {
      return null;
    }

    if (!objectLookup[f.user_id]) {
      objectLookup[f.user_id] = await mongo
        .db("revolt")
        .collection("users")
        .findOne({
          _id: f.user_id,
        });
    }

    if (!objectLookup[f.user_id]) {
      console.warn(i, "User", f.user_id, "doesn't exist anymore!");
      return null;
    }

    if (objectLookup[f.user_id].profile?.background?._id !== f._id) {
      console.warn(
        i,
        "Attachment no longer in use.",
        f._id,
        "for",
        f.user_id,
        "current:",
        objectLookup[f.user_id].profile?.background?._id
      );
      return null;
    }

    return {
      uploaded_at: new Date(),
      uploader_id: f.user_id,
      used_for: {
        type: "userProfileBackground",
        id: f.user_id,
      },
    };
  } else if (f.tag === "icons" && v === "icons") {
    if (typeof f.object_id !== "string") {
      return null;
    }

    // some bugged files at start
    // ... expensive to compute at worst case =(
    // so instead we can just disable it until everything is processed
    // then re-run on these!
    if (false) {
      objectLookup[f.object_id] = await mongo
        .db("revolt")
        .collection("users")
        .findOne({
          _id: f.object_id,
        });

      if (!objectLookup[f.object_id]) {
        console.warn(i, "No legacy match!");
        return null;
      }

      return {
        uploaded_at: new Date(),
        uploader_id: f.object_id,
        used_for: {
          type: "legacyGroupIcon",
          id: f.object_id,
        },
      };
    }

    if (!objectLookup[f.object_id]) {
      objectLookup[f.object_id] = await mongo
        .db("revolt")
        .collection("servers")
        .findOne({
          _id: f.object_id,
        });
    }

    if (
      !objectLookup[f.object_id] ||
      // heuristic for not server
      !objectLookup[f.object_id].channels
    ) {
      console.warn(i, "Server", f.object_id, "doesn't exist!");

      if (!objectLookup[f.object_id]) {
        objectLookup[f.object_id] = await mongo
          .db("revolt")
          .collection("channels")
          .findOne({
            _id: f.object_id,
          });
      }

      if (!objectLookup[f.object_id]) {
        console.warn(i, "Channel", f.object_id, "doesn't exist!");
        return null;
      }

      let server;
      const serverId = objectLookup[f.object_id].server;
      if (serverId) {
        server = objectLookup[serverId];

        if (!server) {
          server = await mongo.db("revolt").collection("servers").findOne({
            _id: serverId,
          });

          console.info(
            i,
            "Couldn't find matching server for channel " + f.object_id + "!"
          );
          if (!server) return null;

          objectLookup[serverId] = server;
        }
      }

      return {
        uploaded_at: new Date(),
        uploader_id: (server ?? objectLookup[f.object_id]).owner,
        used_for: {
          type: "channelIcon",
          id: f.object_id,
        },
      };
    }

    return {
      uploaded_at: new Date(),
      uploader_id: objectLookup[f.object_id].owner,
      used_for: {
        type: "serverIcon",
        id: f.object_id,
      },
    };
  } else {
    throw (
      "couldn't find uploader id for " +
      f._id +
      " expected " +
      v +
      " but got " +
      f.tag
    );
  }
}

const dirs = [
  "banners",
  "emojis",
  "avatars",
  "backgrounds",
  "icons",
  "attachments", // https://stackoverflow.com/a/18777877
];

// === add `used_for` field to files
const files_pt1 = await mongo
  .db("revolt")
  .collection("attachments")
  .find({
    $or: [
      {
        used_for: {
          $exists: false,
        },
      },
      {
        uploader_id: {
          $exists: false,
        },
      },
      {
        uploader_at: {
          $exists: false,
        },
      },
    ],
  })
  .toArray();

let i = 1;
for (const file of files_pt1) {
  console.info(i++, files_pt1.length, file);
  const meta = determineUploaderIdAndUse(file, file.tag, i);
  if (meta) {
    await mongo.db("revolt").collection("attachments").updateOne(
      {
        _id: file._id,
      },
      {
        $set: meta,
      }
    );
  }
}

// === set hash to id and create relevant objects
const files_pt2 = await mongo
  .db("revolt")
  .collection("attachments")
  .find({
    hash: {
      $exists: false,
    },
  })
  .toArray();

await mongo
  .db("revolt")
  .collection("attachment_hashes")
  .insertMany(
    files_pt2.map((file) => ({
      _id: file._id,
      processed_hash: file._id,

      created_at: new Date(),

      bucket_id: BUCKET_MAP[file.tag],
      path: file._id,
      iv: "", // disable encryption for file

      metadata: file.metadata,
      content_type: file.content_type,
      size: file.size,
    }))
  );

for (const file of files_pt2) {
  await mongo
    .db("revolt")
    .collection("attachments")
    .updateOne(
      {
        _id: file._id,
      },
      {
        $set: {
          hash: file._id,
        },
      }
    );
}

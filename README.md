# Farcaster Indexer

This software indexes [Farcaster](https://farcaster.xyz) data into a Supabase database. The primary purpose of the database is to serve [Farcaster News](https://www.farcasternews.xyz).

We are opening up read-only access to the database to the public with the hope of accelerating permissionless innovation on Farcaster Protocol by making it easy to start a new project. We don't provide an SLA and strongly encourage you to run your own indexer and database once your project takes off.

## Accessing our database

You can use [the Supabase client](https://supabase.com/docs/reference/javascript/installing) to access our database with the following config:

- Project URL: `https://kpwbglpxjuhiqtgtvenz.supabase.co`
- API key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwd2JnbHB4anVoaXF0Z3R2ZW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTgzNzg2MjEsImV4cCI6MTk3Mzk1NDYyMX0.zecokpSRK0MI_nOaSAgFZJCMkPSpEXraPKqQD5fogE4`

Following views are available: `account_view`, `activity_view` and `activity_opengraph_view`, `opengraph_view`. Note that we don't currently verify signatures.

### account_view

We check updates to [Farcaster name registry](https://www.farcaster.xyz/docs/the-basics#name-registry) every 5 minutes and reflect user registrations, username transfer, and directory URL changes to our database. We scrape directory, proof, and profile URLs at 4000 accounts per hour in case there are updates.

The following fields are available in `account_view`:

- `id`: Primary key of the view
- `address` (not nullable, unique): From Farcaster name registry
- `username` (not nullable, unique): From Farcaster name registry
- `display_name` (nullable): From directory
- `avatar_url` (nullable): From directory
- `bio` (nullable): From profile API
- `num_followings` (nullable): From profile API
- `num_followers` (nullable): From profile API
- `url` (not nullable): Directory URL from Farcaster name registry
- `activity_url` (nullable) From directory
- `proof_url` (nullable) From directory
- `merkle_root` (nullable): From directory
- `signature` (nullable): From directory
- `directory_raw_data` (nullable): Raw JSON of the directory
- `signed_message` (nullable): From proof
- `signer_address` (nullable): From proof
- `farcaster_address` (nullable): From proof
- `original_message` (nullable): From proof
- `proof_raw_data` (nullable): Raw JSON of the proof
- `entry_created_at` (not nullable): Tx timestamp of registration
- `entry_updated_at` (not nullable): Tx timestamp of updates to the registry
- `latest_activity_sequence` (nullable): The latest activity sequence
- `directory_updated_at` (nullable): Timestamp of the last time we scraped the directory URL
- `activity_updated_at` (nullable): Timestamp of the last time we scraped the activity URL

### activity_view

We scrape activity URLs at 6000 accounts per hour. We index all new activities. Reactions, recasts, watches, and reply counts are updated up to the 50 most recent activities per account. If an activity is deleted, the row disappears from the view.

The following fields are available in `activity_view`:

- `id` (not nullable, unique): Primary key of the view
- `account` (not nullable): ID of the account posted the text
- `sequence` (not nullable)
- `text` (not nullable)
- `published_at` (not nullable)
- `num_reply_children` (not nullable)
- `reactions_count` (not nullable)
- `recasts_count` (not nullable)
- `watches_count` (not nullable)
- `reply_to` (nullable): ID of the activity this text is replying to
- `merkle_root` (not nullable)
- `signature` (not nullable)
- `prev_merkle_root` (not nullable)
- `recast_merkle_root` (not nullable)
- `raw_data` (not nullable): Raw JSON of the activity

There is a unique constraint on `account` and `sequence`.

### opengraph_view

We extract URLs from `activity_view.text` and scrape the opengraph. Note that we perform our own scraping, so these are different from the opengraph field you see in the content of the activity URL.

The following fields are available in `opengraph_view`:

- `id` (not nullable, unique): Primary key of the view
- `normalized_url` (not nullable, unique)
- `scraped_url` (not nullable, unique): Pre-normalized URL that we scraped
- `type` (nullable): og:type
- `url` (nullable): og:url
- `title` (nullable): og:title
- `description` (nullable): og:description
- `image` (nullable): JSON that contains `url`, `width`, `height`, and `type` fields
- `raw_data` (not nullable): Raw JSON of the scraped opengraph data

### activity_opengraph_view

This view connects `activity_view` and `opengraph_view` as a many-to-many relationship. The absence of `activity` in this table indicates that we have not scraped URLs in the `activity_view.text` yet. `null` value for `opengraph` indicates that the indexer checked the `activity`, but no URLs or opengraph were detected.

The following fields are available in `activity_opengraph_view`:

- activity (not nullable, not unique): ID of `activity_view`.
- opengraph (nullable, not unique): ID of `opengraph_view`.

## Want to contribute?

Check out [some ideas here](https://github.com/lfglabs/farcaster-indexer/issues)

## Need help?

You can DM me on [Twitter](https://twitter.com/kn).

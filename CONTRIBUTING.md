## Creating Database Migrations
Make sure a PostgreSQL database is running at localhost:5435 with username `postgres` and password `postgres`.
Make sure your `.env` file includes a `DATABASE_URL` formatted as a jdbc postgres url.

Add your changes to /prisma/schema.prisma.
Then run `npx prisma migrate dev --name YOUR_MIGRATION_NAME`.
It will also apply the migration to the locally running db.

Run `npx prisma generate` to update the Prisma client in the typescript code.

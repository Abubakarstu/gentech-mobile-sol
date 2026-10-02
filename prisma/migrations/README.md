# Prisma Migrations

This directory contains versioned database migrations for the GenTech Marketplace.

## Migration Workflow

### Creating a New Migration

```bash
pnpm db:migrate --name <migration_name>
```

This will:
1. Generate a new migration file in this directory
2. Apply the migration to the database
3. Update the Prisma Client

### Development Workflow

1. **Modify Schema**: Make changes to `../schema.prisma`
2. **Create Migration**: Run `pnpm db:migrate --name descriptive_name`
3. **Review Migration**: Check the generated SQL in the new migration file
4. **Apply Migration**: The migration is automatically applied during creation
5. **Generate Client**: Prisma Client is automatically regenerated

### Production Workflow

For production deployments:
1. Review all pending migrations
2. Apply migrations using `prisma migrate deploy`
3. Never use `prisma db push` in production

## Migration History

### 2025-08-12 Initial Schema

- User authentication (Better Auth)
- Profiles
- Categories, Brands, Listings
- Listing Images
- Favorites, Saved Searches
- Messaging (Conversations, Messages)
- Reviews
- Reports
- Notifications
- Inspection system (Plans, Requests, Reports)
- Audit logging

## Important Notes

- **Never modify existing migration files** - create new ones instead
- **Always test migrations on a staging database first**
- **Keep migration names descriptive** (e.g., `add_dealer_system`, `add_promotion_tables`)
- **Review generated SQL** before committing
- **Use rollback capability** when needed: `prisma migrate resolve --rolled-back <migration_name>`

## Rollback Strategy

If you need to rollback a migration:
1. Identify the migration to rollback
2. Manually create a rollback migration
3. Apply the rollback migration
4. Mark the original migration as rolled back

Example:
```bash
prisma migrate resolve --rolled-back 20230812120000_add_dealer_system
```

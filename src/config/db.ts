import { PrismaClient } from '@prisma/client'

// This helps prevent exhausting your database connection limit.
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// This is the single, shared instance of PrismaClient
export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
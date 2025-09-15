import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  getRacesBySeasonInputSchema,
  getRaceByIdInputSchema,
  createRaceInputSchema,
  getRaceResultsInputSchema,
  createRaceResultInputSchema
} from './schema';

// Import handlers
import { getRacesBySeason } from './handlers/get_races_by_season';
import { getRaceById } from './handlers/get_race_by_id';
import { createRace } from './handlers/create_race';
import { getRaceResults } from './handlers/get_race_results';
import { createRaceResult } from './handlers/create_race_result';
import { seedDatabase } from './handlers/seed_database';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Get all races for a specific season (main calendar view)
  getRacesBySeason: publicProcedure
    .input(getRacesBySeasonInputSchema)
    .query(({ input }) => getRacesBySeason(input)),

  // Get detailed race information by ID (race detail page)
  getRaceById: publicProcedure
    .input(getRaceByIdInputSchema)
    .query(({ input }) => getRaceById(input)),

  // Create a new race (admin functionality)
  createRace: publicProcedure
    .input(createRaceInputSchema)
    .mutation(({ input }) => createRace(input)),

  // Get race results for a specific race and session type
  getRaceResults: publicProcedure
    .input(getRaceResultsInputSchema)
    .query(({ input }) => getRaceResults(input)),

  // Create race result entry (admin functionality)
  createRaceResult: publicProcedure
    .input(createRaceResultInputSchema)
    .mutation(({ input }) => createRaceResult(input)),

  // Seed database with 2025 F1 season data (development helper)
  seedDatabase: publicProcedure
    .mutation(() => seedDatabase()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`F1 Race Calendar TRPC server listening at port: ${port}`);
}

start();
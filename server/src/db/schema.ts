import { serial, text, pgTable, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the result type enum
export const resultTypeEnum = pgEnum('result_type', ['practice1', 'practice2', 'practice3', 'qualifying', 'sprint', 'race']);

// Races table for F1 calendar
export const racesTable = pgTable('races', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  circuit_name: text('circuit_name').notNull(),
  country: text('country').notNull(),
  city: text('city').notNull(),
  race_date: timestamp('race_date').notNull(),
  race_time: text('race_time').notNull(), // Format: "HH:MM"
  practice1_date: timestamp('practice1_date'),
  practice1_time: text('practice1_time'),
  practice2_date: timestamp('practice2_date'),
  practice2_time: text('practice2_time'),
  practice3_date: timestamp('practice3_date'),
  practice3_time: text('practice3_time'),
  qualifying_date: timestamp('qualifying_date'),
  qualifying_time: text('qualifying_time'),
  sprint_date: timestamp('sprint_date'),
  sprint_time: text('sprint_time'),
  season: integer('season').notNull(),
  round: integer('round').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Race results table for storing practice, qualifying, and race results
export const raceResultsTable = pgTable('race_results', {
  id: serial('id').primaryKey(),
  race_id: integer('race_id').notNull(),
  result_type: resultTypeEnum('result_type').notNull(),
  driver_name: text('driver_name').notNull(),
  team: text('team').notNull(),
  position: integer('position'), // Can be null for DNF, DNS, etc.
  time: text('time'), // Format: "1:23.456" or "DNF", "DNS", etc.
  points: integer('points'), // Only for race results usually
  laps: integer('laps'),
  grid_position: integer('grid_position'), // Starting position
  fastest_lap: boolean('fastest_lap').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const racesRelations = relations(racesTable, ({ many }) => ({
  results: many(raceResultsTable),
}));

export const raceResultsRelations = relations(raceResultsTable, ({ one }) => ({
  race: one(racesTable, {
    fields: [raceResultsTable.race_id],
    references: [racesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Race = typeof racesTable.$inferSelect;
export type NewRace = typeof racesTable.$inferInsert;
export type RaceResult = typeof raceResultsTable.$inferSelect;
export type NewRaceResult = typeof raceResultsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  races: racesTable, 
  raceResults: raceResultsTable 
};

export const tableRelations = {
  racesRelations,
  raceResultsRelations
};
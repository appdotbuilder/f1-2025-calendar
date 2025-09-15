import { z } from 'zod';

// Race schema for F1 races
export const raceSchema = z.object({
  id: z.number(),
  name: z.string(),
  circuit_name: z.string(),
  country: z.string(),
  city: z.string(),
  race_date: z.coerce.date(),
  race_time: z.string(), // Format: "HH:MM"
  practice1_date: z.coerce.date().nullable(),
  practice1_time: z.string().nullable(),
  practice2_date: z.coerce.date().nullable(),
  practice2_time: z.string().nullable(),
  practice3_date: z.coerce.date().nullable(),
  practice3_time: z.string().nullable(),
  qualifying_date: z.coerce.date().nullable(),
  qualifying_time: z.string().nullable(),
  sprint_date: z.coerce.date().nullable(),
  sprint_time: z.string().nullable(),
  season: z.number().int(),
  round: z.number().int(),
  created_at: z.coerce.date()
});

export type Race = z.infer<typeof raceSchema>;

// Input schema for creating races
export const createRaceInputSchema = z.object({
  name: z.string(),
  circuit_name: z.string(),
  country: z.string(),
  city: z.string(),
  race_date: z.coerce.date(),
  race_time: z.string(),
  practice1_date: z.coerce.date().nullable().optional(),
  practice1_time: z.string().nullable().optional(),
  practice2_date: z.coerce.date().nullable().optional(),
  practice2_time: z.string().nullable().optional(),
  practice3_date: z.coerce.date().nullable().optional(),
  practice3_time: z.string().nullable().optional(),
  qualifying_date: z.coerce.date().nullable().optional(),
  qualifying_time: z.string().nullable().optional(),
  sprint_date: z.coerce.date().nullable().optional(),
  sprint_time: z.string().nullable().optional(),
  season: z.number().int(),
  round: z.number().int()
});

export type CreateRaceInput = z.infer<typeof createRaceInputSchema>;

// Result type enum
export const resultTypeEnum = z.enum(['practice1', 'practice2', 'practice3', 'qualifying', 'sprint', 'race']);
export type ResultType = z.infer<typeof resultTypeEnum>;

// Race result schema
export const raceResultSchema = z.object({
  id: z.number(),
  race_id: z.number(),
  result_type: resultTypeEnum,
  driver_name: z.string(),
  team: z.string(),
  position: z.number().int().nullable(),
  time: z.string().nullable(), // Format: "1:23.456" or "DNF", "DNS", etc.
  points: z.number().nullable(),
  laps: z.number().int().nullable(),
  grid_position: z.number().int().nullable(),
  fastest_lap: z.boolean(),
  created_at: z.coerce.date()
});

export type RaceResult = z.infer<typeof raceResultSchema>;

// Input schema for creating race results
export const createRaceResultInputSchema = z.object({
  race_id: z.number(),
  result_type: resultTypeEnum,
  driver_name: z.string(),
  team: z.string(),
  position: z.number().int().nullable().optional(),
  time: z.string().nullable().optional(),
  points: z.number().nullable().optional(),
  laps: z.number().int().nullable().optional(),
  grid_position: z.number().int().nullable().optional(),
  fastest_lap: z.boolean().optional()
});

export type CreateRaceResultInput = z.infer<typeof createRaceResultInputSchema>;

// Query schema for getting races by season
export const getRacesBySeasonInputSchema = z.object({
  season: z.number().int()
});

export type GetRacesBySeasonInput = z.infer<typeof getRacesBySeasonInputSchema>;

// Query schema for getting race by ID
export const getRaceByIdInputSchema = z.object({
  id: z.number()
});

export type GetRaceByIdInput = z.infer<typeof getRaceByIdInputSchema>;

// Query schema for getting race results
export const getRaceResultsInputSchema = z.object({
  race_id: z.number(),
  result_type: resultTypeEnum.optional()
});

export type GetRaceResultsInput = z.infer<typeof getRaceResultsInputSchema>;
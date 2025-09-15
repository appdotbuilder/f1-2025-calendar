import { db } from '../db';
import { raceResultsTable } from '../db/schema';
import { type GetRaceResultsInput, type RaceResult } from '../schema';
import { eq, and, asc, desc, isNull, type SQL } from 'drizzle-orm';

export const getRaceResults = async (input: GetRaceResultsInput): Promise<RaceResult[]> => {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];
    
    // Always filter by race_id
    conditions.push(eq(raceResultsTable.race_id, input.race_id));
    
    // Add result_type filter if provided
    if (input.result_type) {
      conditions.push(eq(raceResultsTable.result_type, input.result_type));
    }

    // Build and execute query
    const results = await db.select()
      .from(raceResultsTable)
      .where(and(...conditions))
      .orderBy(
        asc(raceResultsTable.position), // This puts nulls last by default in PostgreSQL
        asc(raceResultsTable.id)
      )
      .execute();

    // All fields are already in correct types from schema
    return results;
  } catch (error) {
    console.error('Failed to fetch race results:', error);
    throw error;
  }
};
import { db } from '../db';
import { raceResultsTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { type GetRaceResultsInput, type RaceResult } from '../schema';

export const getRaceResults = async (input: GetRaceResultsInput): Promise<RaceResult[]> => {
  try {
    const conditions = [eq(raceResultsTable.race_id, input.race_id)];
    
    // If result type is specified, add it to conditions
    if (input.result_type) {
      conditions.push(eq(raceResultsTable.result_type, input.result_type));
    }

    const results = await db.select()
      .from(raceResultsTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(raceResultsTable.position)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get race results:', error);
    throw error;
  }
};
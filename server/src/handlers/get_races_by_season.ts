import { db } from '../db';
import { racesTable } from '../db/schema';
import { type GetRacesBySeasonInput, type Race } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getRacesBySeason = async (input: GetRacesBySeasonInput): Promise<Race[]> => {
  try {
    // Query races for the specified season, ordered by round number
    const results = await db.select()
      .from(racesTable)
      .where(eq(racesTable.season, input.season))
      .orderBy(asc(racesTable.round))
      .execute();

    // Return the results (no numeric conversions needed as all fields are already correct types)
    return results;
  } catch (error) {
    console.error('Failed to get races by season:', error);
    throw error;
  }
};
import { db } from '../db';
import { racesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetRacesBySeasonInput, type Race } from '../schema';

export const getRacesBySeason = async (input: GetRacesBySeasonInput): Promise<Race[]> => {
  try {
    const results = await db.select()
      .from(racesTable)
      .where(eq(racesTable.season, input.season))
      .orderBy(racesTable.round)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get races by season:', error);
    throw error;
  }
};
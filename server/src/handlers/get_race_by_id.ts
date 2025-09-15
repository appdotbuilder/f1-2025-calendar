import { db } from '../db';
import { racesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetRaceByIdInput, type Race } from '../schema';

export const getRaceById = async (input: GetRaceByIdInput): Promise<Race | null> => {
  try {
    const results = await db.select()
      .from(racesTable)
      .where(eq(racesTable.id, input.id))
      .execute();

    return results[0] || null;
  } catch (error) {
    console.error('Failed to get race by id:', error);
    throw error;
  }
};
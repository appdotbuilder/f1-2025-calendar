import { db } from '../db';
import { racesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetRaceByIdInput, type Race } from '../schema';

export async function getRaceById(input: GetRaceByIdInput): Promise<Race | null> {
  try {
    const results = await db.select()
      .from(racesTable)
      .where(eq(racesTable.id, input.id))
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const race = results[0];
    return {
      ...race,
      // Convert timestamps to Date objects if needed (they should already be Date objects from Drizzle)
      race_date: race.race_date,
      practice1_date: race.practice1_date,
      practice2_date: race.practice2_date,
      practice3_date: race.practice3_date,
      qualifying_date: race.qualifying_date,
      sprint_date: race.sprint_date,
      created_at: race.created_at
    };
  } catch (error) {
    console.error('Failed to fetch race by ID:', error);
    throw error;
  }
}
import { db } from '../db';
import { raceResultsTable, racesTable } from '../db/schema';
import { type CreateRaceResultInput, type RaceResult } from '../schema';
import { eq } from 'drizzle-orm';

export const createRaceResult = async (input: CreateRaceResultInput): Promise<RaceResult> => {
  try {
    // Verify that the race exists before creating the result
    const raceExists = await db.select({ id: racesTable.id })
      .from(racesTable)
      .where(eq(racesTable.id, input.race_id))
      .execute();

    if (raceExists.length === 0) {
      throw new Error(`Race with id ${input.race_id} does not exist`);
    }

    // Insert race result record
    const result = await db.insert(raceResultsTable)
      .values({
        race_id: input.race_id,
        result_type: input.result_type,
        driver_name: input.driver_name,
        team: input.team,
        position: input.position ?? null,
        time: input.time ?? null,
        points: input.points ?? null,
        laps: input.laps ?? null,
        grid_position: input.grid_position ?? null,
        fastest_lap: input.fastest_lap ?? false
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Race result creation failed:', error);
    throw error;
  }
};
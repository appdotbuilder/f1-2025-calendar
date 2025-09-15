import { db } from '../db';
import { racesTable } from '../db/schema';
import { type CreateRaceInput, type Race } from '../schema';

export const createRace = async (input: CreateRaceInput): Promise<Race> => {
  try {
    // Insert race record
    const result = await db.insert(racesTable)
      .values({
        name: input.name,
        circuit_name: input.circuit_name,
        country: input.country,
        city: input.city,
        race_date: input.race_date,
        race_time: input.race_time,
        practice1_date: input.practice1_date ?? null,
        practice1_time: input.practice1_time ?? null,
        practice2_date: input.practice2_date ?? null,
        practice2_time: input.practice2_time ?? null,
        practice3_date: input.practice3_date ?? null,
        practice3_time: input.practice3_time ?? null,
        qualifying_date: input.qualifying_date ?? null,
        qualifying_time: input.qualifying_time ?? null,
        sprint_date: input.sprint_date ?? null,
        sprint_time: input.sprint_time ?? null,
        season: input.season,
        round: input.round
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Race creation failed:', error);
    throw error;
  }
};
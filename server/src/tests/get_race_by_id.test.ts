import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { racesTable } from '../db/schema';
import { type GetRaceByIdInput } from '../schema';
import { getRaceById } from '../handlers/get_race_by_id';

describe('getRaceById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const testRaceInput = {
    name: 'Monaco Grand Prix',
    circuit_name: 'Circuit de Monaco',
    country: 'Monaco',
    city: 'Monte Carlo',
    race_date: new Date('2024-05-26'),
    race_time: '15:00',
    practice1_date: new Date('2024-05-24'),
    practice1_time: '13:30',
    practice2_date: new Date('2024-05-24'),
    practice2_time: '17:00',
    practice3_date: new Date('2024-05-25'),
    practice3_time: '12:30',
    qualifying_date: new Date('2024-05-25'),
    qualifying_time: '16:00',
    sprint_date: null,
    sprint_time: null,
    season: 2024,
    round: 8
  };

  it('should return a race when it exists', async () => {
    // Create a test race
    const insertResult = await db.insert(racesTable)
      .values(testRaceInput)
      .returning()
      .execute();

    const createdRace = insertResult[0];
    const input: GetRaceByIdInput = { id: createdRace.id };

    // Fetch the race by ID
    const result = await getRaceById(input);

    // Verify the race was returned correctly
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdRace.id);
    expect(result!.name).toEqual('Monaco Grand Prix');
    expect(result!.circuit_name).toEqual('Circuit de Monaco');
    expect(result!.country).toEqual('Monaco');
    expect(result!.city).toEqual('Monte Carlo');
    expect(result!.race_time).toEqual('15:00');
    expect(result!.season).toEqual(2024);
    expect(result!.round).toEqual(8);

    // Verify dates are Date objects
    expect(result!.race_date).toBeInstanceOf(Date);
    expect(result!.practice1_date).toBeInstanceOf(Date);
    expect(result!.practice2_date).toBeInstanceOf(Date);
    expect(result!.practice3_date).toBeInstanceOf(Date);
    expect(result!.qualifying_date).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);

    // Verify null values
    expect(result!.sprint_date).toBeNull();
    expect(result!.sprint_time).toBeNull();

    // Verify date values are correct
    expect(result!.race_date.toISOString().split('T')[0]).toEqual('2024-05-26');
    expect(result!.practice1_date!.toISOString().split('T')[0]).toEqual('2024-05-24');
  });

  it('should return null when race does not exist', async () => {
    const input: GetRaceByIdInput = { id: 999 };

    const result = await getRaceById(input);

    expect(result).toBeNull();
  });

  it('should handle race with minimal data (only required fields)', async () => {
    // Create a race with only required fields
    const minimalRaceInput = {
      name: 'Test Grand Prix',
      circuit_name: 'Test Circuit',
      country: 'Test Country',
      city: 'Test City',
      race_date: new Date('2024-07-15'),
      race_time: '14:00',
      practice1_date: null,
      practice1_time: null,
      practice2_date: null,
      practice2_time: null,
      practice3_date: null,
      practice3_time: null,
      qualifying_date: null,
      qualifying_time: null,
      sprint_date: null,
      sprint_time: null,
      season: 2024,
      round: 10
    };

    const insertResult = await db.insert(racesTable)
      .values(minimalRaceInput)
      .returning()
      .execute();

    const createdRace = insertResult[0];
    const input: GetRaceByIdInput = { id: createdRace.id };

    const result = await getRaceById(input);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Test Grand Prix');
    expect(result!.practice1_date).toBeNull();
    expect(result!.practice1_time).toBeNull();
    expect(result!.qualifying_date).toBeNull();
    expect(result!.qualifying_time).toBeNull();
  });

  it('should return correct race when multiple races exist', async () => {
    // Create multiple races
    const race1Input = {
      ...testRaceInput,
      name: 'First Race',
      round: 1
    };

    const race2Input = {
      ...testRaceInput,
      name: 'Second Race',
      round: 2,
      race_date: new Date('2024-06-02')
    };

    const insertResult1 = await db.insert(racesTable)
      .values(race1Input)
      .returning()
      .execute();

    const insertResult2 = await db.insert(racesTable)
      .values(race2Input)
      .returning()
      .execute();

    const race1Id = insertResult1[0].id;
    const race2Id = insertResult2[0].id;

    // Fetch second race by ID
    const input: GetRaceByIdInput = { id: race2Id };
    const result = await getRaceById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(race2Id);
    expect(result!.name).toEqual('Second Race');
    expect(result!.round).toEqual(2);
    expect(result!.race_date.toISOString().split('T')[0]).toEqual('2024-06-02');
  });

  it('should handle race with sprint session data', async () => {
    const sprintRaceInput = {
      ...testRaceInput,
      name: 'Sprint Weekend GP',
      sprint_date: new Date('2024-05-25'),
      sprint_time: '11:30'
    };

    const insertResult = await db.insert(racesTable)
      .values(sprintRaceInput)
      .returning()
      .execute();

    const createdRace = insertResult[0];
    const input: GetRaceByIdInput = { id: createdRace.id };

    const result = await getRaceById(input);

    expect(result).not.toBeNull();
    expect(result!.sprint_date).toBeInstanceOf(Date);
    expect(result!.sprint_time).toEqual('11:30');
    expect(result!.sprint_date!.toISOString().split('T')[0]).toEqual('2024-05-25');
  });
});
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { racesTable } from '../db/schema';
import { type CreateRaceInput } from '../schema';
import { createRace } from '../handlers/create_race';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateRaceInput = {
  name: 'Monaco Grand Prix',
  circuit_name: 'Circuit de Monaco',
  country: 'Monaco',
  city: 'Monte Carlo',
  race_date: new Date('2024-05-26T13:00:00Z'),
  race_time: '15:00',
  season: 2024,
  round: 8
};

// Test input with optional fields
const testInputWithOptionals: CreateRaceInput = {
  name: 'British Grand Prix',
  circuit_name: 'Silverstone Circuit',
  country: 'United Kingdom',
  city: 'Silverstone',
  race_date: new Date('2024-07-07T13:00:00Z'),
  race_time: '15:00',
  practice1_date: new Date('2024-07-05T11:30:00Z'),
  practice1_time: '13:30',
  practice2_date: new Date('2024-07-05T15:00:00Z'),
  practice2_time: '17:00',
  practice3_date: new Date('2024-07-06T11:30:00Z'),
  practice3_time: '13:30',
  qualifying_date: new Date('2024-07-06T15:00:00Z'),
  qualifying_time: '17:00',
  sprint_date: new Date('2024-07-06T10:30:00Z'),
  sprint_time: '12:30',
  season: 2024,
  round: 12
};

describe('createRace', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a race with required fields only', async () => {
    const result = await createRace(testInput);

    // Validate required fields
    expect(result.name).toEqual('Monaco Grand Prix');
    expect(result.circuit_name).toEqual('Circuit de Monaco');
    expect(result.country).toEqual('Monaco');
    expect(result.city).toEqual('Monte Carlo');
    expect(result.race_date).toEqual(testInput.race_date);
    expect(result.race_time).toEqual('15:00');
    expect(result.season).toEqual(2024);
    expect(result.round).toEqual(8);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Validate optional fields are null
    expect(result.practice1_date).toBeNull();
    expect(result.practice1_time).toBeNull();
    expect(result.practice2_date).toBeNull();
    expect(result.practice2_time).toBeNull();
    expect(result.practice3_date).toBeNull();
    expect(result.practice3_time).toBeNull();
    expect(result.qualifying_date).toBeNull();
    expect(result.qualifying_time).toBeNull();
    expect(result.sprint_date).toBeNull();
    expect(result.sprint_time).toBeNull();
  });

  it('should create a race with all optional fields', async () => {
    const result = await createRace(testInputWithOptionals);

    // Validate required fields
    expect(result.name).toEqual('British Grand Prix');
    expect(result.circuit_name).toEqual('Silverstone Circuit');
    expect(result.country).toEqual('United Kingdom');
    expect(result.city).toEqual('Silverstone');
    expect(result.race_date).toEqual(testInputWithOptionals.race_date);
    expect(result.race_time).toEqual('15:00');
    expect(result.season).toEqual(2024);
    expect(result.round).toEqual(12);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Validate optional fields are set correctly
    expect(result.practice1_date).toEqual(testInputWithOptionals.practice1_date!);
    expect(result.practice1_time).toEqual('13:30');
    expect(result.practice2_date).toEqual(testInputWithOptionals.practice2_date!);
    expect(result.practice2_time).toEqual('17:00');
    expect(result.practice3_date).toEqual(testInputWithOptionals.practice3_date!);
    expect(result.practice3_time).toEqual('13:30');
    expect(result.qualifying_date).toEqual(testInputWithOptionals.qualifying_date!);
    expect(result.qualifying_time).toEqual('17:00');
    expect(result.sprint_date).toEqual(testInputWithOptionals.sprint_date!);
    expect(result.sprint_time).toEqual('12:30');
  });

  it('should save race to database', async () => {
    const result = await createRace(testInput);

    // Query database to verify race was saved
    const races = await db.select()
      .from(racesTable)
      .where(eq(racesTable.id, result.id))
      .execute();

    expect(races).toHaveLength(1);
    const savedRace = races[0];
    
    expect(savedRace.name).toEqual('Monaco Grand Prix');
    expect(savedRace.circuit_name).toEqual('Circuit de Monaco');
    expect(savedRace.country).toEqual('Monaco');
    expect(savedRace.city).toEqual('Monte Carlo');
    expect(savedRace.race_date).toEqual(testInput.race_date);
    expect(savedRace.race_time).toEqual('15:00');
    expect(savedRace.season).toEqual(2024);
    expect(savedRace.round).toEqual(8);
    expect(savedRace.created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple races for same season', async () => {
    // Create first race
    const race1 = await createRace(testInput);
    
    // Create second race with different round
    const race2Input = {
      ...testInput,
      name: 'Spanish Grand Prix',
      circuit_name: 'Circuit de Barcelona-Catalunya',
      country: 'Spain',
      city: 'Barcelona',
      round: 9
    };
    
    const race2 = await createRace(race2Input);

    // Verify both races exist and have different IDs
    expect(race1.id).not.toEqual(race2.id);
    expect(race1.season).toEqual(race2.season);
    expect(race1.round).not.toEqual(race2.round);

    // Verify both are in database
    const allRaces = await db.select()
      .from(racesTable)
      .execute();

    expect(allRaces).toHaveLength(2);
    expect(allRaces.some(r => r.id === race1.id)).toBe(true);
    expect(allRaces.some(r => r.id === race2.id)).toBe(true);
  });

  it('should handle date objects correctly', async () => {
    const result = await createRace(testInputWithOptionals);

    // Verify dates are stored and retrieved as Date objects
    expect(result.race_date).toBeInstanceOf(Date);
    expect(result.practice1_date).toBeInstanceOf(Date);
    expect(result.practice2_date).toBeInstanceOf(Date);
    expect(result.practice3_date).toBeInstanceOf(Date);
    expect(result.qualifying_date).toBeInstanceOf(Date);
    expect(result.sprint_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify dates match input values
    expect(result.race_date.getTime()).toEqual(testInputWithOptionals.race_date.getTime());
    expect(result.practice1_date!.getTime()).toEqual(testInputWithOptionals.practice1_date!.getTime());
    expect(result.practice2_date!.getTime()).toEqual(testInputWithOptionals.practice2_date!.getTime());
    expect(result.practice3_date!.getTime()).toEqual(testInputWithOptionals.practice3_date!.getTime());
    expect(result.qualifying_date!.getTime()).toEqual(testInputWithOptionals.qualifying_date!.getTime());
    expect(result.sprint_date!.getTime()).toEqual(testInputWithOptionals.sprint_date!.getTime());
  });

  it('should create race with mixed optional fields', async () => {
    const mixedInput: CreateRaceInput = {
      ...testInput,
      name: 'Australian Grand Prix',
      circuit_name: 'Albert Park Circuit',
      country: 'Australia',
      city: 'Melbourne',
      round: 1,
      // Only set some optional fields
      practice1_date: new Date('2024-03-22T02:30:00Z'),
      practice1_time: '14:30',
      qualifying_date: new Date('2024-03-23T06:00:00Z'),
      qualifying_time: '16:00'
      // Leave other optional fields undefined
    };

    const result = await createRace(mixedInput);

    // Verify set optional fields
    expect(result.practice1_date).toEqual(mixedInput.practice1_date!);
    expect(result.practice1_time).toEqual('14:30');
    expect(result.qualifying_date).toEqual(mixedInput.qualifying_date!);
    expect(result.qualifying_time).toEqual('16:00');

    // Verify unset optional fields are null
    expect(result.practice2_date).toBeNull();
    expect(result.practice2_time).toBeNull();
    expect(result.practice3_date).toBeNull();
    expect(result.practice3_time).toBeNull();
    expect(result.sprint_date).toBeNull();
    expect(result.sprint_time).toBeNull();
  });
});
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { racesTable, raceResultsTable } from '../db/schema';
import { type CreateRaceResultInput } from '../schema';
import { createRaceResult } from '../handlers/create_race_result';
import { eq } from 'drizzle-orm';

describe('createRaceResult', () => {
  let raceId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create a test race first since race_id is a foreign key
    const raceResult = await db.insert(racesTable)
      .values({
        name: 'Monaco Grand Prix',
        circuit_name: 'Circuit de Monaco',
        country: 'Monaco',
        city: 'Monte Carlo',
        race_date: new Date('2024-05-26'),
        race_time: '15:00',
        season: 2024,
        round: 8
      })
      .returning()
      .execute();
    
    raceId = raceResult[0].id;
  });

  afterEach(resetDB);

  it('should create a race result with all fields', async () => {
    const testInput: CreateRaceResultInput = {
      race_id: raceId,
      result_type: 'race',
      driver_name: 'Max Verstappen',
      team: 'Red Bull Racing',
      position: 1,
      time: '1:41:06.204',
      points: 25,
      laps: 78,
      grid_position: 2,
      fastest_lap: true
    };

    const result = await createRaceResult(testInput);

    // Verify all fields
    expect(result.id).toBeDefined();
    expect(result.race_id).toEqual(raceId);
    expect(result.result_type).toEqual('race');
    expect(result.driver_name).toEqual('Max Verstappen');
    expect(result.team).toEqual('Red Bull Racing');
    expect(result.position).toEqual(1);
    expect(result.time).toEqual('1:41:06.204');
    expect(result.points).toEqual(25);
    expect(result.laps).toEqual(78);
    expect(result.grid_position).toEqual(2);
    expect(result.fastest_lap).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a qualifying result with minimal fields', async () => {
    const testInput: CreateRaceResultInput = {
      race_id: raceId,
      result_type: 'qualifying',
      driver_name: 'Lewis Hamilton',
      team: 'Mercedes'
    };

    const result = await createRaceResult(testInput);

    expect(result.id).toBeDefined();
    expect(result.race_id).toEqual(raceId);
    expect(result.result_type).toEqual('qualifying');
    expect(result.driver_name).toEqual('Lewis Hamilton');
    expect(result.team).toEqual('Mercedes');
    expect(result.position).toBeNull();
    expect(result.time).toBeNull();
    expect(result.points).toBeNull();
    expect(result.laps).toBeNull();
    expect(result.grid_position).toBeNull();
    expect(result.fastest_lap).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a practice session result', async () => {
    const testInput: CreateRaceResultInput = {
      race_id: raceId,
      result_type: 'practice1',
      driver_name: 'Charles Leclerc',
      team: 'Ferrari',
      position: 3,
      time: '1:12.456',
      laps: 25
    };

    const result = await createRaceResult(testInput);

    expect(result.result_type).toEqual('practice1');
    expect(result.driver_name).toEqual('Charles Leclerc');
    expect(result.team).toEqual('Ferrari');
    expect(result.position).toEqual(3);
    expect(result.time).toEqual('1:12.456');
    expect(result.laps).toEqual(25);
    expect(result.points).toBeNull();
  });

  it('should create a sprint result', async () => {
    const testInput: CreateRaceResultInput = {
      race_id: raceId,
      result_type: 'sprint',
      driver_name: 'Lando Norris',
      team: 'McLaren',
      position: 2,
      time: '30:45.123',
      points: 7,
      laps: 17,
      grid_position: 4
    };

    const result = await createRaceResult(testInput);

    expect(result.result_type).toEqual('sprint');
    expect(result.driver_name).toEqual('Lando Norris');
    expect(result.team).toEqual('McLaren');
    expect(result.position).toEqual(2);
    expect(result.points).toEqual(7);
    expect(result.laps).toEqual(17);
    expect(result.grid_position).toEqual(4);
  });

  it('should handle DNF result with no position or time', async () => {
    const testInput: CreateRaceResultInput = {
      race_id: raceId,
      result_type: 'race',
      driver_name: 'George Russell',
      team: 'Mercedes',
      position: null,
      time: 'DNF',
      points: null,
      laps: 45,
      grid_position: 7,
      fastest_lap: false
    };

    const result = await createRaceResult(testInput);

    expect(result.driver_name).toEqual('George Russell');
    expect(result.position).toBeNull();
    expect(result.time).toEqual('DNF');
    expect(result.points).toBeNull();
    expect(result.laps).toEqual(45);
    expect(result.fastest_lap).toEqual(false);
  });

  it('should save race result to database', async () => {
    const testInput: CreateRaceResultInput = {
      race_id: raceId,
      result_type: 'race',
      driver_name: 'Fernando Alonso',
      team: 'Aston Martin',
      position: 5,
      time: '1:41:35.789',
      points: 10
    };

    const result = await createRaceResult(testInput);

    // Query the database to verify the result was saved
    const savedResults = await db.select()
      .from(raceResultsTable)
      .where(eq(raceResultsTable.id, result.id))
      .execute();

    expect(savedResults).toHaveLength(1);
    expect(savedResults[0].driver_name).toEqual('Fernando Alonso');
    expect(savedResults[0].team).toEqual('Aston Martin');
    expect(savedResults[0].position).toEqual(5);
    expect(savedResults[0].time).toEqual('1:41:35.789');
    expect(savedResults[0].points).toEqual(10);
    expect(savedResults[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when race does not exist', async () => {
    const testInput: CreateRaceResultInput = {
      race_id: 99999, // Non-existent race ID
      result_type: 'race',
      driver_name: 'Test Driver',
      team: 'Test Team'
    };

    await expect(createRaceResult(testInput)).rejects.toThrow(/Race with id 99999 does not exist/);
  });

  it('should create multiple results for the same race', async () => {
    const result1Input: CreateRaceResultInput = {
      race_id: raceId,
      result_type: 'qualifying',
      driver_name: 'Driver 1',
      team: 'Team 1',
      position: 1,
      time: '1:10.123'
    };

    const result2Input: CreateRaceResultInput = {
      race_id: raceId,
      result_type: 'qualifying',
      driver_name: 'Driver 2',
      team: 'Team 2',
      position: 2,
      time: '1:10.456'
    };

    const result1 = await createRaceResult(result1Input);
    const result2 = await createRaceResult(result2Input);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.race_id).toEqual(result2.race_id);
    expect(result1.result_type).toEqual('qualifying');
    expect(result2.result_type).toEqual('qualifying');

    // Verify both are saved in database
    const allResults = await db.select()
      .from(raceResultsTable)
      .where(eq(raceResultsTable.race_id, raceId))
      .execute();

    expect(allResults).toHaveLength(2);
  });
});
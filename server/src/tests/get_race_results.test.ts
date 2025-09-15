import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { racesTable, raceResultsTable } from '../db/schema';
import { type GetRaceResultsInput, type CreateRaceInput, type CreateRaceResultInput } from '../schema';
import { getRaceResults } from '../handlers/get_race_results';

// Test race data
const testRace: CreateRaceInput = {
  name: 'Monaco Grand Prix',
  circuit_name: 'Circuit de Monaco',
  country: 'Monaco',
  city: 'Monte Carlo',
  race_date: new Date('2024-05-26'),
  race_time: '15:00',
  qualifying_date: new Date('2024-05-25'),
  qualifying_time: '16:00',
  season: 2024,
  round: 8
};

// Test result data
const testResults: Omit<CreateRaceResultInput, 'race_id'>[] = [
  {
    result_type: 'race',
    driver_name: 'Max Verstappen',
    team: 'Red Bull Racing',
    position: 1,
    time: '1:31:12.345',
    points: 25,
    laps: 78,
    grid_position: 1,
    fastest_lap: true
  },
  {
    result_type: 'race',
    driver_name: 'Lewis Hamilton',
    team: 'Mercedes',
    position: 2,
    time: '+5.234',
    points: 18,
    laps: 78,
    grid_position: 3,
    fastest_lap: false
  },
  {
    result_type: 'race',
    driver_name: 'George Russell',
    team: 'Mercedes',
    position: null, // DNF
    time: 'DNF',
    points: null,
    laps: 45,
    grid_position: 2,
    fastest_lap: false
  },
  {
    result_type: 'qualifying',
    driver_name: 'Max Verstappen',
    team: 'Red Bull Racing',
    position: 1,
    time: '1:10.123',
    points: null,
    laps: null,
    grid_position: null,
    fastest_lap: false
  },
  {
    result_type: 'qualifying',
    driver_name: 'George Russell',
    team: 'Mercedes',
    position: 2,
    time: '1:10.456',
    points: null,
    laps: null,
    grid_position: null,
    fastest_lap: false
  }
];

describe('getRaceResults', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let raceId: number;

  beforeEach(async () => {
    // Create test race
    const raceResult = await db.insert(racesTable)
      .values(testRace)
      .returning()
      .execute();
    raceId = raceResult[0].id;

    // Create test results
    for (const result of testResults) {
      await db.insert(raceResultsTable)
        .values({
          ...result,
          race_id: raceId
        })
        .execute();
    }
  });

  it('should get all race results when no result_type specified', async () => {
    const input: GetRaceResultsInput = {
      race_id: raceId
    };

    const results = await getRaceResults(input);

    expect(results).toHaveLength(5); // All results
    expect(results.every(r => r.race_id === raceId)).toBe(true);
    
    // Check that we have both race and qualifying results
    const raceResults = results.filter(r => r.result_type === 'race');
    const qualifyingResults = results.filter(r => r.result_type === 'qualifying');
    expect(raceResults).toHaveLength(3);
    expect(qualifyingResults).toHaveLength(2);
  });

  it('should get race results filtered by result_type', async () => {
    const input: GetRaceResultsInput = {
      race_id: raceId,
      result_type: 'race'
    };

    const results = await getRaceResults(input);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.result_type === 'race')).toBe(true);
    expect(results.every(r => r.race_id === raceId)).toBe(true);
  });

  it('should get qualifying results filtered by result_type', async () => {
    const input: GetRaceResultsInput = {
      race_id: raceId,
      result_type: 'qualifying'
    };

    const results = await getRaceResults(input);

    expect(results).toHaveLength(2);
    expect(results.every(r => r.result_type === 'qualifying')).toBe(true);
    expect(results.every(r => r.race_id === raceId)).toBe(true);
  });

  it('should return results ordered by position with nulls last', async () => {
    const input: GetRaceResultsInput = {
      race_id: raceId,
      result_type: 'race'
    };

    const results = await getRaceResults(input);

    // Should have 3 results: positions 1, 2, and null (DNF)
    expect(results).toHaveLength(3);
    expect(results[0].position).toBe(1); // Verstappen
    expect(results[0].driver_name).toBe('Max Verstappen');
    expect(results[1].position).toBe(2); // Hamilton
    expect(results[1].driver_name).toBe('Lewis Hamilton');
    expect(results[2].position).toBeNull(); // Russell DNF
    expect(results[2].driver_name).toBe('George Russell');
    expect(results[2].time).toBe('DNF');
  });

  it('should return empty array for non-existent race', async () => {
    const input: GetRaceResultsInput = {
      race_id: 99999
    };

    const results = await getRaceResults(input);

    expect(results).toHaveLength(0);
  });

  it('should return empty array for valid race but non-existent result_type', async () => {
    const input: GetRaceResultsInput = {
      race_id: raceId,
      result_type: 'sprint'
    };

    const results = await getRaceResults(input);

    expect(results).toHaveLength(0);
  });

  it('should handle qualifying results correctly', async () => {
    const input: GetRaceResultsInput = {
      race_id: raceId,
      result_type: 'qualifying'
    };

    const results = await getRaceResults(input);

    expect(results).toHaveLength(2);
    
    // Check qualifying-specific fields
    results.forEach(result => {
      expect(result.result_type).toBe('qualifying');
      expect(result.points).toBeNull(); // No points for qualifying
      expect(result.laps).toBeNull(); // No lap count for qualifying
      expect(result.grid_position).toBeNull(); // No grid position for qualifying itself
      expect(result.fastest_lap).toBe(false); // No fastest lap for qualifying
    });

    // Check ordering by position
    expect(results[0].position).toBe(1);
    expect(results[0].driver_name).toBe('Max Verstappen');
    expect(results[1].position).toBe(2);
    expect(results[1].driver_name).toBe('George Russell');
  });

  it('should handle race results with all field types correctly', async () => {
    const input: GetRaceResultsInput = {
      race_id: raceId,
      result_type: 'race'
    };

    const results = await getRaceResults(input);

    // Check Verstappen (winner)
    const verstappen = results.find(r => r.driver_name === 'Max Verstappen');
    expect(verstappen).toBeDefined();
    expect(verstappen!.position).toBe(1);
    expect(verstappen!.time).toBe('1:31:12.345');
    expect(verstappen!.points).toBe(25);
    expect(verstappen!.laps).toBe(78);
    expect(verstappen!.grid_position).toBe(1);
    expect(verstappen!.fastest_lap).toBe(true);

    // Check Russell (DNF)
    const russell = results.find(r => r.driver_name === 'George Russell');
    expect(russell).toBeDefined();
    expect(russell!.position).toBeNull();
    expect(russell!.time).toBe('DNF');
    expect(russell!.points).toBeNull();
    expect(russell!.laps).toBe(45);
    expect(russell!.grid_position).toBe(2);
    expect(russell!.fastest_lap).toBe(false);
  });

  it('should have correct field types in returned results', async () => {
    const input: GetRaceResultsInput = {
      race_id: raceId,
      result_type: 'race'
    };

    const results = await getRaceResults(input);
    const result = results[0];

    expect(typeof result.id).toBe('number');
    expect(typeof result.race_id).toBe('number');
    expect(typeof result.result_type).toBe('string');
    expect(typeof result.driver_name).toBe('string');
    expect(typeof result.team).toBe('string');
    expect(typeof result.time).toBe('string');
    expect(typeof result.fastest_lap).toBe('boolean');
    expect(result.created_at).toBeInstanceOf(Date);
    
    // Numeric fields (can be null)
    if (result.position !== null) {
      expect(typeof result.position).toBe('number');
    }
    if (result.points !== null) {
      expect(typeof result.points).toBe('number');
    }
    if (result.laps !== null) {
      expect(typeof result.laps).toBe('number');
    }
    if (result.grid_position !== null) {
      expect(typeof result.grid_position).toBe('number');
    }
  });
});
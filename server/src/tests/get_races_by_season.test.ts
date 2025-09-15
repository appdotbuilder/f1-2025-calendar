import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { racesTable } from '../db/schema';
import { type GetRacesBySeasonInput } from '../schema';
import { getRacesBySeason } from '../handlers/get_races_by_season';

// Test input for season query
const testInput: GetRacesBySeasonInput = {
  season: 2024
};

// Test race data for 2024 season
const testRaces2024 = [
  {
    name: 'Bahrain Grand Prix',
    circuit_name: 'Bahrain International Circuit',
    country: 'Bahrain',
    city: 'Sakhir',
    race_date: new Date('2024-03-02'),
    race_time: '15:00',
    practice1_date: new Date('2024-02-29'),
    practice1_time: '11:30',
    practice2_date: new Date('2024-02-29'),
    practice2_time: '15:00',
    practice3_date: new Date('2024-03-01'),
    practice3_time: '11:30',
    qualifying_date: new Date('2024-03-01'),
    qualifying_time: '15:00',
    sprint_date: null,
    sprint_time: null,
    season: 2024,
    round: 1
  },
  {
    name: 'Saudi Arabian Grand Prix',
    circuit_name: 'Jeddah Corniche Circuit',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    race_date: new Date('2024-03-09'),
    race_time: '18:00',
    practice1_date: new Date('2024-03-07'),
    practice1_time: '13:30',
    practice2_date: new Date('2024-03-07'),
    practice2_time: '17:00',
    practice3_date: new Date('2024-03-08'),
    practice3_time: '13:30',
    qualifying_date: new Date('2024-03-08'),
    qualifying_time: '17:00',
    sprint_date: null,
    sprint_time: null,
    season: 2024,
    round: 2
  },
  {
    name: 'Australian Grand Prix',
    circuit_name: 'Albert Park Circuit',
    country: 'Australia',
    city: 'Melbourne',
    race_date: new Date('2024-03-24'),
    race_time: '15:00',
    practice1_date: new Date('2024-03-22'),
    practice1_time: '12:30',
    practice2_date: new Date('2024-03-22'),
    practice2_time: '16:00',
    practice3_date: new Date('2024-03-23'),
    practice3_time: '12:30',
    qualifying_date: new Date('2024-03-23'),
    qualifying_time: '16:00',
    sprint_date: null,
    sprint_time: null,
    season: 2024,
    round: 3
  }
];

// Test race data for 2023 season
const testRaces2023 = [
  {
    name: 'Bahrain Grand Prix',
    circuit_name: 'Bahrain International Circuit',
    country: 'Bahrain',
    city: 'Sakhir',
    race_date: new Date('2023-03-05'),
    race_time: '15:00',
    practice1_date: new Date('2023-03-03'),
    practice1_time: '11:30',
    practice2_date: new Date('2023-03-03'),
    practice2_time: '15:00',
    practice3_date: new Date('2023-03-04'),
    practice3_time: '11:30',
    qualifying_date: new Date('2023-03-04'),
    qualifying_time: '15:00',
    sprint_date: null,
    sprint_time: null,
    season: 2023,
    round: 1
  }
];

describe('getRacesBySeason', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return races for specified season ordered by round', async () => {
    // Insert test data for 2024 season
    await db.insert(racesTable).values(testRaces2024).execute();

    const result = await getRacesBySeason({ season: 2024 });

    expect(result).toHaveLength(3);
    
    // Verify all races are from the correct season
    expect(result.every(race => race.season === 2024)).toBe(true);
    
    // Verify ordering by round number
    expect(result[0].round).toBe(1);
    expect(result[1].round).toBe(2);
    expect(result[2].round).toBe(3);
    
    // Verify race names are in correct order
    expect(result[0].name).toBe('Bahrain Grand Prix');
    expect(result[1].name).toBe('Saudi Arabian Grand Prix');
    expect(result[2].name).toBe('Australian Grand Prix');
  });

  it('should return empty array for season with no races', async () => {
    // Insert test data for 2024 season only
    await db.insert(racesTable).values(testRaces2024).execute();

    const result = await getRacesBySeason({ season: 2025 });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should filter races correctly by season', async () => {
    // Insert races for both 2023 and 2024 seasons
    await db.insert(racesTable).values([...testRaces2023, ...testRaces2024]).execute();

    const result2024 = await getRacesBySeason({ season: 2024 });
    const result2023 = await getRacesBySeason({ season: 2023 });

    // Verify 2024 results
    expect(result2024).toHaveLength(3);
    expect(result2024.every(race => race.season === 2024)).toBe(true);

    // Verify 2023 results
    expect(result2023).toHaveLength(1);
    expect(result2023.every(race => race.season === 2023)).toBe(true);
    expect(result2023[0].name).toBe('Bahrain Grand Prix');
    expect(result2023[0].race_date.getFullYear()).toBe(2023);
  });

  it('should return all race fields correctly', async () => {
    // Insert single race with all fields
    const completeRace = {
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
      sprint_date: new Date('2024-05-25'),
      sprint_time: '12:00',
      season: 2024,
      round: 6
    };

    await db.insert(racesTable).values([completeRace]).execute();

    const result = await getRacesBySeason({ season: 2024 });

    expect(result).toHaveLength(1);
    const race = result[0];

    // Verify all fields are present and correct
    expect(race.id).toBeDefined();
    expect(race.name).toBe('Monaco Grand Prix');
    expect(race.circuit_name).toBe('Circuit de Monaco');
    expect(race.country).toBe('Monaco');
    expect(race.city).toBe('Monte Carlo');
    expect(race.race_date).toBeInstanceOf(Date);
    expect(race.race_time).toBe('15:00');
    expect(race.practice1_date).toBeInstanceOf(Date);
    expect(race.practice1_time).toBe('13:30');
    expect(race.practice2_date).toBeInstanceOf(Date);
    expect(race.practice2_time).toBe('17:00');
    expect(race.practice3_date).toBeInstanceOf(Date);
    expect(race.practice3_time).toBe('12:30');
    expect(race.qualifying_date).toBeInstanceOf(Date);
    expect(race.qualifying_time).toBe('16:00');
    expect(race.sprint_date).toBeInstanceOf(Date);
    expect(race.sprint_time).toBe('12:00');
    expect(race.season).toBe(2024);
    expect(race.round).toBe(6);
    expect(race.created_at).toBeInstanceOf(Date);
  });

  it('should handle races with null optional fields', async () => {
    // Insert race with minimal data (no practice sessions, qualifying, or sprint)
    const minimalRace = {
      name: 'Test Grand Prix',
      circuit_name: 'Test Circuit',
      country: 'Test Country',
      city: 'Test City',
      race_date: new Date('2024-06-02'),
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

    await db.insert(racesTable).values([minimalRace]).execute();

    const result = await getRacesBySeason({ season: 2024 });

    expect(result).toHaveLength(1);
    const race = result[0];

    // Verify required fields are present
    expect(race.name).toBe('Test Grand Prix');
    expect(race.season).toBe(2024);
    expect(race.round).toBe(10);

    // Verify null fields are handled correctly
    expect(race.practice1_date).toBeNull();
    expect(race.practice1_time).toBeNull();
    expect(race.practice2_date).toBeNull();
    expect(race.practice2_time).toBeNull();
    expect(race.practice3_date).toBeNull();
    expect(race.practice3_time).toBeNull();
    expect(race.qualifying_date).toBeNull();
    expect(race.qualifying_time).toBeNull();
    expect(race.sprint_date).toBeNull();
    expect(race.sprint_time).toBeNull();
  });

  it('should maintain correct round ordering with mixed round numbers', async () => {
    // Insert races in random order
    const unorderedRaces = [
      {
        name: 'Race Round 5',
        circuit_name: 'Circuit 5',
        country: 'Country 5',
        city: 'City 5',
        race_date: new Date('2024-05-01'),
        race_time: '15:00',
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
        round: 5
      },
      {
        name: 'Race Round 1',
        circuit_name: 'Circuit 1',
        country: 'Country 1',
        city: 'City 1',
        race_date: new Date('2024-01-01'),
        race_time: '15:00',
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
        round: 1
      },
      {
        name: 'Race Round 3',
        circuit_name: 'Circuit 3',
        country: 'Country 3',
        city: 'City 3',
        race_date: new Date('2024-03-01'),
        race_time: '15:00',
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
        round: 3
      }
    ];

    await db.insert(racesTable).values(unorderedRaces).execute();

    const result = await getRacesBySeason({ season: 2024 });

    expect(result).toHaveLength(3);
    
    // Verify they are returned in round order (1, 3, 5)
    expect(result[0].round).toBe(1);
    expect(result[0].name).toBe('Race Round 1');
    expect(result[1].round).toBe(3);
    expect(result[1].name).toBe('Race Round 3');
    expect(result[2].round).toBe(5);
    expect(result[2].name).toBe('Race Round 5');
  });
});
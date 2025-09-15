import { db } from '../db';
import { racesTable, raceResultsTable } from '../db/schema';
import { createDB, resetDB } from '../helpers';
import { eq } from 'drizzle-orm';

// 2025 F1 Season Race Data
const races2025 = [
  {
    name: 'Bahrain Grand Prix',
    circuit_name: 'Bahrain International Circuit',
    country: 'Bahrain',
    city: 'Sakhir',
    race_date: new Date('2025-03-16'),
    race_time: '15:00',
    practice1_date: new Date('2025-03-14'),
    practice1_time: '11:30',
    practice2_date: new Date('2025-03-14'),
    practice2_time: '15:00',
    practice3_date: new Date('2025-03-15'),
    practice3_time: '11:30',
    qualifying_date: new Date('2025-03-15'),
    qualifying_time: '15:00',
    sprint_date: null,
    sprint_time: null,
    season: 2025,
    round: 1
  },
  {
    name: 'Saudi Arabian Grand Prix',
    circuit_name: 'Jeddah Corniche Circuit',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    race_date: new Date('2025-03-23'),
    race_time: '18:00',
    practice1_date: new Date('2025-03-21'),
    practice1_time: '13:30',
    practice2_date: new Date('2025-03-21'),
    practice2_time: '17:00',
    practice3_date: new Date('2025-03-22'),
    practice3_time: '13:30',
    qualifying_date: new Date('2025-03-22'),
    qualifying_time: '17:00',
    sprint_date: null,
    sprint_time: null,
    season: 2025,
    round: 2
  },
  {
    name: 'Australian Grand Prix',
    circuit_name: 'Albert Park Grand Prix Circuit',
    country: 'Australia',
    city: 'Melbourne',
    race_date: new Date('2025-04-06'),
    race_time: '05:00',
    practice1_date: new Date('2025-04-04'),
    practice1_time: '01:30',
    practice2_date: new Date('2025-04-04'),
    practice2_time: '05:00',
    practice3_date: new Date('2025-04-05'),
    practice3_time: '01:30',
    qualifying_date: new Date('2025-04-05'),
    qualifying_time: '05:00',
    sprint_date: null,
    sprint_time: null,
    season: 2025,
    round: 3
  },
  {
    name: 'Chinese Grand Prix',
    circuit_name: 'Shanghai International Circuit',
    country: 'China',
    city: 'Shanghai',
    race_date: new Date('2025-04-20'),
    race_time: '07:00',
    practice1_date: new Date('2025-04-18'),
    practice1_time: '03:30',
    practice2_date: new Date('2025-04-18'),
    practice2_time: '07:00',
    practice3_date: new Date('2025-04-19'),
    practice3_time: '03:30',
    qualifying_date: new Date('2025-04-19'),
    qualifying_time: '07:00',
    sprint_date: null,
    sprint_time: null,
    season: 2025,
    round: 4
  },
  {
    name: 'Miami Grand Prix',
    circuit_name: 'Miami International Autodrome',
    country: 'United States',
    city: 'Miami',
    race_date: new Date('2025-05-04'),
    race_time: '20:00',
    practice1_date: new Date('2025-05-02'),
    practice1_time: '16:30',
    practice2_date: new Date('2025-05-02'),
    practice2_time: '20:00',
    practice3_date: new Date('2025-05-03'),
    practice3_time: '16:30',
    qualifying_date: new Date('2025-05-03'),
    qualifying_time: '20:00',
    sprint_date: null,
    sprint_time: null,
    season: 2025,
    round: 5
  },
  {
    name: 'Monaco Grand Prix',
    circuit_name: 'Circuit de Monaco',
    country: 'Monaco',
    city: 'Monaco',
    race_date: new Date('2025-05-25'),
    race_time: '15:00',
    practice1_date: new Date('2025-05-23'),
    practice1_time: '13:30',
    practice2_date: new Date('2025-05-23'),
    practice2_time: '17:00',
    practice3_date: new Date('2025-05-24'),
    practice3_time: '12:30',
    qualifying_date: new Date('2025-05-24'),
    qualifying_time: '16:00',
    sprint_date: null,
    sprint_time: null,
    season: 2025,
    round: 6
  },
  {
    name: 'Spanish Grand Prix',
    circuit_name: 'Circuit de Barcelona-Catalunya',
    country: 'Spain',
    city: 'Barcelona',
    race_date: new Date('2025-06-15'),
    race_time: '15:00',
    practice1_date: new Date('2025-06-13'),
    practice1_time: '13:30',
    practice2_date: new Date('2025-06-14'),
    practice2_time: '12:00',
    qualifying_date: new Date('2025-06-14'),
    qualifying_time: '16:00',
    sprint_date: new Date('2025-06-14'),
    sprint_time: '16:00',
    practice3_date: null,
    practice3_time: null,
    season: 2025,
    round: 7
  }
];

// Sample race results data
const getRaceResultsData = () => {
  // Qualifying Results for Bahrain GP
  const bahrainQualifyingResults = [
    { driver_name: 'Max Verstappen', team: 'Red Bull Racing', position: 1, time: '1:29.179', grid_position: 1 },
    { driver_name: 'Charles Leclerc', team: 'Ferrari', position: 2, time: '1:29.456', grid_position: 2 },
    { driver_name: 'Lando Norris', team: 'McLaren', position: 3, time: '1:29.678', grid_position: 3 },
    { driver_name: 'George Russell', team: 'Mercedes', position: 4, time: '1:29.892', grid_position: 4 },
    { driver_name: 'Carlos Sainz Jr.', team: 'Ferrari', position: 5, time: '1:30.145', grid_position: 5 },
    { driver_name: 'Lewis Hamilton', team: 'Mercedes', position: 6, time: '1:30.234', grid_position: 6 },
    { driver_name: 'Oscar Piastri', team: 'McLaren', position: 7, time: '1:30.456', grid_position: 7 },
    { driver_name: 'Fernando Alonso', team: 'Aston Martin', position: 8, time: '1:30.567', grid_position: 8 },
    { driver_name: 'Lance Stroll', team: 'Aston Martin', position: 9, time: '1:30.678', grid_position: 9 },
    { driver_name: 'Sergio Perez', team: 'Red Bull Racing', position: 10, time: '1:30.789', grid_position: 10 },
    { driver_name: 'Pierre Gasly', team: 'Alpine', position: 11, time: '1:30.890', grid_position: 11 },
    { driver_name: 'Esteban Ocon', team: 'Alpine', position: 12, time: '1:30.945', grid_position: 12 },
    { driver_name: 'Yuki Tsunoda', team: 'RB', position: 13, time: '1:31.023', grid_position: 13 },
    { driver_name: 'Daniel Ricciardo', team: 'RB', position: 14, time: '1:31.134', grid_position: 14 },
    { driver_name: 'Alexander Albon', team: 'Williams', position: 15, time: '1:31.245', grid_position: 15 },
    { driver_name: 'Logan Sargeant', team: 'Williams', position: 16, time: '1:31.356', grid_position: 16 },
    { driver_name: 'Nico Hulkenberg', team: 'Haas', position: 17, time: '1:31.467', grid_position: 17 },
    { driver_name: 'Kevin Magnussen', team: 'Haas', position: 18, time: '1:31.578', grid_position: 18 },
    { driver_name: 'Valtteri Bottas', team: 'Kick Sauber', position: 19, time: '1:31.689', grid_position: 19 },
    { driver_name: 'Zhou Guanyu', team: 'Kick Sauber', position: 20, time: '1:31.790', grid_position: 20 }
  ];

  // Race Results for Bahrain GP
  const bahrainRaceResults = [
    { driver_name: 'Max Verstappen', team: 'Red Bull Racing', position: 1, time: '1:31:44.742', points: 25, laps: 57, grid_position: 1, fastest_lap: true },
    { driver_name: 'Charles Leclerc', team: 'Ferrari', position: 2, time: '+11.987', points: 18, laps: 57, grid_position: 2, fastest_lap: false },
    { driver_name: 'George Russell', team: 'Mercedes', position: 3, time: '+23.456', points: 15, laps: 57, grid_position: 4, fastest_lap: false },
    { driver_name: 'Lando Norris', team: 'McLaren', position: 4, time: '+34.123', points: 12, laps: 57, grid_position: 3, fastest_lap: false },
    { driver_name: 'Lewis Hamilton', team: 'Mercedes', position: 5, time: '+45.678', points: 10, laps: 57, grid_position: 6, fastest_lap: false },
    { driver_name: 'Carlos Sainz Jr.', team: 'Ferrari', position: 6, time: '+56.234', points: 8, laps: 57, grid_position: 5, fastest_lap: false },
    { driver_name: 'Oscar Piastri', team: 'McLaren', position: 7, time: '+1:07.890', points: 6, laps: 57, grid_position: 7, fastest_lap: false },
    { driver_name: 'Fernando Alonso', team: 'Aston Martin', position: 8, time: '+1:18.567', points: 4, laps: 57, grid_position: 8, fastest_lap: false },
    { driver_name: 'Lance Stroll', team: 'Aston Martin', position: 9, time: '+1:29.345', points: 2, laps: 57, grid_position: 9, fastest_lap: false },
    { driver_name: 'Pierre Gasly', team: 'Alpine', position: 10, time: '+1:40.123', points: 1, laps: 57, grid_position: 11, fastest_lap: false },
    { driver_name: 'Esteban Ocon', team: 'Alpine', position: 11, time: '+1:51.456', points: 0, laps: 57, grid_position: 12, fastest_lap: false },
    { driver_name: 'Yuki Tsunoda', team: 'RB', position: 12, time: '+2:02.789', points: 0, laps: 57, grid_position: 13, fastest_lap: false },
    { driver_name: 'Daniel Ricciardo', team: 'RB', position: 13, time: '+2:13.234', points: 0, laps: 57, grid_position: 14, fastest_lap: false },
    { driver_name: 'Alexander Albon', team: 'Williams', position: 14, time: '+2:24.567', points: 0, laps: 57, grid_position: 15, fastest_lap: false },
    { driver_name: 'Nico Hulkenberg', team: 'Haas', position: 15, time: '+2:35.890', points: 0, laps: 57, grid_position: 17, fastest_lap: false },
    { driver_name: 'Kevin Magnussen', team: 'Haas', position: 16, time: '+2:46.123', points: 0, laps: 57, grid_position: 18, fastest_lap: false },
    { driver_name: 'Valtteri Bottas', team: 'Kick Sauber', position: 17, time: '+3:01.456', points: 0, laps: 56, grid_position: 19, fastest_lap: false },
    { driver_name: 'Zhou Guanyu', team: 'Kick Sauber', position: 18, time: '+3:12.789', points: 0, laps: 56, grid_position: 20, fastest_lap: false },
    { driver_name: 'Sergio Perez', team: 'Red Bull Racing', position: null, time: 'DNF', points: 0, laps: 34, grid_position: 10, fastest_lap: false },
    { driver_name: 'Logan Sargeant', team: 'Williams', position: null, time: 'DNF', points: 0, laps: 28, grid_position: 16, fastest_lap: false }
  ];

  // Qualifying Results for Australian GP
  const australianQualifyingResults = [
    { driver_name: 'Lando Norris', team: 'McLaren', position: 1, time: '1:16.381', grid_position: 1 },
    { driver_name: 'Max Verstappen', team: 'Red Bull Racing', position: 2, time: '1:16.492', grid_position: 2 },
    { driver_name: 'Charles Leclerc', team: 'Ferrari', position: 3, time: '1:16.567', grid_position: 3 },
    { driver_name: 'Oscar Piastri', team: 'McLaren', position: 4, time: '1:16.678', grid_position: 4 },
    { driver_name: 'George Russell', team: 'Mercedes', position: 5, time: '1:16.789', grid_position: 5 },
    { driver_name: 'Carlos Sainz Jr.', team: 'Ferrari', position: 6, time: '1:16.890', grid_position: 6 },
    { driver_name: 'Lewis Hamilton', team: 'Mercedes', position: 7, time: '1:16.945', grid_position: 7 },
    { driver_name: 'Fernando Alonso', team: 'Aston Martin', position: 8, time: '1:17.023', grid_position: 8 },
    { driver_name: 'Sergio Perez', team: 'Red Bull Racing', position: 9, time: '1:17.134', grid_position: 9 },
    { driver_name: 'Lance Stroll', team: 'Aston Martin', position: 10, time: '1:17.245', grid_position: 10 },
    { driver_name: 'Pierre Gasly', team: 'Alpine', position: 11, time: '1:17.356', grid_position: 11 },
    { driver_name: 'Yuki Tsunoda', team: 'RB', position: 12, time: '1:17.467', grid_position: 12 },
    { driver_name: 'Daniel Ricciardo', team: 'RB', position: 13, time: '1:17.578', grid_position: 13 },
    { driver_name: 'Esteban Ocon', team: 'Alpine', position: 14, time: '1:17.689', grid_position: 14 },
    { driver_name: 'Alexander Albon', team: 'Williams', position: 15, time: '1:17.790', grid_position: 15 },
    { driver_name: 'Kevin Magnussen', team: 'Haas', position: 16, time: '1:17.891', grid_position: 16 },
    { driver_name: 'Nico Hulkenberg', team: 'Haas', position: 17, time: '1:17.992', grid_position: 17 },
    { driver_name: 'Logan Sargeant', team: 'Williams', position: 18, time: '1:18.093', grid_position: 18 },
    { driver_name: 'Valtteri Bottas', team: 'Kick Sauber', position: 19, time: '1:18.194', grid_position: 19 },
    { driver_name: 'Zhou Guanyu', team: 'Kick Sauber', position: 20, time: '1:18.295', grid_position: 20 }
  ];

  // Race Results for Australian GP
  const australianRaceResults = [
    { driver_name: 'Lando Norris', team: 'McLaren', position: 1, time: '1:20:26.843', points: 25, laps: 58, grid_position: 1, fastest_lap: false },
    { driver_name: 'Max Verstappen', team: 'Red Bull Racing', position: 2, time: '+7.169', points: 19, laps: 58, grid_position: 2, fastest_lap: true },
    { driver_name: 'Charles Leclerc', team: 'Ferrari', position: 3, time: '+15.921', points: 15, laps: 58, grid_position: 3, fastest_lap: false },
    { driver_name: 'Oscar Piastri', team: 'McLaren', position: 4, time: '+25.847', points: 12, laps: 58, grid_position: 4, fastest_lap: false },
    { driver_name: 'Carlos Sainz Jr.', team: 'Ferrari', position: 5, time: '+36.535', points: 10, laps: 58, grid_position: 6, fastest_lap: false },
    { driver_name: 'George Russell', team: 'Mercedes', position: 6, time: '+47.392', points: 8, laps: 58, grid_position: 5, fastest_lap: false },
    { driver_name: 'Lewis Hamilton', team: 'Mercedes', position: 7, time: '+58.248', points: 6, laps: 58, grid_position: 7, fastest_lap: false },
    { driver_name: 'Fernando Alonso', team: 'Aston Martin', position: 8, time: '+1:09.134', points: 4, laps: 58, grid_position: 8, fastest_lap: false },
    { driver_name: 'Sergio Perez', team: 'Red Bull Racing', position: 9, time: '+1:20.567', points: 2, laps: 58, grid_position: 9, fastest_lap: false },
    { driver_name: 'Pierre Gasly', team: 'Alpine', position: 10, time: '+1:31.892', points: 1, laps: 58, grid_position: 11, fastest_lap: false },
    { driver_name: 'Yuki Tsunoda', team: 'RB', position: 11, time: '+1:42.345', points: 0, laps: 58, grid_position: 12, fastest_lap: false },
    { driver_name: 'Daniel Ricciardo', team: 'RB', position: 12, time: '+1:53.678', points: 0, laps: 58, grid_position: 13, fastest_lap: false },
    { driver_name: 'Alexander Albon', team: 'Williams', position: 13, time: '+2:04.234', points: 0, laps: 58, grid_position: 15, fastest_lap: false },
    { driver_name: 'Kevin Magnussen', team: 'Haas', position: 14, time: '+2:15.567', points: 0, laps: 57, grid_position: 16, fastest_lap: false },
    { driver_name: 'Nico Hulkenberg', team: 'Haas', position: 15, time: '+2:26.890', points: 0, laps: 57, grid_position: 17, fastest_lap: false },
    { driver_name: 'Valtteri Bottas', team: 'Kick Sauber', position: 16, time: '+2:37.123', points: 0, laps: 57, grid_position: 19, fastest_lap: false },
    { driver_name: 'Zhou Guanyu', team: 'Kick Sauber', position: 17, time: '+2:48.456', points: 0, laps: 57, grid_position: 20, fastest_lap: false },
    { driver_name: 'Lance Stroll', team: 'Aston Martin', position: null, time: 'DNF', points: 0, laps: 41, grid_position: 10, fastest_lap: false },
    { driver_name: 'Esteban Ocon', team: 'Alpine', position: null, time: 'DNF', points: 0, laps: 37, grid_position: 14, fastest_lap: false },
    { driver_name: 'Logan Sargeant', team: 'Williams', position: null, time: 'DNF', points: 0, laps: 23, grid_position: 18, fastest_lap: false }
  ];

  // Monaco GP Qualifying Results
  const monacoQualifyingResults = [
    { driver_name: 'Charles Leclerc', team: 'Ferrari', position: 1, time: '1:10.270', grid_position: 1 },
    { driver_name: 'Oscar Piastri', team: 'McLaren', position: 2, time: '1:10.458', grid_position: 2 },
    { driver_name: 'Carlos Sainz Jr.', team: 'Ferrari', position: 3, time: '1:10.631', grid_position: 3 },
    { driver_name: 'Lando Norris', team: 'McLaren', position: 4, time: '1:10.729', grid_position: 4 },
    { driver_name: 'George Russell', team: 'Mercedes', position: 5, time: '1:10.856', grid_position: 5 },
    { driver_name: 'Max Verstappen', team: 'Red Bull Racing', position: 6, time: '1:10.943', grid_position: 6 },
    { driver_name: 'Lewis Hamilton', team: 'Mercedes', position: 7, time: '1:11.024', grid_position: 7 },
    { driver_name: 'Yuki Tsunoda', team: 'RB', position: 8, time: '1:11.156', grid_position: 8 },
    { driver_name: 'Alexander Albon', team: 'Williams', position: 9, time: '1:11.287', grid_position: 9 },
    { driver_name: 'Pierre Gasly', team: 'Alpine', position: 10, time: '1:11.398', grid_position: 10 },
    { driver_name: 'Fernando Alonso', team: 'Aston Martin', position: 11, time: '1:11.479', grid_position: 11 },
    { driver_name: 'Daniel Ricciardo', team: 'RB', position: 12, time: '1:11.567', grid_position: 12 },
    { driver_name: 'Sergio Perez', team: 'Red Bull Racing', position: 13, time: '1:11.689', grid_position: 13 },
    { driver_name: 'Lance Stroll', team: 'Aston Martin', position: 14, time: '1:11.790', grid_position: 14 },
    { driver_name: 'Esteban Ocon', team: 'Alpine', position: 15, time: '1:11.891', grid_position: 15 },
    { driver_name: 'Logan Sargeant', team: 'Williams', position: 16, time: '1:11.992', grid_position: 16 },
    { driver_name: 'Kevin Magnussen', team: 'Haas', position: 17, time: '1:12.093', grid_position: 17 },
    { driver_name: 'Nico Hulkenberg', team: 'Haas', position: 18, time: '1:12.194', grid_position: 18 },
    { driver_name: 'Valtteri Bottas', team: 'Kick Sauber', position: 19, time: '1:12.295', grid_position: 19 },
    { driver_name: 'Zhou Guanyu', team: 'Kick Sauber', position: 20, time: '1:12.396', grid_position: 20 }
  ];

  return {
    bahrainQualifyingResults,
    bahrainRaceResults,
    australianQualifyingResults,
    australianRaceResults,
    monacoQualifyingResults
  };
};

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Reset and create database
    try {
      await resetDB();
      console.log('✅ Database reset completed');
    } catch (resetError) {
      console.log('⚠️ Database reset skipped (may not exist yet)');
    }
    
    await createDB();
    console.log('✅ Database created');

    // Check if races already exist
    const existingRaces = await db.select().from(racesTable).where(eq(racesTable.season, 2025)).execute();
    if (existingRaces.length > 0) {
      console.log('⚠️ 2025 season races already exist, returning existing data');
      return {
        races: existingRaces.length,
        results: 0,
        message: 'Database already contains 2025 F1 season data'
      };
    }

    // Insert races
    console.log('📅 Inserting races...');
    const insertedRaces = await db.insert(racesTable)
      .values(races2025)
      .returning()
      .execute();
    
    console.log(`✅ Inserted ${insertedRaces.length} races`);

    // Get race results data
    const resultsData = getRaceResultsData();
    const allResults: any[] = [];

    // Bahrain GP results (race_id should be 1)
    const bahrainRaceId = insertedRaces[0].id;
    
    // Add qualifying results for Bahrain
    resultsData.bahrainQualifyingResults.forEach(result => {
      allResults.push({
        race_id: bahrainRaceId,
        result_type: 'qualifying' as const,
        ...result
      });
    });

    // Add race results for Bahrain
    resultsData.bahrainRaceResults.forEach(result => {
      allResults.push({
        race_id: bahrainRaceId,
        result_type: 'race' as const,
        ...result
      });
    });

    // Australian GP results (race_id should be 3)
    const australianRaceId = insertedRaces[2].id;
    
    // Add qualifying results for Australia
    resultsData.australianQualifyingResults.forEach(result => {
      allResults.push({
        race_id: australianRaceId,
        result_type: 'qualifying' as const,
        ...result
      });
    });

    // Add race results for Australia
    resultsData.australianRaceResults.forEach(result => {
      allResults.push({
        race_id: australianRaceId,
        result_type: 'race' as const,
        ...result
      });
    });

    // Monaco GP qualifying results (race_id should be 6)
    const monacoRaceId = insertedRaces[5].id;
    
    // Add qualifying results for Monaco
    resultsData.monacoQualifyingResults.forEach(result => {
      allResults.push({
        race_id: monacoRaceId,
        result_type: 'qualifying' as const,
        ...result
      });
    });

    // Insert all race results
    console.log('🏁 Inserting race results...');
    await db.insert(raceResultsTable)
      .values(allResults)
      .execute();
    
    console.log(`✅ Inserted ${allResults.length} race results`);
    console.log('🎉 Database seeding completed successfully!');

    return {
      races: insertedRaces.length,
      results: allResults.length,
      message: 'Database seeded successfully with 2025 F1 season data'
    };

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};
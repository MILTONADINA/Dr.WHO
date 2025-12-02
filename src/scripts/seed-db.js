const models = require('../models');
const sequelize = require('../db/sequelize');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Check if data already exists
    const existingActors = await models.Actor.count();
    if (existingActors > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      console.log('   To re-seed, run: npm run db:sync (this will drop all tables)');
      process.exit(0);
    }

    // Seed ACTORS
    const actors = await models.Actor.bulkCreate([
      { name: 'William Hartnell', birth_date: '1908-01-08', nationality: 'British' },
      { name: 'Patrick Troughton', birth_date: '1920-03-25', nationality: 'British' },
      { name: 'Jon Pertwee', birth_date: '1919-07-07', nationality: 'British' },
      { name: 'Tom Baker', birth_date: '1934-01-20', nationality: 'British' },
      { name: 'David Tennant', birth_date: '1971-04-18', nationality: 'Scottish' },
      { name: 'Matt Smith', birth_date: '1982-10-28', nationality: 'British' },
      { name: 'Jodie Whittaker', birth_date: '1982-06-17', nationality: 'British' },
      { name: 'Billie Piper', birth_date: '1982-09-22', nationality: 'British' },
      { name: 'Karen Gillan', birth_date: '1987-11-28', nationality: 'Scottish' },
      { name: 'Jenna Coleman', birth_date: '1986-04-27', nationality: 'British' }
    ]);
    console.log('✓ Actors seeded');

    // Seed WRITERS
    const writers = await models.Writer.bulkCreate([
      { name: 'Russell T Davies', notable_works: 'Doctor Who (2005-2010), Torchwood' },
      { name: 'Steven Moffat', notable_works: 'Doctor Who (2010-2017), Sherlock' },
      { name: 'Terry Nation', notable_works: 'Creator of the Daleks' },
      { name: 'Robert Holmes', notable_works: 'Classic Who writer' },
      { name: 'Chris Chibnall', notable_works: 'Doctor Who (2018-2022), Broadchurch' }
    ]);
    console.log('✓ Writers seeded');

    // Seed DIRECTORS
    const directors = await models.Director.bulkCreate([
      { name: 'Graeme Harper' },
      { name: 'Euros Lyn' },
      { name: 'James Hawes' },
      { name: 'Rachel Talalay' },
      { name: 'Jamie Payne' }
    ]);
    console.log('✓ Directors seeded');

    // Seed PLANETS
    const planets = await models.Planet.bulkCreate([
      { name: 'Gallifrey', galaxy: 'Kasterborous', description: 'Home planet of the Time Lords' },
      { name: 'Earth', galaxy: 'Milky Way', description: 'Human homeworld' },
      { name: 'Skaro', galaxy: 'Unknown', description: 'Home planet of the Daleks' },
      { name: 'Mondas', galaxy: 'Unknown', description: 'Twin planet of Earth' },
      { name: 'New Earth', galaxy: 'Unknown', description: 'Colony planet' }
    ]);
    console.log('✓ Planets seeded');

    // Seed SPECIES
    const species = await models.Species.bulkCreate([
      { name: 'Time Lord', home_planet_id: planets[0].planet_id, technology_level: 'Advanced' },
      { name: 'Human', home_planet_id: planets[1].planet_id, technology_level: 'Moderate' },
      { name: 'Dalek', home_planet_id: planets[2].planet_id, technology_level: 'Advanced' },
      { name: 'Cyberman', home_planet_id: planets[3].planet_id, technology_level: 'Advanced' },
      { name: 'Ood', home_planet_id: planets[4].planet_id, technology_level: 'Moderate' }
    ]);
    console.log('✓ Species seeded');

    // Seed SEASONS
    const seasons = await models.Season.bulkCreate([
      { series_number: 1, year: 2005, showrunner_id: writers[0].writer_id },
      { series_number: 2, year: 2006, showrunner_id: writers[0].writer_id },
      { series_number: 5, year: 2010, showrunner_id: writers[1].writer_id },
      { series_number: 11, year: 2018, showrunner_id: writers[4].writer_id },
      { series_number: 13, year: 2021, showrunner_id: writers[4].writer_id }
    ]);
    console.log('✓ Seasons seeded');

    // Seed EPISODES
    const episodes = await models.Episode.bulkCreate([
      { season_id: seasons[0].season_id, writer_id: writers[0].writer_id, director_id: directors[0].director_id, title: 'Rose', episode_number: 1, air_date: '2005-03-26', runtime_minutes: 45 },
      { season_id: seasons[0].season_id, writer_id: writers[0].writer_id, director_id: directors[1].director_id, title: 'The End of the World', episode_number: 2, air_date: '2005-04-02', runtime_minutes: 45 },
      { season_id: seasons[0].season_id, writer_id: writers[0].writer_id, director_id: directors[2].director_id, title: 'The Unquiet Dead', episode_number: 3, air_date: '2005-04-09', runtime_minutes: 45 },
      { season_id: seasons[1].season_id, writer_id: writers[0].writer_id, director_id: directors[1].director_id, title: 'New Earth', episode_number: 1, air_date: '2006-04-15', runtime_minutes: 45 },
      { season_id: seasons[1].season_id, writer_id: writers[0].writer_id, director_id: directors[2].director_id, title: 'Tooth and Claw', episode_number: 2, air_date: '2006-04-22', runtime_minutes: 45 },
      { season_id: seasons[2].season_id, writer_id: writers[1].writer_id, director_id: directors[3].director_id, title: 'The Eleventh Hour', episode_number: 1, air_date: '2010-04-03', runtime_minutes: 60 },
      { season_id: seasons[2].season_id, writer_id: writers[1].writer_id, director_id: directors[4].director_id, title: 'The Beast Below', episode_number: 2, air_date: '2010-04-10', runtime_minutes: 45 },
      { season_id: seasons[3].season_id, writer_id: writers[4].writer_id, director_id: directors[4].director_id, title: 'The Woman Who Fell to Earth', episode_number: 1, air_date: '2018-10-07', runtime_minutes: 50 },
      { season_id: seasons[4].season_id, writer_id: writers[4].writer_id, director_id: directors[3].director_id, title: 'The Halloween Apocalypse', episode_number: 1, air_date: '2021-10-31', runtime_minutes: 50 }
    ]);
    console.log('✓ Episodes seeded');

    // Seed DOCTOR
    const doctors = await models.Doctor.bulkCreate([
      { actor_id: actors[4].actor_id, first_episode_id: episodes[0].episode_id, last_episode_id: episodes[4].episode_id, incarnation_number: 10, catchphrase: 'Allons-y!' },
      { actor_id: actors[5].actor_id, first_episode_id: episodes[5].episode_id, last_episode_id: episodes[6].episode_id, incarnation_number: 11, catchphrase: 'Geronimo!' },
      { actor_id: actors[6].actor_id, first_episode_id: episodes[7].episode_id, last_episode_id: episodes[8].episode_id, incarnation_number: 13, catchphrase: 'Brilliant!' }
    ]);
    console.log('✓ Doctors seeded');

    // Seed COMPANIONS
    const companions = await models.Companion.bulkCreate([
      { actor_id: actors[7].actor_id, first_episode_id: episodes[0].episode_id, last_episode_id: episodes[3].episode_id, name: 'Rose Tyler', species_id: species[1].species_id, home_planet_id: planets[1].planet_id },
      { actor_id: actors[8].actor_id, first_episode_id: episodes[5].episode_id, last_episode_id: episodes[6].episode_id, name: 'Amy Pond', species_id: species[1].species_id, home_planet_id: planets[1].planet_id },
      { actor_id: actors[9].actor_id, first_episode_id: episodes[6].episode_id, name: 'Clara Oswald', species_id: species[1].species_id, home_planet_id: planets[1].planet_id }
    ]);
    console.log('✓ Companions seeded');

    // Seed ENEMIES
    const enemies = await models.Enemy.bulkCreate([
      { name: 'Dalek', home_planet_id: planets[2].planet_id, species_id: species[2].species_id, threat_level: 10 },
      { name: 'Cyberman', home_planet_id: planets[3].planet_id, species_id: species[3].species_id, threat_level: 9 },
      { name: 'The Master', home_planet_id: planets[0].planet_id, species_id: species[0].species_id, threat_level: 10 },
      { name: 'Weeping Angel', home_planet_id: null, species_id: null, threat_level: 8 },
      { name: 'Silence', home_planet_id: null, species_id: null, threat_level: 7 }
    ]);
    console.log('✓ Enemies seeded');

    // Seed CHARACTER
    const characters = await models.Character.bulkCreate([
      { name: 'Jackie Tyler', gender: 'Female', age: 45, biography: 'Rose Tyler\'s mother', species_id: species[1].species_id, doctor_id: null, enemy_id: null },
      { name: 'Mickey Smith', gender: 'Male', age: 25, biography: 'Rose Tyler\'s boyfriend', species_id: species[1].species_id, doctor_id: null, enemy_id: null },
      { name: 'Rory Williams', gender: 'Male', age: 28, biography: 'Amy Pond\'s husband', species_id: species[1].species_id, doctor_id: null, enemy_id: null },
      { name: 'River Song', gender: 'Female', age: 200, biography: 'Time Lord hybrid', species_id: species[0].species_id, doctor_id: doctors[1].doctor_id, enemy_id: null }
    ]);
    console.log('✓ Characters seeded');

    // Seed TARDIS
    await models.Tardis.bulkCreate([
      { owner_doctor_id: doctors[0].doctor_id, type: 'Type 40', chameleon_status: 'Broken (Police Box)' },
      { owner_doctor_id: doctors[1].doctor_id, type: 'Type 40', chameleon_status: 'Broken (Police Box)' },
      { owner_doctor_id: doctors[2].doctor_id, type: 'Type 40', chameleon_status: 'Broken (Police Box)' }
    ]);
    console.log('✓ TARDIS seeded');

    // Seed DOCTOR_COMPANIONS
    await models.DoctorCompanion.bulkCreate([
      { doctor_id: doctors[0].doctor_id, companion_id: companions[0].companion_id, start_episode_id: episodes[0].episode_id, end_episode_id: episodes[3].episode_id },
      { doctor_id: doctors[1].doctor_id, companion_id: companions[1].companion_id, start_episode_id: episodes[5].episode_id, end_episode_id: episodes[6].episode_id },
      { doctor_id: doctors[1].doctor_id, companion_id: companions[2].companion_id, start_episode_id: episodes[6].episode_id, end_episode_id: null }
    ]);
    console.log('✓ Doctor-Companions seeded');

    // Seed EPISODE_APPEARANCES
    // Note: character_id references the CHARACTER table, not companions
    await models.EpisodeAppearance.bulkCreate([
      { episode_id: episodes[0].episode_id, character_type: 'Supporting', character_id: characters[0].character_id, screen_time_min: 10 },
      { episode_id: episodes[0].episode_id, character_type: 'Supporting', character_id: characters[1].character_id, screen_time_min: 5 },
      { episode_id: episodes[5].episode_id, character_type: 'Supporting', character_id: characters[2].character_id, screen_time_min: 30 },
      { episode_id: episodes[6].episode_id, character_type: 'Supporting', character_id: characters[3].character_id, screen_time_min: 45 }
    ]);
    console.log('✓ Episode Appearances seeded');

    // Seed EPISODE_LOCATIONS
    await models.EpisodeLocation.bulkCreate([
      { episode_id: episodes[0].episode_id, planet_id: planets[1].planet_id, visit_order: 1 },
      { episode_id: episodes[1].episode_id, planet_id: planets[4].planet_id, visit_order: 1 },
      { episode_id: episodes[3].episode_id, planet_id: planets[4].planet_id, visit_order: 1 },
      { episode_id: episodes[5].episode_id, planet_id: planets[1].planet_id, visit_order: 1 }
    ]);
    console.log('✓ Episode Locations seeded');

    // Seed ENEMY_EPISODES
    await models.EnemyEpisode.bulkCreate([
      { enemy_id: enemies[0].enemy_id, episode_id: episodes[0].episode_id, role: 'Main Antagonist' },
      { enemy_id: enemies[1].enemy_id, episode_id: episodes[1].episode_id, role: 'Main Antagonist' },
      { enemy_id: enemies[2].enemy_id, episode_id: episodes[5].episode_id, role: 'Main Antagonist' },
      { enemy_id: enemies[3].enemy_id, episode_id: episodes[6].episode_id, role: 'Main Antagonist' }
    ]);
    console.log('✓ Enemy Episodes seeded');

    console.log('\n✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();


const models = require('../models');
const sequelize = require('../db/sequelize');

// Sample data for generating large dataset
const firstNames = ['John', 'Sarah', 'Rose', 'Amy', 'Clara', 'Donna', 'Martha', 'Bill', 'Yasmin', 'Graham', 'Ryan', 'Dan'];
const lastNames = ['Smith', 'Jones', 'Tyler', 'Pond', 'Oswald', 'Noble', 'Williams', 'Potts', 'Khan', 'O\'Brien', 'Sinclair', 'Lewis'];
const planetNames = ['Gallifrey', 'Earth', 'Skaro', 'Mondas', 'New Earth', 'Trenzalore', 'Karn', 'Messaline', 'Sanctuary Base', 'The Library'];
const enemyNames = ['Dalek', 'Cyberman', 'Weeping Angel', 'Silence', 'Sontaran', 'Zygon', 'Ice Warrior', 'Slitheen', 'Auton', 'Judoon'];
const catchphrases = ['Allons-y!', 'Geronimo!', 'Brilliant!', 'Fantastic!', 'What?!', 'Oh, brilliant!', 'Well...', 'Right then!'];

async function generateLargeDataset() {
  try {
    console.log('Starting large dataset import (2000+ rows)...');

    // Get existing data
    const existingActors = await models.Actor.findAll();
    const existingWriters = await models.Writer.findAll();
    const existingDirectors = await models.Director.findAll();
    const existingPlanets = await models.Planet.findAll();
    const existingSpecies = await models.Species.findAll();
    const existingSeasons = await models.Season.findAll();

    if (existingActors.length === 0 || existingWriters.length === 0) {
      console.log('Please run npm run db:seed first to create base data');
      process.exit(1);
    }

    let totalRows = 0;

    // Generate actors
    console.log('Generating actors...');
    const newActors = [];
    for (let i = 0; i < 500; i++) {
      newActors.push({
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        birth_date: new Date(1950 + Math.floor(Math.random() * 50), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        nationality: ['British', 'Scottish', 'Welsh', 'American', 'Australian'][Math.floor(Math.random() * 5)]
      });
    }
    const createdActors = await models.Actor.bulkCreate(newActors, { ignoreDuplicates: true });
    totalRows += createdActors.length;
    console.log(`[OK] Created ${createdActors.length} actors`);

    // Generate episodes
    console.log('Generating episodes...');
    const newEpisodes = [];
    for (let i = 0; i < 200; i++) {
      newEpisodes.push({
        season_id: existingSeasons[Math.floor(Math.random() * existingSeasons.length)].season_id,
        writer_id: existingWriters[Math.floor(Math.random() * existingWriters.length)].writer_id,
        director_id: existingDirectors[Math.floor(Math.random() * existingDirectors.length)].director_id,
        title: `Episode ${i + 1}: The ${['Mystery', 'Adventure', 'Journey', 'Quest', 'Discovery'][Math.floor(Math.random() * 5)]}`,
        episode_number: i + 1,
        air_date: new Date(2005 + Math.floor(Math.random() * 18), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        runtime_minutes: 45 + Math.floor(Math.random() * 15)
      });
    }
    const createdEpisodes = await models.Episode.bulkCreate(newEpisodes, { ignoreDuplicates: true });
    totalRows += createdEpisodes.length;
    console.log(`[OK] Created ${createdEpisodes.length} episodes`);

    // Generate companions
    console.log('Generating companions...');
    const newCompanions = [];
    const allActors = await models.Actor.findAll();
    for (let i = 0; i < 100; i++) {
      const actor = allActors[Math.floor(Math.random() * allActors.length)];
      const episode = createdEpisodes[Math.floor(Math.random() * createdEpisodes.length)];
      newCompanions.push({
        actor_id: actor.actor_id,
        first_episode_id: episode.episode_id,
        last_episode_id: Math.random() > 0.5 ? createdEpisodes[Math.floor(Math.random() * createdEpisodes.length)].episode_id : null,
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        species_id: existingSpecies[Math.floor(Math.random() * existingSpecies.length)].species_id,
        home_planet_id: existingPlanets[Math.floor(Math.random() * existingPlanets.length)].planet_id
      });
    }
    const createdCompanions = await models.Companion.bulkCreate(newCompanions, { ignoreDuplicates: true });
    totalRows += createdCompanions.length;
    console.log(`[OK] Created ${createdCompanions.length} companions`);

    // Generate characters
    console.log('Generating characters...');
    const newCharacters = [];
    for (let i = 0; i < 300; i++) {
      newCharacters.push({
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)],
        age: 20 + Math.floor(Math.random() * 60),
        biography: `Character ${i + 1} in the Doctor Who universe`,
        species_id: existingSpecies[Math.floor(Math.random() * existingSpecies.length)].species_id,
        doctor_id: null,
        enemy_id: null
      });
    }
    const createdCharacters = await models.Character.bulkCreate(newCharacters, { ignoreDuplicates: true });
    totalRows += createdCharacters.length;
    console.log(`[OK] Created ${createdCharacters.length} characters`);

    // Generate enemies
    console.log('Generating enemies...');
    const newEnemies = [];
    for (let i = 0; i < 200; i++) {
      newEnemies.push({
        name: `${enemyNames[Math.floor(Math.random() * enemyNames.length)]} ${i + 1}`,
        home_planet_id: existingPlanets[Math.floor(Math.random() * existingPlanets.length)].planet_id,
        species_id: existingSpecies[Math.floor(Math.random() * existingSpecies.length)].species_id,
        threat_level: 1 + Math.floor(Math.random() * 10)
      });
    }
    const createdEnemies = await models.Enemy.bulkCreate(newEnemies, { ignoreDuplicates: true });
    totalRows += createdEnemies.length;
    console.log(`[OK] Created ${createdEnemies.length} enemies`);

    // Generate episode appearances
    console.log('Generating episode appearances...');
    const newAppearances = [];
    for (let i = 0; i < 500; i++) {
      const episode = createdEpisodes[Math.floor(Math.random() * createdEpisodes.length)];
      const character = createdCharacters[Math.floor(Math.random() * createdCharacters.length)];
      newAppearances.push({
        episode_id: episode.episode_id,
        character_type: ['Main', 'Supporting', 'Guest', 'Cameo'][Math.floor(Math.random() * 4)],
        character_id: character.character_id,
        screen_time_min: 5 + Math.floor(Math.random() * 40)
      });
    }
    const createdAppearances = await models.EpisodeAppearance.bulkCreate(newAppearances, { ignoreDuplicates: true });
    totalRows += createdAppearances.length;
    console.log(`[OK] Created ${createdAppearances.length} episode appearances`);

    // Generate episode locations
    console.log('Generating episode locations...');
    const newLocations = [];
    for (let i = 0; i < 300; i++) {
      const episode = createdEpisodes[Math.floor(Math.random() * createdEpisodes.length)];
      const planet = existingPlanets[Math.floor(Math.random() * existingPlanets.length)];
      newLocations.push({
        episode_id: episode.episode_id,
        planet_id: planet.planet_id,
        visit_order: 1 + Math.floor(Math.random() * 3)
      });
    }
    const createdLocations = await models.EpisodeLocation.bulkCreate(newLocations, { ignoreDuplicates: true });
    totalRows += createdLocations.length;
    console.log(`[OK] Created ${createdLocations.length} episode locations`);

    // Generate enemy episodes
    console.log('Generating enemy episodes...');
    const newEnemyEpisodes = [];
    for (let i = 0; i < 400; i++) {
      const enemy = createdEnemies[Math.floor(Math.random() * createdEnemies.length)];
      const episode = createdEpisodes[Math.floor(Math.random() * createdEpisodes.length)];
      newEnemyEpisodes.push({
        enemy_id: enemy.enemy_id,
        episode_id: episode.episode_id,
        role: ['Main Antagonist', 'Secondary Antagonist', 'Cameo', 'Mentioned'][Math.floor(Math.random() * 4)]
      });
    }
    const createdEnemyEpisodes = await models.EnemyEpisode.bulkCreate(newEnemyEpisodes, { ignoreDuplicates: true });
    totalRows += createdEnemyEpisodes.length;
    console.log(`[OK] Created ${createdEnemyEpisodes.length} enemy episodes`);

    console.log(`\n[SUCCESS] Large dataset import completed!`);
    console.log(`[INFO] Total rows created: ${totalRows}`);
    console.log(`[INFO] This exceeds the 2000+ row requirement for extra credit 7d`);

    process.exit(0);
  } catch (error) {
    console.error('Error importing large dataset:', error);
    process.exit(1);
  }
}

generateLargeDataset();


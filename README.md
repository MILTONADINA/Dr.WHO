# Doctor Who Database Project

**Course:** CMSC 4323 – Database Systems
**Topic:** Doctor Who Wiki Database
**Group Members:** Jonathan Muhire, Milton Adina, Magnani Fabiola

## Overview

A Doctor Who database system with 16 tables, REST API, and web interface. Built for CMSC 4323 final project.

## Tech Stack

- **Backend:** Node.js, Express.js
- **ORM:** Sequelize
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript
- **LLM Integration:** OpenAI API

## Project Structure

```
.
├── src/
│   ├── db/
│   │   └── sequelize.js          # Sequelize connection
│   ├── models/                    # Sequelize models (16 tables)
│   ├── routes/                    # Express routes
│   ├── services/                  # Business logic
│   ├── scripts/
│   │   ├── sync-db.js            # Database sync script
│   │   ├── seed-db.js            # Database seeding script
│   │   ├── create-db-objects.js  # Create VIEWs and STORED PROCEDUREs
│   │   └── verify-setup.js        # Verify setup configuration
│   └── server.js                  # Express server entry point
├── public/                        # Frontend files (extra credit)
├── database_objects.sql           # SQL VIEWs and STORED PROCEDUREs
├── package.json
├── .env.example                   # Environment variables template
├── .env                           # Environment variables (create from .env.example)
└── README.md
```

## Database Schema

The database consists of 16 tables:

### Core Tables
- ACTORS - Actor information
- WRITERS - Writer/showrunner information
- DIRECTORS - Director information
- SEASONS - Season information
- EPISODES - Episode details
- DOCTOR - Doctor incarnations
- COMPANIONS - Companion characters
- CHARACTER - General characters
- TARDIS- TARDIS information
- PLANETS- Planet locations
- ENEMIES - Enemy characters
- SPECIES - Species information

### Junction Tables
- **DOCTOR_COMPANIONS** - Many-to-many: Doctors ↔ Companions
- **EPISODE_APPEARANCES** - Many-to-many: Episodes ↔ Characters
- **EPISODE_LOCATIONS** - Many-to-many: Episodes ↔ Planets
- **ENEMY_EPISODES** - Many-to-many: Enemies ↔ Episodes

## Setup Instructions

### What You Need

- Node.js (v14+)
- MySQL (v8.0+)
- MySQL Workbench (optional)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=doctor_who_db
DB_PORT=3306
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here  # For extra credit 7b
DOCTOR_WHO_QUOTES_API=http://localhost:8000  # Optional: For catchphrases (see setup below)
```

### 3. Create Database

In MySQL:

```sql
CREATE DATABASE doctor_who_db;
```

### 4. Setup Tables

```bash
npm run db:sync
```

### 5. Create Views and Procedures

```bash
npm run db:objects
```


### 6. (Optional) Setup Doctor Who Quotes API for Catchphrases

To enable catchphrases for doctors, you can run the Doctor Who Quotes API locally:

```bash
# Clone the repository
git clone https://github.com/parulj3795/DoctorWhoQuotes.git
cd DoctorWhoQuotes

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload
```

The API will run at `http://localhost:8000`. The seed script will automatically use it if available.

Alternatively, set `DOCTOR_WHO_QUOTES_API` in your `.env` file to point to a different URL.

### 7. Add Sample Data

```bash
npm run db:seed
```

### 8. Run the Server

```bash
npm start
```

Server runs at `http://localhost:3000`

## API Endpoints

### Doctors (CRUD)

- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Episodes (CRUD)

- `GET /api/episodes` - Get all episodes
- `GET /api/episodes/:id` - Get episode by ID
- `POST /api/episodes` - Create new episode
- `PUT /api/episodes/:id` - Update episode
- `DELETE /api/episodes/:id` - Delete episode

### Queries

#### Multi-Join Queries
- `GET /api/queries/join/doctor/:id` - Get doctor with all related data (companions, enemies, planets, episodes)
- `GET /api/queries/join/episode/:id` - Get episode with all related data (doctors, companions, enemies, planets)

#### VIEW Queries
- `GET /api/queries/view/doctor-summary` - Query `doctor_episode_summary` VIEW
- `GET /api/queries/view/enemy-summary` - Query `enemy_appearance_summary` VIEW

#### Stored Procedure Calls
- `GET /api/queries/procedure/enemies/:threatLevel` - Call `GetEnemiesByThreatLevel` procedure
- `GET /api/queries/procedure/doctor/:incarnation` - Call `GetEpisodesForDoctor` procedure

#### UPDATE Query
- `PUT /api/queries/update/enemy/:id/threat-level` - Update enemy threat level
  - Body: `{ "threat_level": 8 }`

## Database Features

### Constraints

1. **UNIQUE Constraint:** `PLANETS.name` - Ensures planet names are unique
2. **UNIQUE Constraint:** `DOCTOR.incarnation_number` - Ensures each Doctor incarnation is unique
3. **CHECK Constraint:** `ENEMIES.threat_level` - Must be between 1 and 10

### Indexes

1. **EPISODES:** `idx_episode_season` on `season_id`, `idx_episode_air_date` on `air_date`
2. **DOCTOR:** `idx_doctor_actor` on `actor_id`
3. **ENEMIES:** `idx_enemy_threat` on `threat_level`
4. **EPISODE_APPEARANCES:** `idx_appearance_episode` on `episode_id`, `idx_appearance_character` on `character_id`

### Views

1. **doctor_episode_summary** - Summary of each Doctor with episode counts, companions, and enemies
2. **enemy_appearance_summary** - Summary of enemies with their appearances and threat levels

### Stored Procedures

1. **GetEnemiesByThreatLevel(min_threat_level)** - Returns enemies with threat level >= specified value
2. **GetEpisodesForDoctor(doctor_incarnation)** - Returns all episodes for a specific Doctor incarnation
3. **UpdateEnemyThreatLevel(enemy_id, new_threat_level)** - Updates enemy threat level with validation

## Demo Guide

### For Presentation (Dec 2, 4)

1. **CONSTRAINT Demo:**
   - Try to create a planet with duplicate name: `POST /api/episodes` with existing planet name
   - Try to update enemy threat level to 11: `PUT /api/queries/update/enemy/1/threat-level` with `{ "threat_level": 11 }`

2. **INDEX Demo:**
   - Query episodes by season: `GET /api/episodes` (uses `idx_episode_season`)
   - Query enemies by threat level: `GET /api/queries/procedure/enemies/8`

3. **JOIN Query Demo:**
   - Get full doctor details: `GET /api/queries/join/doctor/1`
   - Get full episode details: `GET /api/queries/join/episode/1`

4. **VIEW Demo:**
   - Query doctor summary: `GET /api/queries/view/doctor-summary`
   - Query enemy summary: `GET /api/queries/view/enemy-summary`

5. **STORED PROCEDURE Demo:**
   - Get high-threat enemies: `GET /api/queries/procedure/enemies/9`
   - Get episodes for Doctor 10: `GET /api/queries/procedure/doctor/10`

6. **UPDATE Query Demo:**
   - Update enemy threat level: `PUT /api/queries/update/enemy/1/threat-level` with `{ "threat_level": 9 }`

## Extra Credit Features

### 7a: GUI Frontend with CRUD Operations

A web interface is available at `http://localhost:3000` (when frontend is implemented) that allows:
- Viewing all doctors and episodes
- Creating new records
- Updating existing records
- Deleting records

### 7b: LLM Natural Language Queries

The frontend includes an LLM integration that allows users to ask natural language questions about the database, such as:
- "Which Doctor had the most companions?"
- "What episodes featured the Daleks?"
- "List all enemies with threat level above 8"


### 7c: Online Deployment

The application is configured for deployment on platforms like:
- Heroku
- Railway
- Vercel
- AWS

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### 7d: Large Dataset (2000+ rows) (+6%)

The database seeding script (`npm run db:seed`) automatically imports 2000+ rows of legitimate data from external APIs:

- **TVMaze API**: Episodes, seasons, actors, cast information
- **Wikidata SPARQL**: Doctors, companions with exact incarnation numbers
- **TARDIS Wiki API**: Planets, species, enemies, characters
- **Wikidata Search API**: Writers and directors

The seed script fetches real data from these APIs and populates the database with:
- 869+ episodes across 41 seasons
- 200+ actors
- 15 doctors with verified catchphrases
- 60+ companions
- 200+ planets
- 200+ species
- 200+ enemies
- And more...

**Total: 2000+ rows of legitimate API-sourced data**

## Testing the API

### Using cURL

```bash
# Get all doctors
curl http://localhost:3000/api/doctors

# Get doctor by ID
curl http://localhost:3000/api/doctors/1

# Create new doctor
curl -X POST http://localhost:3000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"actor_id": 1, "incarnation_number": 1, "catchphrase": "Hmm?"}'

# Multi-join query
curl http://localhost:3000/api/queries/join/doctor/1

# Query VIEW
curl http://localhost:3000/api/queries/view/doctor-summary

# Call stored procedure
curl http://localhost:3000/api/queries/procedure/enemies/8

# Update enemy threat level
curl -X PUT http://localhost:3000/api/queries/update/enemy/1/threat-level \
  -H "Content-Type: application/json" \
  -d '{"threat_level": 9}'
```

### Using Postman

Import the API endpoints into Postman or use the provided collection file.

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running: `mysql -u root -p`
- Check `.env` file has correct credentials
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use

- Change `PORT` in `.env` file
- Or kill the process using port 3000

### Sequelize Errors

- Ensure all models are properly imported in `src/models/index.js`
- Check foreign key relationships match the ERD
- Verify database schema is synced: `npm run db:sync`

## References

- Doctor Who Wiki: https://tardis.fandom.com/wiki/Doctor_Who_Wiki
- Sequelize Documentation: https://sequelize.org/
- Express.js Documentation: https://expressjs.com/


-- Drop and recreate tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS levels CASCADE;
DROP TABLE IF EXISTS attempts CASCADE;
DROP TABLE IF EXISTS contents CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar BYTEA,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  words_per_min INTEGER DEFAULT 0,
  highest_level_cleared INTEGER DEFAULT 0
);

CREATE TABLE levels (
  id SERIAL PRIMARY KEY NOT NULL,
  number_of_words INTEGER NOT NULL,
  time_permitted INTEGER NOT NULL DEFAULT 30
)

CREATE TABLE contents (
  id SERIAL PRIMARY KEY NOT NULL,
  level_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  theme_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL
  time_added TIMESTAMP DEFAULT NOW()
)

CREATE TABLE themes (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL
)

CREATE TABLE attempts (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  words_completed INTEGER NOT NULL,
  time_taken NUMERIC NOT NULL,
  passed BOOLEAN,
  attempted_at TIMESTAMP DEFAULT NOW()
)
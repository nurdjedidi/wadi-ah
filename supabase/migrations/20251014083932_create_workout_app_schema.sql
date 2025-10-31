/*
  # Workout App Database Schema

  ## Overview
  This migration creates the complete database schema for a workout mobile application with user authentication, nutrition tracking, and workout management.

  ## New Tables Created

  ### 1. `user_profiles`
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's full name
  - `onboarding_completed` (boolean) - Whether user completed onboarding
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `nutrition_profiles`
  - `id` (uuid, primary key) - Auto-generated ID
  - `user_id` (uuid, foreign key) - References user_profiles
  - `age` (integer) - User's age
  - `weight` (decimal) - Current weight in kg
  - `height` (decimal) - Height in cm
  - `activity_level` (text) - Activity level (sedentary, light, moderate, active, very_active)
  - `goal` (text) - Fitness goal (lose_weight, maintain, gain_muscle, gain_weight)
  - `daily_calories` (integer) - Calculated daily calorie target
  - `daily_protein` (integer) - Daily protein target in grams
  - `daily_carbs` (integer) - Daily carbs target in grams
  - `daily_fats` (integer) - Daily fats target in grams
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `workouts`
  - `id` (uuid, primary key) - Auto-generated ID
  - `user_id` (uuid, foreign key) - References user_profiles
  - `name` (text) - Workout name
  - `type` (text) - Workout type (strength, cardio, flexibility, sports)
  - `duration_minutes` (integer) - Duration in minutes
  - `calories_burned` (integer) - Estimated calories burned
  - `notes` (text) - Optional notes
  - `completed_at` (timestamptz) - When workout was completed
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `workout_exercises`
  - `id` (uuid, primary key) - Auto-generated ID
  - `workout_id` (uuid, foreign key) - References workouts
  - `exercise_name` (text) - Name of the exercise
  - `sets` (integer) - Number of sets
  - `reps` (integer) - Number of repetitions
  - `weight` (decimal) - Weight used in kg
  - `order_index` (integer) - Order of exercise in workout
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Policies enforce user_id matching auth.uid()
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create nutrition_profiles table
CREATE TABLE IF NOT EXISTS nutrition_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  age integer NOT NULL,
  weight decimal(5,2) NOT NULL,
  height decimal(5,2) NOT NULL,
  activity_level text NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text NOT NULL CHECK (goal IN ('lose_weight', 'maintain', 'gain_muscle', 'gain_weight')),
  daily_calories integer NOT NULL,
  daily_protein integer NOT NULL,
  daily_carbs integer NOT NULL,
  daily_fats integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('strength', 'cardio', 'flexibility', 'sports')),
  duration_minutes integer NOT NULL DEFAULT 0,
  calories_burned integer DEFAULT 0,
  notes text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name text NOT NULL,
  sets integer DEFAULT 0,
  reps integer DEFAULT 0,
  weight decimal(5,2) DEFAULT 0,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for nutrition_profiles
CREATE POLICY "Users can view own nutrition profile"
  ON nutrition_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own nutrition profile"
  ON nutrition_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own nutrition profile"
  ON nutrition_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own nutrition profile"
  ON nutrition_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for workouts
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for workout_exercises
CREATE POLICY "Users can view own workout exercises"
  ON workout_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workout exercises"
  ON workout_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout exercises"
  ON workout_exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout exercises"
  ON workout_exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_user_id ON nutrition_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_completed_at ON workouts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_order ON workout_exercises(workout_id, order_index);
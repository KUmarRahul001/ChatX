# BharatFlow (Instagram Clone Web App)

BharatFlow is a feature-rich, Indian-first social media web application inspired by Instagram, built with a modern web stack.

## Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS, React Router, Lucide React
- **Backend/BaaS:** Supabase (PostgreSQL, Auth, Storage, Realtime)

## Project Structure

- `/web`: The React frontend application.
- `/supabase`: Contains the SQL schema and migrations for the Supabase database.

## Prerequisites

- Node.js (v18+)
- A [Supabase](https://supabase.com) project

## Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new project in your Supabase dashboard.
2. Navigate to the **SQL Editor** in your Supabase project.
3. Copy the contents of `supabase/schema.sql` from this repository.
4. Paste the SQL into the editor and click **Run**. This will create all necessary tables, Row Level Security (RLS) policies, and storage buckets.

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and replace the placeholder values with your actual Supabase project credentials (found under Project Settings > API):
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Key Features Implemented

- **Authentication:** Signup and Login flows using Supabase Auth.
- **Database Schema:** Robust PostgreSQL schema with RLS policies for `profiles`, `posts`, `comments`, `likes`, `follows`, `conversations`, `messages`, and `notifications`.
- **Feed (Home):** Chronological display of posts.
- **Profile:** User profile viewing and editing capabilities.
- **Create Post:** UI for uploading images to Supabase Storage and creating post records.

## Note for Developers

The application is built assuming that valid Supabase credentials will be provided at runtime via the `.env` file. Without these credentials, authentication and database interactions will fail.

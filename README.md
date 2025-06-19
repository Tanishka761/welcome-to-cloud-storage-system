# CloudStore - Secure Cloud Storage System

A modern, full-featured cloud storage system built with Next.js and Supabase.

## Features

- 🔐 **Secure Authentication** - Email/password with verification
- ☁️ **Real Cloud Storage** - Files stored on AWS S3 via Supabase
- 📁 **File Management** - Upload, download, delete, and organize files
- 🎯 **File Type Filtering** - Support for images, documents, videos, audio, and more
- 📊 **Storage Analytics** - Track usage, file types, and recent activity
- 🔍 **Search & Filter** - Find files quickly with search and type filters
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚀 **Real-time Updates** - Instant sync across devices

## Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (usually 1-2 minutes)

### 2. Get Your Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy your **Project URL** and **anon/public key**

### 3. Set Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values with your actual Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. Set Up Storage Policies

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the SQL script from `scripts/setup-cloud-storage.sql`

### 5. Start the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` and you should see the application running!

## File Storage Limits

- **Free Tier**: 500MB storage, 50MB max file size
- **Pro Tier**: 8GB storage, 5GB max file size
- **Team Tier**: 100GB storage, 5GB max file size

## Security Features

- Row Level Security (RLS) ensures users can only access their own files
- Files are stored securely on AWS S3 with encryption
- Authentication tokens expire automatically
- All API requests are authenticated and authorized

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Cloud Storage**: AWS S3 (via Supabase)
- **Deployment**: Vercel (recommended)

## Support

If you encounter any issues:

1. Check that your environment variables are correctly set
2. Verify your Supabase project is active
3. Ensure the storage policies are properly configured
4. Check the browser console for any error messages

For additional help, refer to the [Supabase documentation](https://supabase.com/docs).

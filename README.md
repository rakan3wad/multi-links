# Multi-Links: Personal Link Aggregation Platform

## Project Overview
Multi-Links is a web application that allows users to create and manage a personalized collection of links, similar to Linktree.

## Features
- User Authentication with Supabase
- Profile Creation
- Link Management
- Responsive Design

## Technologies
- Next.js
- TypeScript
- Supabase
- Tailwind CSS

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase Account

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create `.env.local` file
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_SITE_URL=http://localhost:3000
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment
- Vercel recommended for Next.js deployments
- Configure Supabase environment variables in deployment settings

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
MIT License

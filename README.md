# OpsForge Command Center

Your everything hub for collision shop operations - from lead intake to quote delivery.

## Features

- **Inbox**: Lead management with status tracking and quick actions
- **Conversations**: SMS/WhatsApp messaging via Twilio Conversations
- **Quote Engine**: Photo-to-quote with AI damage analysis and deterministic pricing
- **SEO Console**: Landing page generator (stub)
- **CCC Importer**: Batch import from CCC (stub)  
- **Mission Pulse**: KPI dashboard with conversion tracking
- **Settings**: System configuration and health checks

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js API routes
- **Database**: Supabase (PostgreSQL)
- **Messaging**: Twilio Conversations
- **AI**: OpenAI GPT-4o-mini for damage analysis
- **Deploy**: Vercel-ready

## Setup

### 1. Supabase Setup

1. Create a new Supabase project
2. Run the SQL from `/supabase/schema.sql` in the SQL editor
3. Create a storage bucket named `leads` with public access
4. Copy your project URL and keys

### 2. Twilio Setup

1. Create a Twilio account and get your Account SID and Auth Token
2. Create a Conversations Service and copy the SID
3. Set up a phone number for SMS
4. Configure webhook URL (see Settings page after deployment)

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_CONVERSATIONS_SID=your_conversations_service_sid
TWILIO_FROM=+12672121034
SHOP_NAME="Your Shop Name"
SHOP_CITY="Your City"
SHOP_PHONE=your_shop_phone
APPROVAL_MODE=draft
PUBLIC_BUCKET=leads
```

### 4. Local Development

```bash
npm install
npm run dev
```

### 5. Deploy to Vercel

1. Connect your GitHub repo to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy
4. Copy the webhook URL from Settings and add to Twilio

## Usage Flow

1. **Create Quote**: Go to Quote page, enter phone/vehicle, upload photos, generate quote
2. **Review & Send**: Quote appears in Inbox, click to review and send via SMS
3. **Track Conversations**: View message thread in Conversations page
4. **Monitor Performance**: Check KPIs in Mission Pulse

## Key Features

### Deterministic Pricing
- No AI in pricing calculations - all math in `lib/estimate.ts`
- Rules-based system with transparent rationale
- Single-stage vs basecoat/clearcoat options

### Event Logging
- All actions logged to events table via `lib/events.ts`
- Audit trail for quotes, messages, imports
- Powers KPI calculations and activity tracking

### Draft-First Mode
- Quotes require manual approval by default
- Toggle to auto-send in Settings
- Prevents accidental quote delivery

### Modular Architecture
- Clean separation of concerns
- Swappable LLM adapter in `lib/llm.ts`
- Reusable components and utilities

## API Endpoints

- `POST /api/leads` - Create/update leads
- `POST /api/photos` - Upload damage photos  
- `POST /api/quotes.draft` - Generate quote with AI analysis
- `POST /api/messages.send` - Send SMS via Twilio
- `POST /api/messages.inbound` - Twilio webhook for incoming messages
- `GET /api/conversations/:lead_id` - Get message history
- `POST /api/ccc.import` - Batch import (stub)
- `POST /api/seo.generate` - Generate landing page (stub)
- `GET /api/events` - Event history

## Database Schema

- **leads**: Customer contact info and status
- **photos**: Damage photos with AI analysis
- **quotes**: Price estimates with rationale
- **messages**: SMS/WhatsApp history
- **events**: System activity log

All tables have RLS enabled with service role access for API routes.

## Contributing

1. Keep pricing logic in `lib/estimate.ts` - no AI math
2. Log all actions via `lib/events.ts`
3. Use TypeScript for new files
4. Follow existing patterns for API routes
5. Test the full flow: quote → draft → send → conversation

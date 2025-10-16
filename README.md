# 🪳 AI Pest Assessment Tool

An interactive **AI-powered pest assessment and lead generation web app** designed for pest control businesses. The chatbot helps homeowners **identify pests**, **estimate infestation severity**, and **schedule professional consultations** — turning conversations into qualified leads.

---

## 🌟 Features

- 🧠 **AI Pest Detection** – Users can describe or upload photos of pests for AI-powered identification using Google Gemini's vision capabilities
- 💬 **Natural Conversational Assessment** – Friendly AI chatbot asks targeted questions to understand the pest problem
- 📊 **Severity Analysis** – AI evaluates infestation severity and urgency based on pest type, location, frequency, and signs
- 📞 **Automated Lead Capture** – Seamlessly collects contact information and saves leads to Google Sheets
- 🖼️ **Image Upload & Analysis** – Users can upload pest photos for instant AI identification
- 🎨 **Modern UI** – Built with Next.js 15, React 19, and Tailwind CSS v4

---

## ⚙️ Tech Stack

| Layer          | Technology                   |
| -------------- | ---------------------------- |
| **Framework**  | Next.js 15 (App Router)      |
| **Frontend**   | React 19, TypeScript         |
| **Styling**    | Tailwind CSS v4, shadcn/ui   |
| **AI Model**   | Google Gemini 2.5 Flash      |
| **AI SDK**     | Vercel AI SDK v5             |
| **Database**   | Google Sheets (lead storage) |
| **Deployment** | Vercel                       |

---

## 💡 How It Works

1. **Lead Capture** – User enters name and email on homepage
2. **AI Assessment** – Chatbot asks about pest type (with optional image upload for identification)
3. **Information Gathering** – AI collects location, frequency, duration, signs, and previous attempts
4. **Contact Collection** – AI gathers phone, email, city, and preferred contact time
5. **Severity Analysis** – AI provides severity assessment and urges professional consultation
6. **Auto-Save** – All data automatically saved to Google Sheets for follow-up
7. **Confirmation** – User receives confirmation that consultation has been scheduled

---

## 🧩 Example Conversation

> **Bot:** "Hi! I'm here to help with your pest problem. What type of pest are you dealing with? Feel free to describe it or upload a photo for identification."
>
> **User:** _uploads image of cockroach_
>
> **Bot:** "Thanks for the image! That appears to be a German cockroach. Where in your home are you seeing them?"
>
> **User:** "Mostly in the kitchen, near the sink."
>
> **Bot:** "I see. How often are you noticing them?"
>
> **User:** "Every day, especially at night."
>
> _(After collecting all information)_
>
> **Bot:** "Based on what you've shared, this appears to be a **High severity** infestation. German cockroaches multiply quickly and require immediate professional treatment. I strongly recommend scheduling a consultation with a pest control specialist. May I have your contact information to connect you with an expert?"
>
> _(After contact info provided)_
>
> **Bot:** "Perfect! Your consultation has been successfully scheduled. A pest control specialist will reach out to you soon at your preferred time."

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Cloud account (for Gemini AI and Sheets API)

### Installation

```bash

# Clone the repository

git clone https://github.com/yourusername/pest-assessment-tool.git
cd pest-assessment-tool

# Install dependencies

npm install

# or

pnpm install

# or

yarn install

# Copy environment variables

cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env

# Google Gemini AI API Key

# Get your API key from https://aistudio.google.com/app/apikey

GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key_here

# Google Sheets Integration

# Create a service account in Google Cloud Console and enable Sheets API

GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your_google_sheet_id_here

# Vercel Blob Storage (automatically provided by Vercel)

BLOB_READ_WRITE_TOKEN=vercel_blob_token_here

# Resend Email Service (optional)

RESEND_API_KEY=re_your_resend_api_key_here

# App URL (for production)

NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
```

### Google Sheets Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**
4. Create a **Service Account** and download the JSON key
5. Extract `client_email` and `private_key` from the JSON
6. Create a new Google Sheet and share it with the service account email
7. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)

### Google Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env.local` file

### Run Development Server

```bash
npm run dev

# or

pnpm dev

# or

yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```

pest-assessment-tool/
├── app/
│   ├── api/
│   │   ├── chat/route.ts            # AI chatbot endpoint with Gemini
│   │   ├── upload/route.ts          # Image upload to Vercel Blob
│   │   ├── save-to-sheets/route.ts  # Google Sheets integration
│   │   └── ...
│   ├── assessment/page.tsx          # Main assessment page with chatbot
│   ├── page.tsx                     # Homepage with lead capture
│   └── layout.tsx                   # Root layout
├── components/
│   ├── ai-chatbot.tsx               # Main chatbot component
│   └── ui/                          # shadcn/ui components
├── lib/
│   └── utils.ts                     # Utility functions
└── public/                          # Static assets

```

---

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/pest-assessment-tool)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Required Vercel Integrations

- **Vercel Blob** – For image storage (add from Vercel dashboard)

---

## 🔧 Configuration

### Customizing the AI Behavior

Edit the system prompt in `app/api/chat/route.ts`:

```typescript
const systemPrompt = `You are a friendly and professional pest control assessment assistant...`
```

### Customizing Google Sheets Columns

Modify the columns in `app/api/save-to-sheets/route.ts`:

```typescript
const row = [
new Date().toISOString(),
data.name,
data.email,
// Add or remove columns as needed
]
```

---

## 📊 Google Sheets Data Structure

The app saves the following data to Google Sheets:

| Column                 | Description                       |
| ---------------------- | --------------------------------- |
| Timestamp              | When the assessment was completed |
| Name                   | User's full name                  |
| Email                  | User's email address              |
| Phone                  | User's phone number               |
| City                   | User's city/location              |
| Preferred Contact Time | When to contact the user          |
| Pest Type              | Type of pest identified           |
| Location               | Where pests are seen              |
| Frequency              | How often pests appear            |
| Duration               | How long the problem exists       |
| Signs                  | Evidence of infestation           |
| Severity               | AI-assessed severity level        |
| Previous Attempts      | What user has tried               |

---

## 🐛 Troubleshooting

### Image Upload Not Working

- Ensure `BLOB_READ_WRITE_TOKEN` is set correctly
- Check that Vercel Blob integration is enabled

### Google Sheets Not Saving

- Verify service account email has edit access to the sheet
- Check that `GOOGLE_PRIVATE_KEY` includes `\n` for line breaks
- Ensure Google Sheets API is enabled in Google Cloud Console

### AI Not Responding

- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is valid
- Check API quota limits in Google AI Studio
- Review console logs for error messages

---

## 📧 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

Built with using Next.js, Vercel AI SDK, and Google Gemini

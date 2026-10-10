# API Setup

## npm packages to install
`ash
npm install @neondatabase/serverless @vercel/blob
`

Or with pnpm:
`ash
pnpm add @neondatabase/serverless @vercel/blob
`

## Environment Variables (Vercel)
- DATABASE_URL: Neon Postgres connection string
- BLOB_READ_WRITE_TOKEN: Vercel Blob token (for /api/upload)

## API Endpoints
1. GET /api/exams - List all exams (id, title)
2. POST /api/exams - Create exam { title }
3. GET /api/exams/[id]/questions - Get questions without correct_answer
4. POST /api/exams/[id]/questions - Add question { question_text, options, correct_answer }
5. POST /api/exams/[id]/submit - Submit answers { student_name, answers: [{question_id, answer}] }, returns calculated score
6. GET /api/exams/[id]/results - Get all results for exam
7. POST /api/upload - Upload PDF to Vercel Blob (multipart/form-data, field 'file')

// POST /api/exams/[id]/questions - teacher adds questions with options and correct answer
// GET /api/exams/[id]/questions - returns questions WITHOUT correct_answer (for students)

import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async function handler(req, { params }) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const examId = params?.id;
    
    if (!examId) {
      return new Response(JSON.stringify({ error: 'Exam ID is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    // GET: returns questions WITHOUT correct_answer (for students)
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, exam_id, question_text, options
        FROM questions
        WHERE exam_id = ${examId}
        ORDER BY id ASC
      `;
      return new Response(JSON.stringify({ questions: rows }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    // POST: teacher adds questions with options and correct answer
    if (req.method === 'POST') {
      const body = await req.json();
      const { question_text, options, correct_answer } = body || {};
      
      if (!question_text || !Array.isArray(options) || correct_answer === undefined || correct_answer === null) {
        return new Response(
          JSON.stringify({ error: 'question_text, options (array), and correct_answer are required' }),
          {
            status: 400,
            headers: { 'content-type': 'application/json' },
          }
        );
      }
      
      // Ensure options is properly serialized as JSONB
      const rows = await sql`
        INSERT INTO questions (exam_id, question_text, options, correct_answer)
        VALUES (${examId}, ${question_text}, ${JSON.stringify(options)}, ${correct_answer})
        RETURNING id, exam_id, question_text, options, correct_answer
      `;
      
      return new Response(JSON.stringify({ question: rows[0] }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error', detail: String(error?.message || error) }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}
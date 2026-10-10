// GET /api/exams/[id]/results - teacher sees all students' results

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
    
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    const rows = await sql`
      SELECT id, exam_id, student_name, score, total, created_at
      FROM results
      WHERE exam_id = ${examId}
      ORDER BY created_at DESC, id ASC
    `;
    
    return new Response(JSON.stringify({ results: rows }), {
      status: 200,
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
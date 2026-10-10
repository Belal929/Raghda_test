// GET /api/exams - returns list of exams (id, title)
// POST /api/exams - teacher creates an exam with a title

import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // GET: returns list of exams (id, title) for students
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, title
        FROM exams
        ORDER BY created_at DESC, id ASC
      `;
      return new Response(JSON.stringify({ exams: rows }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    // POST: teacher creates an exam with a title
    if (req.method === 'POST') {
      const body = await req.json();
      const title = (body?.title || '').trim();
      
      if (!title) {
        return new Response(JSON.stringify({ error: 'Title is required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });
      }
      
      const rows = await sql`
        INSERT INTO exams (title)
        VALUES (${title})
        RETURNING id, title, pdf_url, created_at
      `;
      
      return new Response(JSON.stringify({ exam: rows[0] }), {
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
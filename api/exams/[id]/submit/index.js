// POST /api/exams/[id]/submit - student sends answers; server calculates score and saves to results
// Never trust the score from the browser

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
    
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    const body = await req.json();
    const { student_name, answers } = body || {};
    
    if (!student_name || !Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: 'student_name and answers (array) are required' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      );
    }
    
    // Fetch all questions for this exam
    const questions = await sql`
      SELECT id, correct_answer
      FROM questions
      WHERE exam_id = ${examId}
      ORDER BY id ASC
    `;
    
    const total = questions.length;
    let score = 0;
    
    // Calculate score by comparing submitted answers with correct answers
    const answerMap = new Map(questions.map(q => [String(q.id), q.correct_answer]));
    for (let i = 0; i < answers.length; i++) {
      const ans = answers[i] || {};
      const qid = String(ans.question_id);
      const submitted = ans.answer;
      const correct = answerMap.get(qid);
      // Compare - be flexible with types
      if (correct !== undefined && submitted !== undefined && submitted !== null) {
        if (String(submitted) === String(correct)) {
          score++;
        }
      }
    }
    
    // Save result to database
    const resultRows = await sql`
      INSERT INTO results (exam_id, student_name, score, total)
      VALUES (${examId}, ${student_name}, ${score}, ${total})
      RETURNING id, exam_id, student_name, score, total, created_at
    `;
    
    return new Response(
      JSON.stringify({
        result: resultRows[0],
        calculated: { score, total },
      }),
      {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }
    );
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
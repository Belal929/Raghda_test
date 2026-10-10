// POST /api/upload - teacher uploads a PDF to Vercel Blob

import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'File is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    // Ensure it's a PDF
    const filename = file.name || 'document.pdf';
    const isPdf = filename.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    
    if (!isPdf) {
      return new Response(JSON.stringify({ error: 'Only PDF files are allowed' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    
    return new Response(JSON.stringify({ url: blob.url, pathname: blob.pathname }), {
      status: 201,
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
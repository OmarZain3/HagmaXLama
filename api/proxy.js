export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Google Apps Script endpoint (URL is public in frontend code)
    const gasUrl = 'https://script.google.com/macros/s/AKfycbwOlyq93KtHld_-weOshSue4D6_yPp5u7jzKSrjoiMqgEc2h6Oom0uVB1PwBKC37s0qXQ/exec';
    
    if (!gasUrl) {
      return res.status(500).json({ error: 'API URL not configured' });
    }

    // Forward the request to Google Apps Script
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
      redirect: 'follow', // Follow redirects automatically
    });

    // Get the response body
    const data = await response.json();

    // Return the response with appropriate status
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to connect to server',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

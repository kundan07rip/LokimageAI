const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable All CORS Requests
app.use(cors());

// The Pollinations API Key from the user
const API_KEY = "sk_jl04H4scTH2NwNSdqUjglgxmRfz7Zs3v";

app.get('/api/generate', async (req, res) => {
    try {
        const urlParams = new URLSearchParams(req.query).toString();
        const targetUrl = `https://image.pollinations.ai/prompt/${req.query.prompt}?${urlParams}`;

        console.log(`[Proxy] Fetching image: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Pollinations API responded with ${response.status}`);
        }

        // Pass headers from Pollinations to the client
        res.set('Content-Type', response.headers.get('content-type'));

        // Stream the image buffer back to the client
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error('[Proxy Error]', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 LokimageAI Proxy Server is running on http://localhost:${PORT}`);
    console.log(`Ready to bypass CORS and authenticate with API Key ending in '3v'`);
});

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt, width, height, seed } = req.query;

    // Vercel securely injects this from the Project Settings > Environment Variables
    const API_KEY = process.env.POLLINATIONS_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "Server Configuration Error: Missing POLLINATIONS_API_KEY in Vercel" });
    }

    const encodedPrompt = encodeURIComponent(prompt || "abstract art");
    const externalApiUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`;

    try {
        const fetchResponse = await fetch(externalApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!fetchResponse.ok) {
            return res.status(fetchResponse.status).json({ error: "Failed to generate image from external API" });
        }

        // Forward the image buffer directly to the client
        const arrayBuffer = await fetchResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'image/jpeg');
        // Tell Vercel Edge Network to heavily cache the result for this exact prompt and seed combo
        res.setHeader('Cache-Control', 'public, s-maxage=86400');
        res.status(200).send(buffer);

    } catch (error) {
        console.error("Vercel Serverless Function Error:", error);
        res.status(500).json({ error: "Internal Server Proxy Error" });
    }
}

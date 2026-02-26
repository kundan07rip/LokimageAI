document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const aspectRatioSelect = document.getElementById('aspectRatio');
    const generateBtn = document.getElementById('generateBtn');
    const galleryGrid = document.getElementById('galleryGrid');

    // Pro-Tip enhancement from user
    const PROMPT_ENHANCEMENT = "ultra-realistic, 8k, masterpiece, cinematic, high-detail, professional lighting";

    const generateImage = () => {
        let userPrompt = promptInput.value.trim();

        if (!userPrompt) {
            alert("Please enter a prompt to generate an image.");
            return;
        }

        // Advanced Logic: Enhance short prompts 
        // If it's a short prompt (e.g. "a cat") and doesn't explicitly mention 8k or realistic
        let finalPrompt = userPrompt;
        const promptLength = userPrompt.split(" ").length;
        const isShortOrBasic = promptLength < 8 && !userPrompt.toLowerCase().includes("8k");

        if (isShortOrBasic) {
            finalPrompt = `${userPrompt}, ${PROMPT_ENHANCEMENT}`;
            console.log("LokimageAI Engine Enhanced Prompt:", finalPrompt);
        }

        // Format for URL (replace spaces with %20 or +)
        const encodedPrompt = encodeURIComponent(finalPrompt);

        // Handle Aspect Ratios
        const dims = aspectRatioSelect.value.split('x');
        const width = dims[0];
        const height = dims[1];

        // Seed Consistency
        // We generate a unique seed per session submission so that exact text doesn't always yield the 
        // exact same cached image.
        const seed = Math.floor(Math.random() * 100000);

        // Use the official URL schema provided by the user and documented at pollinations-ai.com/api
        const API_KEY = "sk_jl04H4scTH2NwNSdqUjglgxmRfz7Zs3v";
        const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`;

        // Create UI Card for the Gallery
        const cardId = 'card-' + Date.now();
        const cardHtml = `
            <div class="gallery-card" id="${cardId}">
                <div class="loading-placeholder" id="placeholder-${cardId}" style="aspect-ratio: ${width}/${height};">
                    <div class="spinner"></div>
                    <div class="loading-text">GENERATING...</div>
                </div>
                <p><strong>Prompt:</strong> ${userPrompt}</p>
                <div class="engine-badge">Enhanced by LokimageAI</div>
            </div>
        `;

        // Insert at the beginning of the gallery
        galleryGrid.insertAdjacentHTML('afterbegin', cardHtml);

        // Fetch the image using the provided API Key via Bearer Authorization
        fetch(imageUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('API Error: ' + response.status);
                }
                return response.blob();
            })
            .then(blob => {
                const objectUrl = URL.createObjectURL(blob);
                const card = document.getElementById(cardId);
                if (card) {
                    card.innerHTML = `
                    <img src="${objectUrl}" alt="${userPrompt}" style="aspect-ratio: ${width}/${height};">
                    <p><strong>Prompt:</strong> ${userPrompt}</p>
                    <div class="engine-badge">Engine: Pollinations API (Flux)</div>
                `;
                }
            })
            .catch(error => {
                console.error("Image generation failed:", error);
                const card = document.getElementById(cardId);
                if (card) {
                    card.innerHTML = `
                    <div class="loading-placeholder" style="border-color: red; aspect-ratio: ${width}/${height};">
                        <div class="loading-text" style="color: red; animation: none;">API FAILED</div>
                    </div>
                    <p><strong>Prompt:</strong> ${userPrompt}</p>
                `;
                }
            });
    };

    // Lightbox & Download Elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightboxBtn = document.getElementById('closeLightbox');
    const downloadBtn = document.getElementById('downloadBtn');

    // Event Delegation: Listen for clicks on images within the gallery
    galleryGrid.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            const imgSrc = e.target.src;
            lightboxImg.src = imgSrc;
            lightbox.classList.remove('hidden');
        }
    });

    // Close Lightbox
    const closeLightbox = () => {
        lightbox.classList.add('hidden');
        // Clear src after a short delay so the fadeout animation finishes cleanly
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    };

    closeLightboxBtn.addEventListener('click', closeLightbox);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });

    // Download Functionality
    downloadBtn.addEventListener('click', async () => {
        const imageUrl = lightboxImg.src;
        if (!imageUrl) return;

        downloadBtn.textContent = "DOWNLOADING...";
        downloadBtn.style.opacity = "0.7";
        downloadBtn.disabled = true;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // Generate a filename based on timestamp
            const filename = `lokimageai-${Date.now()}.png`;

            // Create temporary download link
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);

            downloadBtn.textContent = "DOWNLOADED!";
            setTimeout(() => {
                downloadBtn.textContent = "DOWNLOAD ↓";
                downloadBtn.style.opacity = "1";
                downloadBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error("Download failed:", error);
            downloadBtn.textContent = "FAILED";
            setTimeout(() => {
                downloadBtn.textContent = "DOWNLOAD ↓";
                downloadBtn.style.opacity = "1";
                downloadBtn.disabled = false;
            }, 2000);
        }
    });

    // Event Listeners for Generator
    generateBtn.addEventListener('click', generateImage);

    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateImage();
        }
    });
});

const cheerio = require("cheerio");

// Initialize Gemini AI
async function getGeminiAPI() {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-pro" });
  } catch (error) {
    console.error("Gemini initialization error:", error);
    return null;
  }
}

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'URL is required' }),
      };
    }

    // Extract website data
    const websiteData = await extractWebsiteData(url);
    
    const result = {
      id: Date.now(),
      url,
      status: "completed",
      website_data: websiteData,
      linkedin_data: null,
      created_at: new Date().toISOString(),
      error_message: null
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error("Analysis error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: error.message || "Analysis failed" 
      }),
    };
  }
};

async function extractWebsiteData(baseUrl) {
  const websiteData = {};

  try {
    // Use global fetch (available in Node.js 18+)
    const response = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('title').text().trim() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1Elements = [];
    const h2Elements = [];
    
    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1Elements.push(text);
    });
    
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h2Elements.push(text);
    });
    
    const heroText = $('.hero, .banner, .jumbotron, [class*="hero"], [class*="banner"]').first().text().trim().slice(0, 500) || '';
    const homeContent = $('body').text().slice(0, 2000);
    
    websiteData.home = {
      page_title: title,
      meta_description: metaDesc,
      main_headings: [...h1Elements, ...h2Elements].slice(0, 10),
      hero_text: heroText,
      summary: await generateAISummary(homeContent, "homepage", title),
      keywords: extractKeywords(homeContent)
    };

    // Extract social media links
    const socialLinks = {};
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('linkedin.com')) socialLinks.linkedin_url = href;
      if (href.includes('twitter.com') || href.includes('x.com')) socialLinks.twitter_url = href;
      if (href.includes('facebook.com')) socialLinks.facebook_url = href;
      if (href.includes('youtube.com')) socialLinks.youtube_url = href;
      if (href.includes('instagram.com')) socialLinks.instagram_url = href;
    });
    
    websiteData.social_media = socialLinks;

    // Try to extract contact info from main page
    const text = $('body').text() || '';
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = Array.from(new Set(text.match(emailRegex) || []));
    
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    const phones = Array.from(new Set(text.match(phoneRegex) || []));

    if (emails.length > 0 || phones.length > 0) {
      websiteData.contact = {
        email_addresses: emails.slice(0, 5),
        phone_numbers: phones.slice(0, 3),
        office_locations: []
      };
    }

  } catch (error) {
    console.error("Error extracting website data:", error);
  }

  return websiteData;
}

async function generateAISummary(content, context, title = "") {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `AI summary not available - API key required. This appears to be a ${context} with relevant business information.`;
    }

    const model = await getGeminiAPI();
    if (!model) {
      return `AI service temporarily unavailable. This ${context} contains business information about ${title}.`;
    }

    let prompt;
    if (context === "homepage") {
      prompt = `Analyze this company homepage content and create a professional 2-3 sentence summary focusing on:
      - What the company does
      - Key services or products
      - Target market or unique value proposition
      
      Content: "${content.slice(0, 1500)}"
      
      Provide a clear, concise business summary:`;
    } else if (context === "about") {
      prompt = `Analyze this company's About page and summarize in 2-3 sentences:
      - Company mission and values
      - History or founding story
      - Key differentiators
      
      Content: "${content.slice(0, 1500)}"
      
      Provide a professional summary:`;
    } else {
      prompt = `Summarize this ${context} page content in 2-3 sentences, focusing on key business information:
      
      Content: "${content.slice(0, 1500)}"
      
      Summary:`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();
    
    return summary || `This ${context} contains business information about ${title}.`;
    
  } catch (error) {
    console.error("AI summary error:", error);
    return `This ${context} contains business information about ${title}.`;
  }
}

function extractKeywords(content) {
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const frequency = {};
  
  words.forEach(word => {
    if (!['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'will', 'would', 'there', 'could'].includes(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}
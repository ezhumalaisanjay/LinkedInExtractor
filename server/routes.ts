import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAnalysisResultSchema, websiteDataSchema, linkedinDataSchema } from "@shared/schema";
import { z } from "zod";
import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const urlInputSchema = z.object({
  url: z.string().url(),
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""
);

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze website endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url } = urlInputSchema.parse(req.body);
      
      // Check if analysis already exists
      const existing = await storage.getAnalysisResultByUrl(url);
      if (existing && existing.status === "completed") {
        return res.json(existing);
      }

      // Create new analysis result
      const analysisResult = await storage.createAnalysisResult({
        url,
        status: "pending",
        website_data: null,
        linkedin_data: null,
        error_message: null,
      });

      // Start analysis process (don't await - return immediately)
      analyzeWebsite(url, analysisResult.id).catch(console.error);

      res.json(analysisResult);
    } catch (error) {
      console.error("Analysis request error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Get analysis result endpoint
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.getAnalysisResult(id);
      
      if (!result) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function analyzeWebsite(url: string, analysisId: number) {
  let browser;
  
  try {
    // Launch browser with additional flags for containerized environments
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Extract website data
    const websiteData = await extractWebsiteData(page, url);
    
    // Extract LinkedIn data (mock for now)
    const linkedinData = await extractLinkedInData(websiteData?.social_media?.linkedin_url);
    
    // Update analysis result
    await storage.updateAnalysisResult(analysisId, {
      status: "completed",
      website_data: websiteData,
      linkedin_data: linkedinData,
    });

  } catch (error) {
    console.error("Website analysis error:", error);
    await storage.updateAnalysisResult(analysisId, {
      status: "failed",
      error_message: error instanceof Error ? error.message : "Analysis failed",
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function extractWebsiteData(page: any, baseUrl: string) {
  const websiteData: any = {};

  try {
    // Extract homepage data
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const homeData = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const h1Elements = Array.from(document.querySelectorAll('h1')).map(el => el.textContent?.trim()).filter(Boolean);
      const h2Elements = Array.from(document.querySelectorAll('h2')).map(el => el.textContent?.trim()).filter(Boolean);
      const heroText = document.querySelector('hero, .hero, .banner, .jumbotron')?.textContent?.trim() || '';
      
      return {
        page_title: title,
        meta_description: metaDesc,
        main_headings: [...h1Elements, ...h2Elements].slice(0, 10),
        hero_text: heroText.slice(0, 500),
      };
    });

    // Generate AI summary for homepage
    const homeContent = await page.evaluate(() => {
      return document.body.textContent?.slice(0, 2000) || '';
    });
    
    homeData.summary = await generateAISummary(homeContent, "homepage");
    homeData.keywords = await extractKeywords(homeContent);
    
    websiteData.home = homeData;

    // Extract social media links
    const socialMedia = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const socialLinks: any = {};
      
      links.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('linkedin.com')) socialLinks.linkedin_url = href;
        if (href.includes('twitter.com') || href.includes('x.com')) socialLinks.twitter_url = href;
        if (href.includes('facebook.com')) socialLinks.facebook_url = href;
        if (href.includes('youtube.com')) socialLinks.youtube_url = href;
        if (href.includes('instagram.com')) socialLinks.instagram_url = href;
      });
      
      return socialLinks;
    });
    
    websiteData.social_media = socialMedia;

    // Try to extract other pages
    const commonPaths = ['/about', '/about-us', '/services', '/products', '/contact'];
    
    for (const path of commonPaths) {
      try {
        const fullUrl = new URL(path, baseUrl).toString();
        await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        
        const content = await page.evaluate(() => document.body.textContent?.slice(0, 2000) || '');
        
        if (content.length > 100) { // Only process if substantial content found
          if (path.includes('about')) {
            websiteData.about = await extractAboutData(page, content);
          } else if (path.includes('services')) {
            websiteData.services = await extractServicesData(page, content);
          } else if (path.includes('products')) {
            websiteData.products = await extractProductsData(page, content);
          } else if (path.includes('contact')) {
            websiteData.contact = await extractContactData(page);
          }
        }
      } catch (error) {
        // Page doesn't exist or failed to load, continue
        console.log(`Could not load ${path}:`, error);
      }
    }

  } catch (error) {
    console.error("Error extracting website data:", error);
  }

  return websiteData;
}

async function extractAboutData(page: any, content: string) {
  const aboutData = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(el => el.textContent?.trim()).filter(Boolean);
    const companyName = headings.find(h => h.length < 50) || '';
    
    // Look for founding year
    const yearMatch = document.body.textContent?.match(/(?:founded|established|since)\s*(\d{4})/i);
    const foundingYear = yearMatch ? yearMatch[1] : '';
    
    return {
      company_name: companyName,
      founding_year: foundingYear,
    };
  });

  aboutData.about_summary = await generateAISummary(content, "about page");
  aboutData.mission_statement = await extractMissionStatement(content);
  aboutData.leadership_team = await extractLeadershipTeam(content);

  return aboutData;
}

async function extractServicesData(page: any, content: string) {
  const servicesData = await page.evaluate(() => {
    const serviceElements = Array.from(document.querySelectorAll('h3, h4, .service, .service-item')).slice(0, 10);
    const services = serviceElements.map(el => {
      const title = el.textContent?.trim() || '';
      const description = el.nextElementSibling?.textContent?.trim().slice(0, 200) || '';
      return { title, description };
    }).filter(s => s.title.length > 0);

    return { services_list: services };
  });

  servicesData.services_summary = await generateAISummary(content, "services page");
  servicesData.industries_served = await extractIndustries(content);

  return servicesData;
}

async function extractProductsData(page: any, content: string) {
  const productsData = await page.evaluate(() => {
    const productElements = Array.from(document.querySelectorAll('h3, h4, .product, .product-item')).slice(0, 10);
    const products = productElements.map(el => {
      const title = el.textContent?.trim() || '';
      const description = el.nextElementSibling?.textContent?.trim().slice(0, 200) || '';
      return { title, description };
    }).filter(p => p.title.length > 0);

    return { products_list: products };
  });

  productsData.products_summary = await generateAISummary(content, "products page");
  
  return productsData;
}

async function extractContactData(page: any) {
  return await page.evaluate(() => {
    const text = document.body.textContent || '';
    
    // Extract emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = Array.from(new Set(text.match(emailRegex) || []));
    
    // Extract phone numbers
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    const phones = Array.from(new Set(text.match(phoneRegex) || []));
    
    // Extract addresses (basic)
    const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)[^,.]*,\s*[A-Za-z\s]+/g;
    const addresses = Array.from(new Set(text.match(addressRegex) || []));

    return {
      email_addresses: emails.slice(0, 5),
      phone_numbers: phones.slice(0, 3),
      office_locations: addresses.slice(0, 3),
    };
  });
}

async function extractLinkedInData(linkedinUrl?: string) {
  // For now, return mock LinkedIn data since LinkedIn scraping requires special handling
  if (!linkedinUrl) {
    return null;
  }

  // This would normally scrape LinkedIn, but for demo purposes return null
  // LinkedIn has strict anti-scraping measures and requires special techniques
  return null;
}

async function generateAISummary(content: string, context: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return `AI summary not available - API key required. This appears to be a ${context} with relevant business information.`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Summarize the following ${context} content in 2-3 sentences, focusing on key business information, value propositions, and main offerings:\n\n${content.slice(0, 1500)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().slice(0, 500);
    
  } catch (error) {
    console.error("AI summary error:", error);
    return `Summary generation failed. This appears to be a ${context} with business-related content.`;
  }
}

async function extractKeywords(content: string): Promise<string[]> {
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const frequency: { [key: string]: number } = {};
  
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

async function extractMissionStatement(content: string): Promise<string> {
  const missionRegex = /(?:mission|vision|purpose|goal)[\s\S]{0,200}/i;
  const match = content.match(missionRegex);
  return match ? match[0].slice(0, 300) : '';
}

async function extractLeadershipTeam(content: string): Promise<Array<{name: string, role: string}>> {
  const team: Array<{name: string, role: string}> = [];
  
  // Basic pattern matching for leadership
  const patterns = [
    /([A-Z][a-z]+ [A-Z][a-z]+),?\s*(CEO|CTO|CFO|President|Founder|Director)/gi,
    /(CEO|CTO|CFO|President|Founder|Director)[\s:,-]*([A-Z][a-z]+ [A-Z][a-z]+)/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null && team.length < 5) {
      const name = match[1] || match[2];
      const role = match[2] || match[1];
      if (name && role && name.length < 50) {
        team.push({ name: name.trim(), role: role.trim() });
      }
    }
  });
  
  return team;
}

async function extractIndustries(content: string): Promise<string[]> {
  const industries = ['healthcare', 'finance', 'technology', 'education', 'manufacturing', 'retail', 'automotive', 'aerospace', 'energy', 'telecommunications'];
  
  return industries.filter(industry => 
    content.toLowerCase().includes(industry)
  ).slice(0, 5);
}

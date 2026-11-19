import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: number }).status)
          : 0;
      const isTransient = status >= 500 || status === 0;
      if (!isTransient || attempt === maxAttempts) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    }
  }
  throw lastError;
}

function formatApiError(err: unknown): { status: number; message: string } {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { status?: number; message?: string };
    const status = typeof anyErr.status === 'number' && anyErr.status >= 400 ? anyErr.status : 500;
    const rawMsg = anyErr.message || 'An unexpected error occurred while consulting Gemini.';
    if (status === 403 || rawMsg.includes('PERMISSION_DENIED') || rawMsg.includes('API_KEY_INVALID')) {
      return {
        status: 403,
        message: 'Gemini API key authentication failed. Please verify your API key in Settings > Secrets.',
      };
    }
    if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
      return {
        status: 429,
        message: 'API rate limit reached. Please wait a moment and try again.',
      };
    }
    return { status, message: rawMsg };
  }
  return { status: 500, message: 'Failed to process request.' };
}

const discoveryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    profileSummary: {
      type: Type.STRING,
      description:
        'A crisp 2-sentence plain-English summary highlighting this student’s strongest Central, State, and institutional funding eligibility pathways.',
    },
    recommendedStrategy: {
      type: Type.STRING,
      description:
        'One practical tip on stacking rules (e.g., Central vs State DBT overlap rules) or priority order of application for this student.',
    },
    opportunities: {
      type: Type.ARRAY,
      description:
        '6 to 7 real, authentic Indian scholarships, fellowships, or government student opportunities tailored strictly to the student profile.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: 'Exact official scheme name.' },
          provider: {
            type: Type.STRING,
            description: 'Sponsoring Ministry, State Department, or Public Agency.',
          },
          scope: {
            type: Type.STRING,
            description: 'Must be one of: Central, State, Fellowship, Skill & Internship',
          },
          opportunityType: {
            type: Type.STRING,
            description: 'Short label like Merit-cum-Means Scholarship, Post-Matric Tuition Waiver, Research Fellowship, or Paid Govt Internship.',
          },
          benefitAmount: {
            type: Type.STRING,
            description: 'Concise INR benefit figure, e.g. "₹50,000 / year" or "100% Tuition + ₹12,000/yr maintenance".',
          },
          applicationWindow: {
            type: Type.STRING,
            description: 'Typical annual window, e.g. "July – October (Annual)" or "Rolling / Year-round".',
          },
          officialPortalName: { type: Type.STRING },
          officialPortalUrl: {
            type: Type.STRING,
            description: 'Valid official https:// government or agency portal URL.',
          },
          eligibilityVerdict: {
            type: Type.STRING,
            description: 'Must be one of: Strong Match, Likely Eligible, Conditional',
          },
          whyItFits: {
            type: Type.STRING,
            description: '2-3 concise sentences explaining specifically how the student’s qualification, category, income, and state align with this scheme.',
          },
          eligibilityBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterion: { type: Type.STRING, description: 'e.g., Academic Score, Family Income, Social Category, Domicile, Course Level' },
                requirement: { type: Type.STRING, description: 'Official threshold or rule.' },
                studentStatus: { type: Type.STRING, description: 'How the student’s submitted input compares.' },
                verdict: {
                  type: Type.STRING,
                  description: 'Must be one of: Met, Verify, Action Needed',
                },
              },
              required: ['criterion', 'requirement', 'studentStatus', 'verdict'],
            },
          },
          stepByStepProcess: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '4 to 5 concrete, actionable steps to apply on the official portal.',
          },
          documents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'Normalized slug id like aadhaar_npci, income_cert, caste_cert, domicile_cert, marksheet_prev, bonafide_cert' },
                name: { type: Type.STRING },
                issuingAuthority: { type: Type.STRING, description: 'e.g. Tehsildar / e-District, College Registrar, UIDAI / Bank' },
                mandatory: { type: Type.BOOLEAN },
                formatNote: { type: Type.STRING, description: 'e.g. Self-attested PDF under 200 KB, valid for FY 2025-26' },
                tip: { type: Type.STRING, description: 'Practical tip to avoid rejection.' },
              },
              required: ['id', 'name', 'issuingAuthority', 'mandatory', 'formatNote', 'tip'],
            },
          },
          commonPitfalls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 specific reasons applications get rejected or put on defect.',
          },
        },
        required: [
          'id',
          'name',
          'provider',
          'scope',
          'opportunityType',
          'benefitAmount',
          'applicationWindow',
          'officialPortalName',
          'officialPortalUrl',
          'eligibilityVerdict',
          'whyItFits',
          'eligibilityBreakdown',
          'stepByStepProcess',
          'documents',
          'commonPitfalls',
        ],
      },
    },
    masterChecklist: {
      type: Type.ARRAY,
      description: '6 to 9 deduplicated essential documents across all matched schemes so the student can prepare once and apply everywhere.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Matching slug id used in opportunities.documents' },
          name: { type: Type.STRING },
          issuingAuthority: { type: Type.STRING },
          usedBySchemes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Names of the matched schemes requiring this document.',
          },
          priority: {
            type: Type.STRING,
            description: 'Must be one of: Core Foundation, Category & Income, Academic & Institution',
          },
          preparationTip: { type: Type.STRING },
        },
        required: ['id', 'name', 'issuingAuthority', 'usedBySchemes', 'priority', 'preparationTip'],
      },
    },
  },
  required: ['profileSummary', 'recommendedStrategy', 'opportunities', 'masterChecklist'],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/scholarships/discover', async (req, res) => {
    try {
      const profile = req.body?.profile;
      if (!profile || !profile.educationLevel || !profile.category || !profile.state) {
        return res.status(400).json({
          error: 'Please provide education level, social category, and state of domicile.',
        });
      }

      const ai = getGeminiClient();

      const systemInstruction = `You are ScholarSetu AI, an expert Indian Government Scholarship, Fellowship, and Public Opportunity Advisor.
Your job is to match students accurately to REAL Indian Central Government schemes (NSP, AICTE, UGC, DST, CSIR, Ministries of Education, Social Justice, Tribal Affairs, Minority Affairs, Skill Development), authentic State Government schemes for their exact state of domicile, and recognized PSU/public trust programs.

Strict accuracy rules:
1. Recommend ONLY real, well-established schemes that genuinely match the student's education level, academic stream, category, family annual income bracket, gender, state domicile, and special criteria.
2. Never recommend an SC-only scheme to a General student, or a Girls-only scheme (like AICTE Pragati or Begum Hazrat Mahal) to a Male student, or a Class 9-10 scheme to a PG student.
3. Always include at least 1-2 genuine State Government schemes specific to the student's selected State/UT (using the actual state portal such as MahaDBT, Odisha State Scholarship Portal, UP Scholarship, SSP Karnataka, SVMCM, e-Kalyan, MPTAAS, Rajasthan SJE, Digital Gujarat, TS ePASS, etc.) alongside Central schemes and relevant Fellowships or Government Skill/Internship programs (e.g., NATS 2.0, PM Internship Scheme, AICTE Internship, DST INSPIRE) where relevant.
4. Keep every explanation grounded, practical, and free of hype. Highlight real administrative details Indian students face: NSP OTR (One-Time Registration), NPCI Aadhaar bank seeding (DBT), Institute Nodal Officer (INO) verification, Tehsildar/e-District income certificate validity, and non-duplication rules.
5. Use consistent normalized document IDs (e.g., "aadhaar_npci", "income_cert", "caste_category_cert", "domicile_cert", "prev_marksheet", "bonafide_fee_receipt", "bank_passbook", "passport_photo") between individual opportunity checklists and masterChecklist so checkboxes synchronize seamlessly.
6. Ensure 'scope' is strictly one of: "Central", "State", "Fellowship", "Skill & Internship".
7. Ensure 'eligibilityVerdict' is strictly one of: "Strong Match", "Likely Eligible", "Conditional".
8. Ensure each breakdown item's 'verdict' is strictly one of: "Met", "Verify", "Action Needed".
9. Ensure each masterChecklist item's 'priority' is strictly one of: "Core Foundation", "Category & Income", "Academic & Institution".`;

      const userPrompt = `Analyze this student profile and identify 6 to 7 best-fit real Indian scholarships and government opportunities, with transparent criterion-by-criterion eligibility breakdowns and a synchronized document checklist:

- Current Education Level: ${profile.educationLevel}
- Academic Stream / Discipline: ${profile.stream}
- Previous Academic Score: ${profile.percentage}%
- Social Category: ${profile.category}
- Annual Family Income: ${profile.annualIncome}
- Gender: ${profile.gender}
- State / UT of Domicile: ${profile.state}${profile.district ? ` (District: ${profile.district})` : ''}
- Institution Type: ${profile.institutionType}
- Special Eligibility Factors: ${
        Array.isArray(profile.specialCriteria) && profile.specialCriteria.length > 0
          ? profile.specialCriteria.join(', ')
          : 'None specified'
      }
- Opportunity Focus: ${profile.opportunityFocus}

Return strictly valid JSON adhering to the provided schema.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: discoveryResponseSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({
          error: 'Received an empty response from the matching engine. Please try again.',
        });
      }

      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (err) {
      console.error('Error in /api/scholarships/discover:', err);
      const { status, message } = formatApiError(err);
      return res.status(status).json({ error: message });
    }
  });

  app.post('/api/scholarships/verify-live', async (req, res) => {
    try {
      const { schemeName, provider, state } = req.body || {};
      if (!schemeName) {
        return res.status(400).json({ error: 'Scheme name is required for live verification.' });
      }

      const ai = getGeminiClient();

      const prompt = `Search official Indian government portals and recent announcements for "${schemeName}" (${provider || 'Government of India'}, State context: ${state || 'India'}).
Provide a concise, factual verification brief in 4 short bullet points covering:
1. Official portal URL and current application cycle / deadline status.
2. Any recent updates to income ceiling, stipend amount, or OTR / Aadhaar e-KYC rules.
3. Key renewal or verification steps (INO / DNO / e-District).
4. One caution note if dates are not yet officially notified for the upcoming cycle.
Keep the tone clear, direct, and easy for a student to scan in 15 seconds. Do not use markdown code blocks.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        })
      );

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources: Array<{ title: string; uri: string }> = [];
      const seen = new Set<string>();

      for (const chunk of chunks) {
        const web = chunk.web;
        if (web?.uri && !seen.has(web.uri)) {
          seen.add(web.uri);
          sources.push({
            title: web.title || web.uri,
            uri: web.uri,
          });
        }
      }

      return res.json({
        summary: (response.text ?? '').trim(),
        sources: sources.slice(0, 5),
        verifiedAt: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch (err) {
      console.error('Error in /api/scholarships/verify-live:', err);
      const { status, message } = formatApiError(err);
      return res.status(status).json({ error: message });
    }
  });

  app.post('/api/scholarships/ask-eligibility', async (req, res) => {
    try {
      const { question, scheme, profile } = req.body || {};
      if (!question || !scheme) {
        return res.status(400).json({ error: 'Question and selected scheme details are required.' });
      }

      const ai = getGeminiClient();

      const systemInstruction = `You are ScholarSetu AI's Eligibility Counselor for Indian students.
Answer the student's question accurately, concisely (3 to 5 sentences max), and practically based on official Indian scholarship administration rules (NSP, State DBT portals, AICTE, UGC).
If a rule varies by state or annual notification, explicitly state what the student should verify on the official portal or with their college Institute Nodal Officer (INO). Avoid fluff and markdown headings.`;

      const prompt = `Student Profile:
- Level: ${profile?.educationLevel || 'Not specified'} (${profile?.stream || 'Any'})
- Marks: ${profile?.percentage ?? 'N/A'}%
- Category: ${profile?.category || 'Not specified'}
- Family Income: ${profile?.annualIncome || 'Not specified'}
- State: ${profile?.state || 'India'}
- Gender: ${profile?.gender || 'Not specified'}

Selected Opportunity:
- Name: ${scheme.name}
- Provider: ${scheme.provider}
- Portal: ${scheme.officialPortalName} (${scheme.officialPortalUrl})
- Typical Benefit: ${scheme.benefitAmount}

Student's Question: "${question}"`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        })
      );

      return res.json({
        answer: (response.text ?? '').trim(),
      });
    } catch (err) {
      console.error('Error in /api/scholarships/ask-eligibility:', err);
      const { status, message } = formatApiError(err);
      return res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarSetu AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ScholarSetu AI server:', err);
  process.exit(1);
});

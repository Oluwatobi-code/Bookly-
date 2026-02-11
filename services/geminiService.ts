
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, Product, ExpenseCategory } from "../types";
import { trackApiUsage, isQuotaExhausted } from "./quotaManager";
import { getCachedExtraction, setCachedExtraction } from "./extractionCache";

// Lazy initialization to prevent crash on startup if key is missing
const getAI = () => {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) {
    console.warn("Bookly: No Gemini API Key found. AI features will be disabled.");
  }
  return new GoogleGenAI({ apiKey: key });
};

const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) cleaned = match[1].trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

/**
 * Fallback extraction using basic regex patterns
 * Used when API is unavailable or quota is exhausted
 */
export const createManualFallbackStructure = (input: string): ExtractionResult => {
  const lowerInput = input.toLowerCase();

  // Patterns for different intent types
  const expensePattern = /(?:paid|spent|cost|expense|logistics|delivery).*?(?:₦|\$)?(\d+(?:[,.\s]\d{3})*)/i;
  const pricePattern = /(?:price|cost|amount).*?(?:₦|\$)?(\d+(?:[,.\s]\d{3})*)/i;
  const quantityPattern = /(\d+)\s*(?:x|of|@|units?|items?)\s+(\w+)/i;
  const productPattern = /(?:add|new|product|item).*?([a-z\s]+?)(?:price|cost|:|at|for)?/i;
  const customerPattern = /(?:customer|user|client|john|chioma|person).*?([a-z\s]+?)(?:on|via|at|ordered|bought)?/i;
  const platformPattern = /(?:whatsapp|instagram|facebook|telegram|phone|call|walk-in)/i;

  // Try to detect expense
  if (lowerInput.includes('paid') || lowerInput.includes('expense') || lowerInput.includes('cost')) {
    const expenseMatch = input.match(expensePattern);
    if (expenseMatch) {
      const amount = parseInt(expenseMatch[1].replace(/[,.\s]/g, ''));
      const categoryMatch = input.match(/(?:delivery|logistics|rent|utilities|supplies|marketing|salary)/i);

      return {
        intent: 'expense',
        recordType: 'expense',
        amount,
        category: (categoryMatch ? categoryMatch[0].toLowerCase() : 'Other') as ExpenseCategory,
        description: input,
        confidence: 'low',
        vendor: input.match(/(?:to|with|from)\s+(\w+)/i)?.[1] || 'Unknown'
      };
    }
  }

  // Try to detect product
  if (lowerInput.includes('add') || lowerInput.includes('product') || lowerInput.includes('new item')) {
    const productMatch = input.match(productPattern);
    const priceMatch = input.match(/price.*?(?:₦|\$)?(\d+(?:[,.\s]\d{3})*)/i);
    const costMatch = input.match(/cost.*?(?:₦|\$)?(\d+(?:[,.\s]\d{3})*)/i);
    const stockMatch = input.match(/stock.*?(\d+)/i);

    if (productMatch) {
      return {
        intent: 'product',
        name: productMatch[1]?.trim() || 'New Product',
        price: priceMatch ? parseInt(priceMatch[1].replace(/[,.\s]/g, '')) : 0,
        costPrice: costMatch ? parseInt(costMatch[1].replace(/[,.\s]/g, '')) : 0,
        stock: stockMatch ? parseInt(stockMatch[1]) : 0,
        category: 'Other',
        confidence: 'low'
      };
    }
  }

  // Try to detect sale
  if (lowerInput.includes('order') || lowerInput.includes('buy') || lowerInput.includes('purchased')) {
    const quantityMatch = input.match(quantityPattern);
    const totalMatch = input.match(/(?:total|tsh|for).*?(?:₦|\$)?(\d+(?:[,.\s]\d{3})*)/i);
    const platformMatch = input.match(platformPattern);
    const deliveryMatch = input.match(/delivery.*?(?:₦|\$)?(\d+(?:[,.\s]\d{3})*)/i);
    const customerMatch = input.match(customerPattern);

    if (quantityMatch || totalMatch) {
      return {
        intent: 'sale',
        recordType: 'order',
        customerName: customerMatch ? customerMatch[1]?.trim() : 'Customer',
        customerHandle: (customerMatch ? customerMatch[1]?.trim() : 'customer').toLowerCase().replace(/\s+/g, '_'),
        platform: platformMatch ? (platformMatch[0] as any) : 'WhatsApp',
        confidence: 'low',
        orderItems: quantityMatch
          ? [{
              productName: quantityMatch[2] || 'Item',
              quantity: parseInt(quantityMatch[1]),
              unitPrice: 0
            }]
          : [],
        total: totalMatch ? parseInt(totalMatch[1].replace(/[,.\s]/g, '')) : 0,
        deliveryFee: deliveryMatch ? parseInt(deliveryMatch[1].replace(/[,.\s]/g, '')) : 0
      };
    }
  }

  // Default to inquiry
  return {
    intent: 'inquiry',
    confidence: 'low',
    suggestedActions: ['Manual Entry', 'Try Again', 'Contact Support']
  };
};

/**
 * Retry configuration interface
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 2,
  initialDelayMs: 1000,
  maxDelayMs: 5000
};

/**
 * Sleep/delay utility
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeIntentAndExtract = async (
  inputs: { text?: string; imageBase64?: string }[],
  inventory: Product[]
): Promise<ExtractionResult | null> => {
  const inventoryList = inventory.map(p => `"${p.name}" (Price:${p.price}, Stock:${p.stock})`).join(", ");

  const systemInstruction = `You are the Bookly AI Engine. Analyze business inputs and return structured JSON.

INTENT CATEGORIES:
1. "sale": Customer buying/ordering items.
2. "expense": Business costs (rent, logistics, delivery fees).
3. "product": New inventory items.
4. "inquiry": Customer asking for info (delivery cost, account details, availability).

RECORD TYPE CLASSIFICATION:
- For "sale" intent: set "recordType" to "order"
- For "expense" intent: set "recordType" to "expense"
- For other intents: recordType is optional

INSTRUCTIONS:
- Match products to this list if possible: ${inventoryList}.
- If a product isn't on the list, still extract it as a new item.
- If "inquiry" is detected, provide "suggestedActions" (e.g., "Send Account Details", "Calculate Shipping").
- Look for delivery or shipping fees in sales dialogue and extract into "deliveryFee".
- "confidence": "high", "medium", or "low".
- Return ONLY valid JSON.`;

  const parts: any[] = [{ text: systemInstruction }];
  inputs.forEach(input => {
    if (input.text) parts.push({ text: `INPUT:\n${input.text}` });
    if (input.imageBase64) {
      const data = input.imageBase64.includes(',') ? input.imageBase64.split(',')[1] : input.imageBase64;
      parts.push({ inlineData: { mimeType: "image/jpeg", data } });
    }
  });

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, enum: ['sale', 'product', 'expense', 'inquiry'] },
            recordType: { type: Type.STRING, enum: ['order', 'expense'] },
            confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            orderType: { type: Type.STRING, enum: ['single', 'batch'] },
            customers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  handle: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  deliveryFee: { type: Type.NUMBER },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        productName: { type: Type.STRING },
                        quantity: { type: Type.INTEGER },
                        variant: { type: Type.STRING },
                        unitPrice: { type: Type.NUMBER }
                      }
                    }
                  },
                  orderTotal: { type: Type.NUMBER },
                  address: { type: Type.STRING }
                }
              }
            },
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            costPrice: { type: Type.NUMBER },
            stock: { type: Type.INTEGER },
            category: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            vendor: { type: Type.STRING },
            paymentMethod: { type: Type.STRING }
          },
          required: ["intent", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    const json = JSON.parse(cleanJsonResponse(text));

    if (json.intent === 'sale' && json.customers) {
      json.customers = json.customers.map((c: any) => ({
        ...c,
        orderTotal: c.orderTotal || c.items?.reduce((acc: number, item: any) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0) || 0
      }));

      // Flatten for single customer cases to support simpler UI components
      if (json.customers.length === 1) {
        const first = json.customers[0];
        json.customerName = first.handle || 'Customer';
        json.customerHandle = first.handle;
        json.orderItems = first.items || [];
        json.items = json.orderItems; // Compatibility
        json.total = first.orderTotal;
        json.deliveryFee = first.deliveryFee || 0;
        json.platform = first.platform || 'WhatsApp';
      }
    }

    return json;
  } catch (e) {
    console.error("Extraction Failed:", e);
    // Track the failure
    trackApiUsage(100); // Small token count for failed attempt
    throw e; // Re-throw so retry logic can handle it
  }
};

/**
 * Retry the extraction with exponential backoff
 * Useful for handling temporary API quota issues
 */
export const analyzeIntentAndExtractWithRetry = async (
  inputs: { text?: string; imageBase64?: string }[],
  inventory: Product[],
  config: RetryConfig = defaultRetryConfig
): Promise<ExtractionResult | null> => {
  let lastError: any = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await analyzeIntentAndExtract(inputs, inventory);
      if (result) return result;
    } catch (error: any) {
      lastError = error;

      // Check if it's a quota error (429)
      if (error?.status === 429 || error?.message?.includes('quota')) {
        if (attempt < config.maxRetries) {
          // Calculate exponential backoff
          const delayMs = Math.min(
            config.initialDelayMs * Math.pow(2, attempt),
            config.maxDelayMs
          );
          console.log(
            `⏳ Quota exceeded. Retrying in ${delayMs}ms... (Attempt ${attempt + 1}/${config.maxRetries})`
          );
          await delay(delayMs);
          continue;
        }
      }

      // For other errors, don't retry
      break;
    }
  }

  console.error('Extraction failed after retries:', lastError);
  return null;
};

/**
 * Smart extraction with all failsafes enabled
 * Priority: Cache → API (with retry) → Fallback → Manual entry
 */
export interface ExtractionOptions {
  useRetry?: boolean;
  useCache?: boolean;
  useFallback?: boolean;
  maxRetries?: number;
}

export interface SmartExtractionResult {
  result: ExtractionResult | null;
  source: 'api' | 'cache' | 'fallback' | 'none';
  error?: string;
}

export const smartAnalyzeAndExtract = async (
  inputs: { text?: string; imageBase64?: string }[],
  inventory: Product[],
  options: ExtractionOptions = {
    useRetry: true,
    useCache: true,
    useFallback: true,
    maxRetries: 2
  }
): Promise<SmartExtractionResult> => {
  const textInput = inputs.find(i => i.text)?.text || '';

  // Step 1: Check if quota is exhausted first
  if (isQuotaExhausted()) {
    console.warn('📛 API quota exhausted, using fallback mode');
    if (options.useFallback) {
      const fallbackResult = createManualFallbackStructure(textInput);
      return {
        result: fallbackResult,
        source: 'fallback',
        error: 'API quota exhausted, using basic parsing'
      };
    }
    return { result: null, source: 'none', error: 'API quota exhausted' };
  }

  // Step 2: Check cache
  if (options.useCache && textInput) {
    const cached = getCachedExtraction(textInput);
    if (cached) {
      return { result: cached, source: 'cache' };
    }
  }

  // Step 3: Try API with optional retry
  let apiResult: ExtractionResult | null = null;
  let apiError: string = '';

  try {
    if (options.useRetry) {
      apiResult = await analyzeIntentAndExtractWithRetry(inputs, inventory, {
        maxRetries: options.maxRetries || 2,
        initialDelayMs: 1000,
        maxDelayMs: 5000
      });
    } else {
      apiResult = await analyzeIntentAndExtract(inputs, inventory);
    }

    if (apiResult) {
      // Cache successful result
      if (options.useCache && textInput) {
        setCachedExtraction(textInput, apiResult);
      }
      return { result: apiResult, source: 'api' };
    }
  } catch (error: any) {
    apiError = error?.message || 'API error';
    console.error('API extraction failed:', apiError);
  }

  // Step 4: Fallback to manual extraction
  if (options.useFallback) {
    const fallbackResult = createManualFallbackStructure(textInput);
    if (fallbackResult.intent !== 'inquiry' || fallbackResult.suggestedActions?.length === 0) {
      return {
        result: fallbackResult,
        source: 'fallback',
        error: 'Using basic parsing mode'
      };
    }
  }

  // Step 5: Return error
  return {
    result: null,
    source: 'none',
    error: 'Could not extract data. Please enter manually.'
  };
};

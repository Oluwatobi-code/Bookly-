# AI Text Extraction Test Suite

This directory contains test utilities for Bookly's AI-powered text extraction feature that intelligently parses business inputs (text and images) and extracts structured data for sales, expenses, and product management.

## Overview

The AI extraction system uses Google's Gemini API to understand business context and automatically categorize and extract information from natural language inputs.

### Supported Intent Types

1. **Sale (order)** - Customer purchases with items, quantities, and pricing
2. **Product** - New inventory items with pricing and stock information
3. **Expense** - Business costs with category and description
4. **Inquiry** - Customer questions with suggested responses

## Test Files

### 1. `test-extraction-mock.ts` (Recommended)
Mock test that demonstrates the extraction system without hitting API rate limits.

**Run it:**
```bash
npx tsx test-extraction-mock.ts
```

**What it tests:**
- Sales with multiple items
- Customer tracking with platform info
- Product addition
- Expense categorization
- Customer inquiries
- Delivery fees and shipping

### 2. `test-extraction.ts` (Real API)
Uses the real Gemini API to test extraction with live AI models.

**Run it:**
```bash
npx tsx test-extraction.ts
```

**Note:** This test requires:
- Valid `GEMINI_API_KEY` in `.env`
- Available API quota (free tier has daily limits)

## Test Cases

| Test | Input | Expected Intent |
|------|-------|-----------------|
| Simple Sale | "I want to buy 2 laptops and 1 phone for 80000 total" | sale |
| Sale with Customer | "John on WhatsApp ordered 3 headphones for 15000 from Lagos" | sale |
| Add Product | "Add new product: Monitor, price 15000, cost 10000, stock 20" | product |
| Expense Entry | "Paid 5000 for delivery to customer in Ikoyi" | expense |
| Customer Inquiry | "What is the price of a laptop?" | inquiry |
| Sale with Fee | "Customer Chioma WhatsApp: 1 laptop + 2 headphones = 60000, delivery fee 2000" | sale |

## How the AI Extraction Works

### In HoverBot Component
The `HoverBot.tsx` component integrates AI extraction:

1. **User Input**: Text or image from HoverBot interface
2. **Analysis**: `analyzeIntentAndExtract()` from `geminiService.ts`
3. **Classification**: Intent detection (sale/product/expense/inquiry)
4. **Extraction**: Structured data with confidence scores
5. **Review**: User verifies extracted data in review modal
6. **Commit**: Confirmed records are saved

### Extraction Flow
```
Text/Image Input
      ↓
AI Classification
      ↓
Data Extraction
      ↓
Confidence Scoring
      ↓
Review & Confirmation
      ↓
Database Save
```

## API Quota Information

**Free Tier Limits (Gemini API):**
- 15 requests per minute
- 1 million tokens per day
- Some models have daily/monthly limits

**When quota is exceeded:**
- Error code: 429 (RESOURCE_EXHAUSTED)
- Retry after: ~20+ seconds
- Use mock tests while waiting for quota reset

## Mock Results Structure

The mock test includes realistic example responses for each intent type:

### Sale Response
```typescript
{
  intent: 'sale',
  recordType: 'order',
  customerName: 'Chioma',
  customerHandle: 'chioma_whatsapp',
  platform: 'WhatsApp',
  orderItems: [
    { productName: 'Laptop', quantity: 1, unitPrice: 50000 },
    { productName: 'Headphones', quantity: 2, unitPrice: 5000 }
  ],
  total: 60000,
  deliveryFee: 2000,
  confidence: 'high'
}
```

### Product Response
```typescript
{
  intent: 'product',
  name: 'Monitor',
  price: 15000,
  costPrice: 10000,
  stock: 20,
  category: 'Electronics',
  confidence: 'high'
}
```

### Expense Response
```typescript
{
  intent: 'expense',
  recordType: 'expense',
  amount: 5000,
  category: 'Logistics',
  description: 'Delivery to customer in Ikoyi',
  confidence: 'high'
}
```

## Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_api_key_here
```

Get your API key:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Add to `.env`

### Model Configuration
- **Current Model**: `gemini-2.0-flash`
- **Temperature**: 0.1 (deterministic responses)
- **Response Format**: JSON with strict schema

## Key Features Tested

✅ **Text Parsing** - Extracts structured data from natural language
✅ **Confidence Scoring** - Rates extraction accuracy (high/medium/low)
✅ **Intent Classification** - Categorizes input type automatically
✅ **Inventory Matching** - Links product names to existing inventory
✅ **Delivery Fee Detection** - Extracts shipping costs from sales
✅ **Customer Tracking** - Captures customer handle and platform info
✅ **Batch Processing** - Supports multiple items in single input
✅ **Image Recognition** - Can extract data from receipt/invoice images

## Troubleshooting

### API Key Not Found
```
Error: API key must be set when using the Gemini API
```
**Solution**: Ensure `GEMINI_API_KEY` is in `.env` file

### Model Not Found (404)
```
Error: models/gemini-1.5-flash is not found
```
**Solution**: Update model name in `geminiService.ts` to available model

### Quota Exceeded (429)
```
Error: You exceeded your current quota
```
**Solution**: 
1. Use mock tests while waiting
2. Check quota at https://ai.dev/rate-limit
3. Upgrade to paid plan for higher limits

### Extraction Returns Null
Check console for error messages and verify:
- API key is valid
- Inventory is populated
- Input text is descriptive enough
- API quota is available

## Next Steps

1. **Run Mock Tests**: `npx tsx test-extraction-mock.ts`
2. **Test Real API**: Once quota available, run `npx tsx test-extraction.ts`
3. **Use in App**: Open HoverBot in the UI to test live extraction
4. **Monitor Usage**: Check [API dashboard](https://console.cloud.google.com/)

## Integration with Bookly

The extraction system is integrated in:
- **HoverBot.tsx** - UI component for text/image input
- **geminiService.ts** - API integration
- **ReviewConfirmModal.tsx** - Verification interface
- **Dashboard.tsx** - Main application

For questions or improvements, check the component files!

# 🚀 Quick Start: AI Text Extraction Tests

## Run Tests in 30 Seconds

### Option 1: Mock Tests (Recommended) ⭐
```bash
npx tsx test-extraction-mock.ts
```
✅ No API key needed  
✅ No quota limits  
✅ Instant results  

### Option 2: Real API Tests
```bash
npx tsx test-extraction.ts
```
⚠️ Requires GEMINI_API_KEY in .env  
⚠️ Uses daily API quota  

---

## What Gets Tested

| Type | Example Input | What It Extracts |
|------|---------------|-----------------|
| 💰 **Sale** | "Customer John ordered 2 phones for 60k" | Items, customer, total, platform |
| 📦 **Product** | "Add Monitor: price 15k, cost 10k, stock 20" | Product name, pricing, stock |
| 💸 **Expense** | "Paid 5k for delivery" | Amount, category, vendor |
| ❓ **Inquiry** | "What's the price of a laptop?" | Suggested actions |

---

## Expected Output

```
🚀 Starting Mock AI Text Extraction Tests...

📝 Test: Simple Sale
   Input: "I want to buy 2 laptops and 1 phone for 80000 total"
   ✅ Intent: sale ✓
   📊 Confidence: high
   👤 Customer: Customer
   🛍️  Items: 2
      - Laptop: 2x @ ₦50000
      - Phone: 1x @ ₦30000
   💰 Total: ₦130000

[... 5 more tests ...]

════════════════════════════════════════════════════════════
✨ Tests completed!
   ✅ Passed: 6/6
   ❌ Failed: 0/6
════════════════════════════════════════════════════════════
```

---

## File Structure

```
Bookly-/
├── test-extraction-mock.ts          ← Run this! (no API needed)
├── test-extraction.ts               ← Real API tests
├── TEST_AI_EXTRACTION.md            ← Full documentation
├── TEST_RESULTS.md                  ← Detailed results
├── QUICK_START_EXTRACTION_TEST.md   ← This file
├── services/
│   └── geminiService.ts             ← Core extraction logic
└── components/
    └── HoverBot.tsx                 ← UI integration
```

---

## One-Liner Command

Test everything with one command:
```bash
npx tsx test-extraction-mock.ts && echo "✅ All tests passed!"
```

---

## Troubleshooting

### "Command not found: npx"
```bash
npm install -g npm  # Update npm to get npx
```

### "Module not found: tsx"
```bash
npm install tsx --save-dev  # Install tsx locally
```

### "API Key error"
```bash
# Add to .env
echo "GEMINI_API_KEY=your_key_here" >> .env
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `test-extraction-mock.ts` | Safe test runner (no API) |
| `services/geminiService.ts` | Core AI extraction |
| `components/HoverBot.tsx` | UI component using extraction |
| `.env` | API key configuration |

---

## After Testing

1. ✅ Check test output in console
2. 📖 Read `TEST_AI_EXTRACTION.md` for details
3. 🎯 Try real tests when API quota resets
4. 🔧 Use HoverBot in app for live testing

---

**Ready?** Run this now:
```bash
npx tsx test-extraction-mock.ts
```

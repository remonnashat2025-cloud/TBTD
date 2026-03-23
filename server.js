const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tbtd@5007';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// API endpoint - بيستقبل الأسئلة ويبعتها لـ Anthropic
app.post('/api/ask', async (req, res) => {
  const { messages, systemPrompt } = req.body;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key مش موجود' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الاتصال بـ Anthropic' });
  }
});

// حفظ وجلب التعليمات في الذاكرة (يتمسح لو السيرفر اتعمله restart)
let storedData = { instructions: '', pdfTexts: [] };

app.get('/api/instructions', (req, res) => {
  res.json(storedData);
});

app.post('/api/instructions', (req, res) => {
  storedData = req.body;
  res.json({ success: true });
});

// التحقق من باسوورد المدير
app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  res.json({ success: password === ADMIN_PASSWORD });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

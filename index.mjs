import fetch from 'node-fetch';

const OPENAI_API_KEY = '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';
const SUPABASE_URL = 'https://dnvlrxomgfuyakvyexfa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudmxyeG9tZ2Z1eWFrdnlleGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDU5ODEsImV4cCI6MjA2NjAyMTk4MX0.CWnhV9Hv7aoz_3tiC0VV-Vm2BCjoIqLFwglkbUC_pZ8';

const note = `J’ai lu un truc sur la mémoire implicite et je veux explorer ça dans ma formation.`;

async function sendToOpenAI(text) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu es MemoVault, un assistant mémoire. Résume les idées en 3–5 lignes et propose 3 tags pertinents.'
        },
        {
          role: 'user',
          content: `Voici une idée : ${text}`
        }
      ]
    })
  });

  const data = await res.json();
  console.log("🧪 Réponse brute GPT :", data);

  if (!data.choices || !data.choices[0]) {
    console.error("❌ Réponse GPT invalide ou vide");
    return null;
  }

  return data.choices[0].message.content;
}

async function saveToSupabase(content, summary, tags) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/memos`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      content: content,
      summary: summary,
      tags: tags
    })
  });

  const data = await response.json();
  console.log('📦 Sauvegardé dans Supabase :', data);
}

(async () => {
  const gptResponse = await sendToOpenAI(note);

  if (!gptResponse) {
    console.error('⚠️ GPT n’a rien renvoyé, abandon...');
    return;
  }

  const [summaryPart, tagsPart] = gptResponse.split('Tags:');
  const summary = summaryPart.trim();
  const tags = tagsPart ? tagsPart.trim().split(',').map(tag => tag.trim()) : [];

  console.log('🧠 Résumé :', summary);
  console.log('🏷️ Tags :', tags);

  await saveToSupabase(note, summary, tags);
})();

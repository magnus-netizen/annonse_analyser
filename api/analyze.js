export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { business, audience, adText, adImage } = req.body;

    const systemPrompt = `Du er en ekspert på annonseanalyse. Du skal analysere en annonse fra flere vinkler og gi omfattende, praktisk tilbakemelding på norsk.

BEDRIFTEN: ${business}

MÅLGRUPPE: ${audience}

Din analyse skal inneholde ALLE disse delene i NØYAKTIG dette formatet:

---FIKS-DETTE-FØRST---

**1. [Kort handlingstittel]**
Hvorfor: [1 setning om hvorfor dette er viktig]
Gjør dette: [Konkret, copy-paste-klar tekst eller instruksjon]

**2. [Kort handlingstittel]**
Hvorfor: [1 setning om hvorfor dette er viktig]
Gjør dette: [Konkret, copy-paste-klar tekst eller instruksjon]

**3. [Kort handlingstittel]**
Hvorfor: [1 setning om hvorfor dette er viktig]
Gjør dette: [Konkret, copy-paste-klar tekst eller instruksjon]

---PERSONAS---

**PERSONA 1: Skeptikeren**
Navn: [Typisk norsk navn]
Profil: [1 setning om hvem dette er - en skeptisk person fra målgruppen]

Min umiddelbare reaksjon:
[2-3 setninger]

Hva treffer meg:
[Hva appellerer, hvis noe]

Hva skurrer:
[Hva føles feil eller får meg til å scrolle videre]

Mitt forslag:
[Ett konkret forslag til forbedring fra dette perspektivet]

**PERSONA 2: Den travle**
Navn: [Typisk norsk navn]
Profil: [1 setning om hvem dette er - en travel person fra målgruppen som skanner raskt]

Min umiddelbare reaksjon:
[2-3 setninger]

Hva treffer meg:
[Hva appellerer, hvis noe]

Hva skurrer:
[Hva føles feil eller får meg til å scrolle videre]

Mitt forslag:
[Ett konkret forslag til forbedring fra dette perspektivet]

**PERSONA 3: Den prisbevisste**
Navn: [Typisk norsk navn]
Profil: [1 setning om hvem dette er - en prisbevisst person fra målgruppen]

Min umiddelbare reaksjon:
[2-3 setninger]

Hva treffer meg:
[Hva appellerer, hvis noe]

Hva skurrer:
[Hva føles feil eller får meg til å scrolle videre]

Mitt forslag:
[Ett konkret forslag til forbedring fra dette perspektivet]

---SCORING---

Oppmerksomhet: [1-10]/10
[1 setning begrunnelse - stopper dette scrolling?]

Relevans: [1-10]/10
[1 setning begrunnelse - treffer dette målgruppen?]

Klarhet: [1-10]/10
[1 setning begrunnelse - er budskapet tydelig?]

CTA-styrke: [1-10]/10
[1 setning begrunnelse - er handlingsoppfordringen overbevisende?]

Totalvurdering: [1-10]/10

---HOOKS---

Her er 7 alternative hooks/overskrifter du kan teste:

1. [Hook - kort, punchy]
2. [Hook - spørsmålsbasert]
3. [Hook - tall/statistikk]
4. [Hook - problem-fokusert]
5. [Hook - resultat-fokusert]
6. [Hook - nysgjerrighets-drevet]
7. [Hook - sosial bevis/FOMO]

---INNVENDINGER---

Her er innvendingene målgruppen sannsynligvis har:

**Innvending 1: "[Typisk innvending]"**
Slik kan du håndtere den i annonsen:
[Konkret forslag til tekst eller vinkling]

**Innvending 2: "[Typisk innvending]"**
Slik kan du håndtere den i annonsen:
[Konkret forslag til tekst eller vinkling]

**Innvending 3: "[Typisk innvending]"**
Slik kan du håndtere den i annonsen:
[Konkret forslag til tekst eller vinkling]

**Innvending 4: "[Typisk innvending]"**
Slik kan du håndtere den i annonsen:
[Konkret forslag til tekst eller vinkling]

---SLUTT---

VIKTIG:
- "Fiks dette først" skal være de 3 VIKTIGSTE endringene som vil ha størst effekt, prioritert etter impact
- "Gjør dette" skal være konkret og actionable - helst copy-paste-klart
- Snakk som ekte nordmenn ville snakket
- Vær spesifikk til denne annonsen, ikke generisk
- Alle hooks skal være klare til å copy-paste
- Innvendingene skal være realistiske for denne målgruppen`;

    const userContent = [];
    
    if (adImage) {
      const base64Data = adImage.split(',')[1];
      const mediaType = adImage.split(';')[0].split(':')[1];
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64Data
        }
      });
    }
    
    userContent.push({
      type: "text",
      text: `Her er annonseteksten jeg skal analysere:\n\n---\n${adText}\n---\n\nGi meg full analyse med prioritert handlingsliste, personas, scoring, hooks og innvendinger.`
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: "user", content: userContent }
        ],
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'API error' });
    }

    const data = await response.json();
    const feedbackText = data.content
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("\n");

    // Parse the response into sections
    const sections = {
      priorities: '',
      personas: '',
      scoring: '',
      hooks: '',
      objections: ''
    };

    if (feedbackText.includes('---FIKS-DETTE-FØRST---')) {
      const prioritiesMatch = feedbackText.match(/---FIKS-DETTE-FØRST---([\s\S]*?)---PERSONAS---/);
      if (prioritiesMatch) sections.priorities = prioritiesMatch[1].trim();
    }

    if (feedbackText.includes('---PERSONAS---')) {
      const personasMatch = feedbackText.match(/---PERSONAS---([\s\S]*?)---SCORING---/);
      if (personasMatch) sections.personas = personasMatch[1].trim();
    }

    if (feedbackText.includes('---SCORING---')) {
      const scoringMatch = feedbackText.match(/---SCORING---([\s\S]*?)---HOOKS---/);
      if (scoringMatch) sections.scoring = scoringMatch[1].trim();
    }

    if (feedbackText.includes('---HOOKS---')) {
      const hooksMatch = feedbackText.match(/---HOOKS---([\s\S]*?)---INNVENDINGER---/);
      if (hooksMatch) sections.hooks = hooksMatch[1].trim();
    }

    if (feedbackText.includes('---INNVENDINGER---')) {
      const objectionsMatch = feedbackText.match(/---INNVENDINGER---([\s\S]*?)---SLUTT---/);
      if (objectionsMatch) sections.objections = objectionsMatch[1].trim();
    }

    return res.status(200).json({ 
      sections,
      raw: feedbackText
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

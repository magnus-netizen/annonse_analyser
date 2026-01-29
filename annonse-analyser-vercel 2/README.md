# Annonse-Analyser (Vercel)

AI-drevet fokusgruppe for å teste annonser før lansering.

## Deploy til Vercel

### Steg 1: Opprett Vercel-konto
Gå til [vercel.com](https://vercel.com) og logg inn (kan bruke GitHub, GitLab, eller e-post).

### Steg 2: Deploy
1. Gå til [vercel.com/new](https://vercel.com/new)
2. Velg "Upload" (under "Import Git Repository")
3. Dra hele `annonse-analyser-vercel`-mappen inn, eller klikk for å velge mappen

### Steg 3: Legg til API-nøkkel
1. Etter deploy, gå til prosjektet ditt
2. Klikk på "Settings" → "Environment Variables"
3. Legg til:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Din API-nøkkel fra [console.anthropic.com](https://console.anthropic.com)
4. Klikk "Save"

### Steg 4: Redeploy
1. Gå til "Deployments"
2. Klikk på de tre prikkene (⋮) ved siste deployment
3. Velg "Redeploy"

## Ferdig!
Du får en URL som `ditt-prosjekt.vercel.app` som du kan dele.

## Hvorfor Vercel?
Vercel har 60 sekunders timeout på gratis tier (vs. Netlify's 10 sekunder), noe som gir nok tid for Claude API å svare.

## Mappestruktur
```
annonse-analyser-vercel/
├── index.html          # Frontend
├── vercel.json         # Vercel config (60 sek timeout)
├── README.md           # Denne filen
└── api/
    └── analyze.js      # Serverless function
```

# nodum.
> knowledge maps, made effortless.

A research paper knowledge mapping tool that visualises CSV data as interactive force-directed cluster graphs.

---

## running the frontend locally

### prerequisites

Make sure you have **Node.js** installed. Check with:
```bash
node -v
```
If not, download it from [nodejs.org](https://nodejs.org).

---

### setup

```bash
# 1. clone the repo
git clone https://github.com/your-username/nodum.git
cd nodum

# 2. install dependencies
npm install

# 3. install G6 graph library (v4)
npm install @antv/g6@4

# 4. start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

### project structure

```
nodum/
├── src/
│   ├── App.jsx        # main app — homepage + graph view
│   ├── main.jsx       # react entry point
│   └── index.css      # global styles (keep empty)
├── public/
└── package.json
```

---

### what's in the app right now

- **homepage** — nodum. title, tagline, and two entry points with an ambient drifting graph in the background
- **demo graph view** — 112 AI agent research papers visualised as a force-directed cluster graph, grouped by primary topic
- **sidebar** — group by selector and topic legend with filtering
- **tooltips** — hover any node to see paper title, topic, and keywords
- drag nodes around — they ease back to their cluster on release
- scroll to zoom, drag canvas to pan

---

### note on the demo data

The demo is hardcoded with a dataset of 112 papers from an AI agents evidence map. CSV upload flow is stubbed — full backend integration is not yet implemented.

---

### building for production

```bash
npm run build
```

Outputs a `dist/` folder ready to deploy to Netlify, Vercel, or GitHub Pages.

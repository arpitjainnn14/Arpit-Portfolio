// Every word in the book lives here. The 3D edition and the flat mobile
// edition both read from this file, so they can never drift apart.

export const meta = {
  name: 'Arpit Jain',
  role: 'Software Engineer & AI Systems',
  edition: 'portfolio · ed. 2026',
  title: 'Arpit Jain — Software Engineer & AI Systems',
}

export const intro = {
  eyebrow: 'arpit jain · software & ai engineer',
  line: ['Some people keep a blog.', 'I keep a shelf.'],
  sub: 'one book is mine',
}

export const cover = {
  edition: 'portfolio · ed. 2026',
  name: ['Arpit', 'Jain'],
  role: ['Software Engineer', '& AI Systems'],
  nudge: "click to open — it's not heavy",
}

export const about = {
  chapter: 'chapter one',
  portrait: '/photo.jpg',
  caption: ['fig. 1 — the author, mid-training-run,', 'pretending the loss curve is fine.'],
  heading: "Hello — I'm Arpit.",
  body: [
    'I build the unglamorous half of machine learning: pipelines that survive real data, APIs that stay up, and models that behave in production instead of only in the notebook.',
    'My favourite compliment is “huh, that was fast” — usually about an inference path that used to take four seconds.',
  ],
  facts: [
    { label: 'based in', value: 'India · remote-friendly' },
    { label: 'focus', value: 'Backend · ML systems' },
    { label: 'open to', value: 'Full-time roles' },
    { label: 'reply time', value: 'Faster than my CI' },
  ],
}

export const work = {
  chapter: 'chapter two — selected work',
  heading: "Three things I'm happy to be judged on.",
  image: '',
  imagePlaceholder: 'architecture',
  caption: 'fig. 2 — architecture, after the third rewrite.',
  items: [
    {
      n: '01',
      title: 'Diabetic Retinopathy Detection',
      body: 'A CNN trained on 35K+ fundus images across four severity classes — transfer learning on ResNet-50 with a custom head, and an eval split that never touched training.',
      meta: 'TensorFlow · ResNet-50 — 95.2% accuracy, 0.97 AUC',
    },
    {
      n: '02',
      title: 'TheraVox — voice therapy AI',
      body: 'Real-time speech therapy: Wav2Vec2 for phoneme detection, an NLP pipeline that finds mispronunciations, generates exercises, and tracks fluency over time.',
      meta: 'PyTorch · Wav2Vec2 — 500+ sessions, 89% fluency',
    },
    {
      n: '03',
      title: 'UPI fraud detection',
      body: 'An XGBoost + LightGBM ensemble scoring UPI transactions as they land. Synthetic fraud augmentation for the class imbalance, because 0.2% positives teach a model nothing.',
      meta: 'XGBoost · LightGBM — 97% precision, <50ms inference',
    },
  ],
}

export const toolkit = {
  chapter: 'chapter three — toolkit',
  heading: 'What I reach for',
  groups: [
    { label: 'languages', value: 'Python · SQL · JavaScript · a little C++ when it earns its keep' },
    { label: 'ml / ai', value: 'PyTorch · TensorFlow · Hugging Face · OpenCV · XGBoost · LightGBM · scikit-learn' },
    { label: 'shipping it', value: 'FastAPI · Docker · AWS · PostgreSQL · Git · the boring parts that keep it alive' },
  ],
  rule: 'Rule of thumb: boring technology, measured twice.',
}

export const method = {
  chapter: 'how I work',
  heading: 'Small diffs, honest metrics',
  points: [
    'Measure before optimising. The bottleneck is never where the meeting says it is.',
    'A held-out set you have looked at twice is not a held-out set any more.',
    'Ship behind a flag, watch the graph, then delete the flag.',
    "If it can't be evaluated, it isn't an AI feature — it's a demo.",
  ],
  footer: 'writing production code since 2025 · still sleeping fine',
}

export const experience = {
  chapter: 'chapter four — the receipts',
  heading: "How I've spent my keystrokes",
  items: [
    {
      period: 'dec 2025 — present',
      role: 'Software Development Engineer I',
      org: 'Hexalog · on-site',
      body: 'Backend services and the AI features sitting on top of them. Started as an intern in December 2025 and kept the desk.',
    },
    {
      period: '2024–25',
      role: 'Machine learning, on my own time',
      org: 'Personal projects',
      body: 'Three models trained end to end — retinopathy screening, speech therapy, fraud scoring. The three on the previous page.',
    },
    {
      period: '2022 — 2026',
      role: 'B.Tech, Computer Science',
      org: 'VIT Bhopal University',
      body: 'Final year. Distributed systems, databases, and everything I could find about neural networks.',
    },
  ],
}

export const education = {
  chapter: 'education',
  degree: {
    title: 'B.Tech, Computer Science & Engineering',
    org: 'VIT Bhopal University · 2022–2026',
    body: 'Distributed systems, databases, and a growing pile of models trained at 2am on a laptop that deserved better.',
  },
  alsoLabel: 'also on the record',
  also: [
    'Senior Secondary — MVN Aravali Hills, Faridabad',
    'Kaggle notebooks nobody asked for',
    'Occasional writer of very long postmortems',
  ],
  cvLabel: 'full cv',
  cvText: 'ArpitJain_Resume.pdf',
  cvHref: '/Resume/ArpitJain_DataScientist_Resume.pdf',
}

export const contact = {
  chapter: 'last page',
  heading: 'Thanks for flipping.',
  body: "If you're hiring for backend or ML systems work, I'd like to hear about it — even if the role is still a rough sketch.",
  links: [
    { label: 'email', text: 'jainarpit2004@gmail.com', href: 'mailto:jainarpit2004@gmail.com' },
    { label: 'github', text: 'github.com/arpitjainnn14', href: 'https://github.com/arpitjainnn14' },
    { label: 'linkedin', text: 'in/arpitjain2004', href: 'https://linkedin.com/in/arpitjain2004/' },
    { label: 'kaggle', text: 'kaggle.com/arpit14jain', href: 'https://kaggle.com/arpit14jain' },
  ],
  footer: 'the end · scroll back any time',
}

export const backCover = 'arpit jain · 2026'

// Spine titles printed on the named books sharing the shelf.
export const shelfTitles = {
  bottom: ['Hands-On Machine Learning', 'The Pragmatic Programmer'],
  middle: ['Designing Data-Intensive Applications', 'Deep Learning'],
  top: ['Pattern Recognition and ML', 'The Mythical Man-Month'],
}

// Page order in the book: index i of this array is face i in the 3D build.
// The trailing 'closed' step isn't a page — it's the book shutting and going
// back on the shelf after the last one.
export const SLUGS = ['cover', 'about', 'work', 'toolkit', 'experience', 'contact', 'closed']
export const LABELS = ['Cover', 'About', 'Selected work', 'Toolkit', 'Experience', 'Contact', 'The end']
export const SHEETS = 5

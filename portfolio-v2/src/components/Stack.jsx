import { useScrollReveal } from '../lib/useScrollReveal'

const STACK = [
  'Python',
  'PyTorch',
  'TensorFlow',
  'OpenCV',
  'Hugging Face',
  'XGBoost',
  'FastAPI',
  'AWS',
  'Docker',
  'PostgreSQL',
]

export default function Stack() {
  const revealRef = useScrollReveal()

  return (
    <section id="stack" className="max-w-[1180px] mx-auto px-6 md:px-11 pb-24" style={{ scrollMarginTop: 80 }}>
      <div className="flex justify-between text-[10px] tracking-[.16em] uppercase text-ink/40 pb-8 border-b border-ink/[0.14]">
        <span>Stack</span>
        <span>{String(STACK.length).padStart(2, '0')}</span>
      </div>
      <div ref={revealRef} className="flex flex-wrap gap-2.5 pt-9">
        {STACK.map((item) => (
          <span
            key={item}
            className="px-5 py-[11px] rounded-full border border-ink/[0.18] text-[13px] transition-colors duration-300 hover:bg-ink hover:text-cream hover:border-ink"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

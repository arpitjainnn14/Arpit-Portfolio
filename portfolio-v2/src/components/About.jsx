import { useEffect, useRef } from 'react'
import { GithubIcon, LinkedinIcon } from './SocialIcons'
import { useScrollReveal } from '../lib/useScrollReveal'

const experience = [
  { role: 'Software Development Engineer I', company: 'Hexalog', period: 'Present', current: true },
  { role: 'Software Development Intern', company: 'Hexalog', period: '6 months', current: false },
]

const education = [
  { degree: 'B.Tech, Computer Science & Engineering', institution: 'VIT Bhopal University', period: '2022 – 2026', current: true },
  { degree: 'Senior Secondary (XII)', institution: 'MVN Aravali Hills, Faridabad', period: '2021 – 2022', current: false },
  { degree: 'Secondary (X)', institution: 'DPSG, Faridabad', period: '2019 – 2020', current: false },
]

function Timeline({ items }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rows = Array.from(el.querySelectorAll('[data-tl]'))
    rows.forEach((r) => {
      r.style.opacity = '0.2'
      r.style.transition = 'opacity .5s ease'
    })
    const timers = []
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            rows.forEach((r, i) => {
              timers.push(setTimeout(() => { r.style.opacity = '1' }, 160 + i * 220))
            })
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div ref={ref} className="relative pl-6">
      <div className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-ink/[0.14]" />
      {items.map((item, i) => (
        <div key={item.degree || item.role} data-tl className={`relative ${i === items.length - 1 ? '' : 'pb-6'}`}>
          <span
            className={`absolute -left-6 top-[5px] w-1.5 h-1.5 rounded-full ${item.current ? 'bg-rust' : 'bg-ink/[0.22]'}`}
          />
          <div className={`font-display font-medium text-[15px] leading-[1.4] ${item.current ? '' : 'text-ink/70'}`}>
            {item.role || item.degree}
          </div>
          <div className="text-xs leading-[1.6] text-ink/[0.48] mt-1">
            {item.company || item.institution} · {item.period}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function About() {
  const photoRef = useScrollReveal()
  const copyRef = useScrollReveal()

  return (
    <section id="about" className="max-w-[1180px] mx-auto px-6 md:px-11 pb-24" style={{ scrollMarginTop: 80 }}>
      <div className="text-[10px] tracking-[.16em] uppercase text-ink/40 pb-8 border-b border-ink/[0.14]">
        About
      </div>
      <div className="grid md:grid-cols-[220px_1fr] gap-14 pt-12 items-start">
        <div ref={photoRef} className="flex flex-col gap-5">
          <div className="w-[180px] h-[180px] rounded-full overflow-hidden bg-[#E6E2D8] shadow-[inset_0_0_0_1px_rgba(22,19,15,0.1)]">
            <img src="/photo.jpg" alt="Arpit Jain" className="w-full h-full object-cover block" />
          </div>
          <div className="flex gap-4 text-xs text-ink/45">
            <a href="https://github.com/arpitjainnn14" target="_blank" rel="noreferrer" aria-label="GitHub profile" className="no-underline transition-colors hover:text-ink flex items-center gap-1.5">
              <GithubIcon size={16} /> GitHub
            </a>
            <a href="https://linkedin.com/in/arpitjain2004/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile" className="no-underline transition-colors hover:text-ink flex items-center gap-1.5">
              <LinkedinIcon size={16} /> LinkedIn
            </a>
            <a href="https://kaggle.com/arpit14jain" target="_blank" rel="noreferrer" className="no-underline transition-colors hover:text-ink">
              Kaggle
            </a>
          </div>
        </div>

        <div ref={copyRef}>
          <h2 className="m-0 mb-5 font-serif text-[clamp(32px,4vw,46px)] leading-[1.12] tracking-tight">
            I write the code, run the experiments,
            <br />
            <em className="italic text-rust">and ship the model.</em>
          </h2>
          <p className="m-0 mb-11 text-sm leading-[1.85] text-ink/60 max-w-[600px]">
            SDE-I at Hexalog, on backend systems and AI engineering. Final-year B.Tech CSE
            at VIT Bhopal. My work spans end-to-end ML pipelines — raw data, model training,
            production APIs. I care about systems that run, not notebooks that validate.
          </p>

          <div className="text-[10px] tracking-[.16em] uppercase text-ink/[0.38] mb-5">Experience</div>
          <div className="mb-12">
            <Timeline items={experience} />
          </div>

          <div className="text-[10px] tracking-[.16em] uppercase text-ink/[0.38] mb-5">Education</div>
          <Timeline items={education} />
        </div>
      </div>
    </section>
  )
}

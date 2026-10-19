import { projects } from '../data/projects'
import { useScrollReveal } from '../lib/useScrollReveal'

function ProjectRow({ project, index }) {
  const revealRef = useScrollReveal()
  const isLast = index === projects.length - 1

  return (
    <a
      ref={revealRef}
      href={project.github}
      target="_blank"
      rel="noreferrer"
      className={`proj-row grid grid-cols-[56px_1fr_280px_30px] gap-6 items-center py-8 border-t border-ink/[0.14] no-underline text-ink transition-[padding-left,background] duration-[.35s] hover:pl-[18px] hover:bg-rust/[0.06] ${
        isLast ? 'border-b' : ''
      }`}
    >
      <span className="text-[11px] text-ink/40">{project.id}</span>
      <span>
        <span className="block font-serif text-[clamp(26px,3.2vw,38px)] leading-[1.05]">
          {project.title}
        </span>
        <span className="block mt-2.5 text-xs leading-[1.7] text-ink/50 max-w-[520px]">
          {project.description}
        </span>
        <span className="flex flex-wrap gap-1.5 mt-3.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 border border-ink/[0.16] rounded-[3px] text-[10px] text-ink/50"
            >
              {tag}
            </span>
          ))}
        </span>
      </span>
      <span className="proj-meta text-xs leading-[1.9] text-ink/50">
        {project.metrics.map((metric) => (
          <span key={metric} className="block">
            {metric}
          </span>
        ))}
      </span>
      <span className="proj-arrow font-serif text-xl text-rust text-right">↗</span>
    </a>
  )
}

export default function Projects() {
  return (
    <section id="work" className="max-w-[1180px] mx-auto px-6 md:px-11 pb-24" style={{ scrollMarginTop: 80 }}>
      <div className="flex justify-between text-[10px] tracking-[.16em] uppercase text-ink/40 py-8">
        <span>Selected Work</span>
        <span>{String(projects.length).padStart(2, '0')}</span>
      </div>

      {projects.map((project, i) => (
        <ProjectRow key={project.id} project={project} index={i} />
      ))}
    </section>
  )
}

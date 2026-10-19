import { useState } from 'react'
import { GithubIcon, LinkedinIcon } from './SocialIcons'
import { useScrollReveal } from '../lib/useScrollReveal'
import { useMagnetic } from '../lib/useMagnetic'

const fieldClass =
  'bg-transparent border-0 border-b border-cream/[0.22] text-cream text-[15px] py-2.5 outline-none transition-colors duration-300 focus:border-coral placeholder:text-cream/30'

export default function Contact() {
  const copyRef = useScrollReveal()
  const formRef = useScrollReveal()
  const submitRef = useMagnetic()
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (pending) return
    setPending(true)
    try {
      await fetch('https://getform.io/f/bllzmpkb', {
        method: 'POST',
        body: new FormData(e.target),
        headers: { Accept: 'application/json' },
      })
    } catch {
      // getform being unreachable shouldn't block the UI — the message
      // may still not have sent, but there's no local fallback to retry into.
    } finally {
      setPending(false)
      setSent(true)
    }
  }

  return (
    <section id="contact" className="bg-ink text-cream" style={{ scrollMarginTop: 80 }}>
      <div className="max-w-[1180px] mx-auto px-6 md:px-11 py-24 grid md:grid-cols-2 gap-[72px] items-start">
        <div ref={copyRef}>
          <div className="text-[10px] tracking-[.16em] uppercase text-cream/40 mb-6">Contact</div>
          <h2 className="m-0 mb-5 font-serif text-[clamp(38px,5vw,58px)] leading-[1.05] tracking-tight">
            Let&apos;s build
            <br />
            <em className="italic text-coral">something.</em>
          </h2>
          <p className="m-0 mb-8 text-sm leading-[1.8] text-cream/55 max-w-[400px]">
            Open to full-time roles from 2026. Happy to talk about ML systems, backend
            work, or anything half-finished on my GitHub.
          </p>
          <div className="flex flex-col gap-3 text-[13px]">
            <a
              href="mailto:jainarpit2004@gmail.com"
              className="text-cream no-underline border-b border-cream/25 pb-1 w-fit transition-colors duration-200 hover:text-coral hover:border-coral"
            >
              jainarpit2004@gmail.com
            </a>
            {/*
              TODO: once you have a Calendly link, uncomment and fill in the href:
              <a
                href="https://calendly.com/your-username"
                target="_blank"
                rel="noreferrer"
                className="text-cream no-underline border-b border-cream/25 pb-1 w-fit transition-colors duration-200 hover:text-coral hover:border-coral"
              >
                Book a call
              </a>
            */}
            <div className="flex gap-4 text-cream/45 mt-2">
              <a href="https://github.com/arpitjainnn14" target="_blank" rel="noreferrer" className="text-inherit no-underline transition-colors duration-200 hover:text-coral flex items-center gap-1.5">
                <GithubIcon size={15} /> GitHub
              </a>
              <a href="https://linkedin.com/in/arpitjain2004/" target="_blank" rel="noreferrer" className="text-inherit no-underline transition-colors duration-200 hover:text-coral flex items-center gap-1.5">
                <LinkedinIcon size={15} /> LinkedIn
              </a>
              <a href="https://kaggle.com/arpit14jain" target="_blank" rel="noreferrer" className="text-inherit no-underline transition-colors duration-200 hover:text-coral">
                Kaggle
              </a>
            </div>
          </div>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[.14em] uppercase text-cream/40">Name</span>
            <input name="name" required placeholder="Your name" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[.14em] uppercase text-cream/40">Email</span>
            <input name="email" type="email" required placeholder="you@company.com" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[.14em] uppercase text-cream/40">Message</span>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="What are you working on?"
              className={`${fieldClass} resize-y leading-[1.6]`}
            />
          </label>
          <button
            ref={submitRef}
            type="submit"
            disabled={pending}
            className="self-start px-[30px] py-[15px] rounded-full bg-cream text-ink text-xs font-medium tracking-[.1em] uppercase transition-colors duration-200 hover:bg-coral disabled:opacity-60"
          >
            {sent ? 'Sent ✓' : pending ? 'Sending…' : 'Send message'}
          </button>
          {sent && <span className="text-xs text-coral">Thanks — I&apos;ll get back to you.</span>}
        </form>
      </div>

      <div className="border-t border-cream/10">
        <div className="max-w-[1180px] mx-auto px-6 md:px-11 py-6 flex justify-between text-[10px] tracking-[.1em] uppercase text-cream/30">
          <span>Arpit Jain — 2026</span>
          <a href="#top" className="text-inherit no-underline transition-colors duration-200 hover:text-coral">
            Back to top ↑
          </a>
        </div>
      </div>
    </section>
  )
}

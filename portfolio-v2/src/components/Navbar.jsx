const LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
]

export default function Navbar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 border-b border-ink/[0.09]"
      style={{ backdropFilter: 'blur(14px)', background: 'rgba(242,239,231,.78)' }}
    >
      <div className="max-w-[1180px] mx-auto px-6 md:px-11 py-[18px] flex items-center justify-between">
        <a href="#top" className="font-serif text-[19px] leading-none tracking-tight no-underline">
          Arpit Jain
        </a>
        <div className="flex gap-6 text-[10px] tracking-[.14em] uppercase text-ink/50">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="no-underline transition-colors duration-200 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" className="no-underline text-rust">
            Contact
          </a>
        </div>
      </div>
    </div>
  )
}

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <div className="mb-10 flex flex-col gap-2 sm:mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{subtitle}</span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
        </div>
      </Reveal>
      {children}
    </section>
  );
}

export function Chip({ children, active, onClick, color }: { children: ReactNode; active?: boolean; onClick?: () => void; color?: string }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
        active ? "border-transparent bg-fg text-bg" : "border-line bg-card text-muted hover:text-fg"
      } ${onClick ? "cursor-pointer" : ""}`}
      style={color && !active ? { borderColor: `${color}55`, color } : undefined}
    >
      {children}
    </Tag>
  );
}

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="glass relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-bg-soft sm:rounded-3xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50"
            >
              <X size={16} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Generated cover art for items that have no image: gradient + emoji, tinted by category colour. */
export function Cover({ color, emoji, image, className = "" }: { color: string; emoji: string; image?: string; className?: string }) {
  if (image) return <img src={image} alt="" loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 30% 20%, color-mix(in srgb, ${color} 40%, transparent), transparent 60%), linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), var(--bg-soft))`,
      }}
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-30 blur-2xl" style={{ background: color }} />
      <span className="relative text-5xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">{emoji}</span>
    </div>
  );
}

export function Avatar({ name, src, size = 112 }: { name: string; src?: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="relative shrink-0 rounded-full p-[3px] bg-gradient" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-bg font-display font-bold" style={{ fontSize: size / 2.6 }}>
          <span className="text-gradient">{initials}</span>
        </div>
      )}
    </div>
  );
}

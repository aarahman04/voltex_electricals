import { AnimatePresence, motion } from "framer-motion";

// Bottom-right, one amber stripe down the side, announced to screen readers,
// gone on its own after a few seconds.
export default function Toast({ notice, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-end p-4 sm:p-6">
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.id}
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex max-w-sm items-start gap-4 rounded-[10px] border border-seam border-l-2 border-l-amber bg-surface px-4 py-3.5 shadow-[0_24px_60px_-24px_rgba(19,26,36,0.35)]"
          >
            <div className="flex-1">
              <p className="spec text-amber">Heads up</p>
              <p className="mt-1 text-sm leading-snug text-ink">{notice.message}</p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center text-lg text-ink-muted transition-colors hover:text-ink"
            >
              <span aria-hidden="true">×</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { faqs, type FaqItem as Faq } from '@/config/faq'
import { site } from '@/config/site'
import { SectionHeading } from './ui/SectionHeading'
import { Reveal } from './ui/Reveal'
import { PlusIcon } from './ui/icons'

/**
 * SECTION 8 — Questions, after the reviews. Also used on each product page
 * with that product's own selection (faqsForProduct).
 * Native <details>, so keyboard and find-in-page behaviour are the browser's;
 * each answer slides open and closed (see FaqItem).
 */
export function FaqSection({ items = faqs, id = 'faq' }: { items?: Faq[]; id?: string }) {
  useEffect(() => {
    const schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    })
    document.head.appendChild(schema)
    return () => schema.remove()
  }, [items])

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="container-page scroll-mt-24 py-20 sm:py-28">
      {/* Heading centred above the questions; the list is a centred column. */}
      <div className="mx-auto flex max-w-[56rem] flex-col gap-12">
        <div className="text-center">
          <SectionHeading id={`${id}-heading`} title="Questions." intro="The things people ask before their first pour." />
          <p className="mt-6 text-[1.05rem]">
            Anything else?{' '}
            <a href={`mailto:${site.email}`} className="link-underline font-bold">
              Email us
            </a>
            .
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={item.question}>
              <Reveal delay={Math.min(index, 4) * 0.04}>
                <FaqItem question={item.question} answer={item.answer} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/**
 * One question. A plain <details> snaps open and shut, so the click is taken
 * over: opening sets `open` and grows the answer from nothing to its height;
 * closing shrinks it first and only then drops `open`. A click mid-way turns
 * the animation round from wherever it has got to. The look (plus turning to
 * a cross, the Vanilla ground) follows `shown`, so it flips the moment you
 * click rather than when the animation ends.
 */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<Animation | null>(null)
  const [shown, setShown] = useState(false)

  const toggle = (event: MouseEvent) => {
    const details = detailsRef.current
    const body = bodyRef.current
    if (!details || !body) return
    event.preventDefault()

    const opening = !shown
    setShown(opening)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !body.animate) {
      details.open = opening
      return
    }

    // Start from wherever the answer is right now (mid-animation included).
    const from = details.open ? body.getBoundingClientRect().height : 0
    animationRef.current?.cancel()
    details.open = true
    const to = opening ? body.scrollHeight : 0

    const animation = body.animate(
      [
        { height: `${from}px`, opacity: opening ? 0.2 : 1 },
        { height: `${to}px`, opacity: opening ? 1 : 0 },
      ],
      {
        duration: opening ? 420 : 320,
        easing: opening ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    )
    animationRef.current = animation
    animation.onfinish = () => {
      animationRef.current = null
      if (!opening) details.open = false
    }
  }

  return (
    <details
      ref={detailsRef}
      data-shown={shown}
      // Find-in-page (or anything else) opening it directly keeps the look in step.
      onToggle={(event) => {
        if (!animationRef.current) setShown(event.currentTarget.open)
      }}
      className="group kv-grain ground-paper rounded-md border-2 border-ink transition-[background-color] duration-300 data-[shown=true]:[--surface:var(--color-vanilla)]"
    >
      <summary
        onClick={toggle}
        // A quick double tap to open and close shouldn't select the question or
        // the answer: the question can't be selected, and a second (or third)
        // press in a row doesn't start a selection. The answer itself can still
        // be selected by dragging across it.
        onMouseDown={(event) => {
          if (event.detail > 1) event.preventDefault()
        }}
        className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 select-none [-webkit-tap-highlight-color:transparent] sm:px-6 [&::-webkit-details-marker]:hidden"
      >
        <span className="flex-1 font-display text-[1.45rem] leading-tight sm:text-[1.7rem]">{question}</span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink transition-transform duration-300 ease-[var(--ease-bounce)] group-data-[shown=true]:rotate-45">
          <PlusIcon className="size-5" />
        </span>
      </summary>
      <div ref={bodyRef} className="overflow-hidden">
        <p className="max-w-[60ch] px-5 pb-6 text-[1.05rem] leading-relaxed sm:px-6">{answer}</p>
      </div>
    </details>
  )
}

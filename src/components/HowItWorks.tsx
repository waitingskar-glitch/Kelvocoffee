import { useLayoutEffect, useRef, useState } from 'react'
import { createDrawable, createScope, createTimeline, onScroll, animate, stagger } from 'animejs'
import { useSectionNav } from '@/hooks/useSectionNav'
import { PourSequence } from './PourSequence'
import { SectionHeading } from './ui/SectionHeading'
import { cn } from '@/lib/cn'

const steps = [
  {
    title: 'Pour',
    copy: 'A little concentrate into your cup. No filter, no waiting for the decoction to drip.',
  },
  {
    title: 'Mix',
    copy: 'Top up with hot milk, hot water, or cold milk over ice. You decide how strong it goes.',
  },
  {
    title: 'Drink',
    copy: 'That is the whole thing. Same cup you know, in whichever flavour you reached for.',
  },
] as const

const servingSuggestions = [
  { label: 'Hot filter coffee', detail: 'Concentrate + hot milk' },
  { label: 'Iced coffee', detail: 'Concentrate + cold milk + ice' },
  { label: 'Black', detail: 'Concentrate + hot water' },
] as const

/** Timeline positions (ms) where each step takes over while scrubbing. */
const STEP_AT = [0, 1500, 2650] as const

/**
 * SECTION 3 — The Kelvo experience.
 *
 * The dark panel locks to the screen as its top reaches the header, and the
 * brewing illustration is scrubbed by scroll while it is held — half a
 * viewport of scrolling — before the page carries on. Scrolling back up plays
 * it in reverse. Reduced motion skips the lock and shows the finished cup.
 *
 * The scene is tilted in 3D while it plays and swings round to face the reader
 * as the cup is finished; its three depth layers shift against each other.
 */
export function HowItWorks() {
  const scrollTo = useSectionNav()
  const stageRef = useRef<HTMLDivElement | null>(null)
  const runwayRef = useRef<HTMLDivElement | null>(null)
  // Read once: it decides whether the lock exists at all.
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  // null = every step lit: before the sequence runs, and once it has finished.
  const [activeStep, setActiveStep] = useState<number | null>(null)

  // Layout effect, not effect: it runs before the browser paints, so a page
  // that loads already scrolled to this section never flashes the finished
  // drawing for a frame before the strokes are reset.
  useLayoutEffect(() => {
    const runway = runwayRef.current
    const panel = stageRef.current
    if (!runway || !panel) return

    // The fixed header's height, read live from its design token.
    const headerHeight = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spacing-header')) || 0

    let lastStep: number | null = null

    // A scope ties every animation, drawable and observer to this component,
    // so a single revert() cleans up on unmount (and on StrictMode re-runs).
    const scope = createScope({ root: stageRef }).add(() => {
      const cupLines = createDrawable('.kv-cup-line', 0, 0)
      const pouchLines = createDrawable('.kv-pouch-line', 0, 0)
      const jugLines = createDrawable('.kv-jug-line', 0, 0)
      const brewStream = createDrawable('.kv-stream-brew', 0, 0)
      const milkStream = createDrawable('.kv-stream-milk', 0, 0)
      const swirl = createDrawable('.kv-swirl-line', 0, 0)
      const steam = createDrawable('.kv-steam', 0, 0)

      // Steam breathes gently once the cup is finished, and stops if the
      // reader scrolls back into the sequence.
      const idleSteam = animate('.kv-steam', {
        translateY: [0, -6],
        opacity: [0.75, 0.3],
        duration: 1800,
        ease: 'inOutSine',
        loop: true,
        alternate: true,
        delay: stagger(280),
        autoplay: false,
      })

      const tl = createTimeline({
        autoplay: reducedMotion
          ? false
          : onScroll({
              target: runway,
              // Starts as the panel locks: its top meeting the header's bottom
              // edge. The fixed header covers the top of the viewport, so that
              // is where the section visibly reaches the top.
              enter: () => ({ target: 'top', container: headerHeight() }),
              // Finishes as the lock releases, half a viewport of scroll later.
              // If the panel is taller than the space under the header (the
              // step list on a phone), sticky lets go that much sooner, so the
              // end point moves up by the same amount.
              leave: () => {
                const room = window.innerHeight - headerHeight()
                const overflow = Math.max(0, panel.getBoundingClientRect().height - room)
                return { target: 'bottom', container: window.innerHeight + overflow }
              },
              // Light smoothing, so wheel steps glide instead of jumping.
              sync: 0.35,
            }),
        // Derived from position rather than fired once, so the highlight is
        // right whichever way the reader is scrolling.
        onUpdate: (self) => {
          const done = self.progress >= 0.999
          const time = self.currentTime
          const step = time <= 0 || done ? null : time < STEP_AT[1] ? 0 : time < STEP_AT[2] ? 1 : 2
          if (step !== lastStep) {
            lastStep = step
            setActiveStep(step)
          }
          if (reducedMotion) return
          if (done && idleSteam.paused) {
            idleSteam.play()
          } else if (!done && !idleSteam.paused) {
            idleSteam.pause()
            idleSteam.seek(0)
          }
        },
      })

      tl
        // Depth — the scene starts turned away and swings round to face you.
        .add('.kv-scene', { rotateX: [16, 6], rotateY: [-16, 9], scale: [0.92, 0.97], duration: 2000, ease: 'inOutSine' }, 0)
        .add('.kv-scene', { rotateX: [6, 0], rotateY: [9, 0], scale: [0.97, 1], duration: 1900, ease: 'inOutSine' }, 2000)
        .add('.kv-floor-shadow', { scaleX: [0.8, 1], opacity: [0.12, 0.32], duration: 3900, ease: 'inOutSine' }, 0)

        // [1] Pour — cup draws in, pouch appears and tips, the brew goes in.
        .add(cupLines, { draw: ['0 0', '0 1'], duration: 650, ease: 'inOutSine', delay: stagger(70) }, 0)
        .add('.kv-pouch', { opacity: [0, 1], duration: 350, ease: 'outQuad' }, 120)
        .add(pouchLines, { draw: ['0 0', '0 1'], duration: 700, ease: 'inOutSine', delay: stagger(50) }, 120)
        .add('.kv-pouch', { rotate: [0, -18], duration: 450, ease: 'outQuart' }, 560)
        .add(brewStream, { draw: ['0 0', '0 1'], duration: 320, ease: 'inQuad' }, 780)
        .add('.kv-liquid', { scaleY: [0, 0.42], duration: 650, ease: 'outCubic' }, 950)
        .add(brewStream, { draw: ['0 1', '1 1'], duration: 260, ease: 'inQuad' }, 1320)
        .add('.kv-pouch', { opacity: [1, 0], rotate: [-18, 0], duration: 380, ease: 'inQuad' }, 1360)

        // [2] Mix — the jug slides in, milk tops the cup up and lightens it.
        .add('.kv-jug', { opacity: [0, 1], translateX: [16, 0], duration: 420, ease: 'outQuart' }, 1500)
        .add(jugLines, { draw: ['0 0', '0 1'], duration: 520, ease: 'inOutSine', delay: stagger(50) }, 1500)
        .add(milkStream, { draw: ['0 0', '0 1'], duration: 300, ease: 'inQuad' }, 1850)
        .add('.kv-liquid', { scaleY: [0.42, 0.9], duration: 720, ease: 'outCubic' }, 1980)
        .add('.kv-milk-tint', { opacity: [0, 0.3], duration: 720, ease: 'outCubic' }, 1980)
        .add(swirl, { draw: ['0 0', '0 1'], duration: 420, ease: 'outSine' }, 2000)
        .add('.kv-swirl', { rotate: [0, 300], duration: 950, ease: 'inOutSine' }, 2000)
        .add(milkStream, { draw: ['0 1', '1 1'], duration: 260, ease: 'inQuad' }, 2450)
        .add('.kv-jug', { opacity: [1, 0], translateX: [0, 10], duration: 360, ease: 'inQuad' }, 2500)
        .add(swirl, { draw: ['0 1', '1 1'], duration: 320, ease: 'inQuad' }, 2650)

        // [3] Drink — steam rises.
        .add(steam, { draw: ['0 0', '0 1'], duration: 900, ease: 'outSine', delay: stagger(150) }, 2700)

        // The progress rule tracks scroll progress through the whole sequence.
        .add('.kv-progress', { scaleX: [0, 1], duration: 3900, ease: 'linear' }, 0)

      // Reduced motion: the finished cup, facing forward, with nothing moving.
      if (reducedMotion) tl.seek(tl.duration)
    })

    return () => scope.revert()
  }, [reducedMotion])

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="scroll-mt-20 border-t border-[var(--rule)] bg-cream-deep"
    >
      <div className="container-page pt-16 sm:pt-20 lg:pt-24">
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title="Coffee, without the coffee routine."
          description="Filter coffee usually asks for a bit of planning. This asks for a cup."
        />
      </div>

      {/* Runway: the panel, plus half a viewport of scroll for it to hold. */}
      <div ref={runwayRef} className="mt-12 sm:mt-16">
        <div
          ref={stageRef}
          className={cn(
            'bg-espresso',
            !reducedMotion &&
              'sticky top-[var(--spacing-header)] flex min-h-[calc(100svh-var(--spacing-header))] items-center',
          )}
        >
          <div className="container-page w-full py-14 sm:py-16 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* The cup leads on mobile: the trigger fires when the stage's top
                  reaches mid-screen, so the illustration has to be at that top. */}
              <div className="mx-auto w-full max-w-[16rem] sm:max-w-[20rem] lg:max-w-[26rem]">
                {/* Perspective sits on the scene's direct parent, where it applies. */}
                <div className="aspect-[320/360] w-full" style={{ perspective: '900px' }}>
                  <PourSequence />
                </div>
              </div>

              <ol>
                {steps.map((step, index) => {
                  const isActive = activeStep === null || activeStep === index
                  return (
                    <li key={step.title} className="border-t border-[var(--rule-dark)] last:border-b">
                      <div
                        className={cn(
                          'flex items-baseline gap-5 py-5 transition-opacity duration-500 ease-[var(--ease-out-soft)] sm:py-7',
                          isActive ? 'opacity-100' : 'opacity-35',
                        )}
                      >
                        <span
                          className={cn(
                            'index-mark label shrink-0 transition-colors duration-500',
                            activeStep === index ? 'text-caramel-soft' : 'text-cream/60',
                          )}
                          aria-hidden="true"
                        >
                          [{index + 1}]
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-display text-[1.9rem] leading-none text-cream sm:text-[2.4rem]">
                            {step.title}
                          </h3>
                          <p className="mt-3 max-w-[36ch] text-[0.9rem] leading-relaxed text-muted-dark">
                            {step.copy}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}

                <li aria-hidden="true" className="mt-6 h-px w-full bg-[var(--rule-dark)]">
                  <div
                    className="kv-progress h-px w-full bg-caramel-soft"
                    style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
                  />
                </li>
              </ol>
            </div>
          </div>
        </div>
        {!reducedMotion && <div aria-hidden="true" className="h-[50svh]" />}
      </div>

      <div className="container-page pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pb-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="label text-caramel">Three ways people drink it</p>
            <ul className="mt-6 flex flex-col gap-px bg-[var(--rule)] sm:flex-row">
              {servingSuggestions.map((suggestion) => (
                <li key={suggestion.label} className="flex-1 bg-cream-deep py-4 sm:px-6">
                  <span className="block font-display text-[1.1rem] text-espresso">{suggestion.label}</span>
                  <span className="mt-1 block text-[0.8rem] text-muted">{suggestion.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => scrollTo('#shop')}
            className="link-underline label shrink-0 self-start text-espresso lg:mt-10"
          >
            Find your flavour
          </button>
        </div>
      </div>
    </section>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import type { Scope } from 'animejs'
import { brand } from '@/config/brand'
import { PourSequence } from './PourSequence'
import { cn } from '@/lib/cn'

/** Timeline positions (ms) where each step takes over while scrubbing. */
const STEP_AT = [0, 1500, 2650] as const
const TOTAL = 3900

/**
 * SECTION 6 — How to Kelvo.
 *
 * Built like the pack's back panel: one ground, the three steps in the book's
 * exact words. The panel locks to the screen as its top reaches the header,
 * the illustration is scrubbed by scroll across half a viewport, then the page
 * carries on; scrolling back plays it in reverse. The scene is tilted in 3D
 * and swings round to face the reader as the cup is finished.
 *
 * The active step is marked with a Paper card rather than by dimming the
 * others: the book never allows ink below full opacity.
 */
export function HowItWorks() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const runwayRef = useRef<HTMLDivElement | null>(null)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  // null = no step singled out: before the sequence runs, and once it's done.
  const [activeStep, setActiveStep] = useState<number | null>(null)

  useLayoutEffect(() => {
    const runway = runwayRef.current
    const panel = stageRef.current
    if (!runway || !panel) return

    const headerHeight = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spacing-header')) || 0

    let lastStep: number | null = null
    let scope: Scope | null = null
    let cancelled = false

    // anime.js is loaded on demand: this section sits far below the fold, so
    // the library stays off the page's critical path.
    void import('animejs').then(({ createDrawable, createScope, createTimeline, onScroll, stagger }) => {
      if (cancelled) return
      scope = createScope({ root: stageRef }).add(() => {
        const cupLines = createDrawable('.kv-cup-line', 0, 0)
        const pouchLines = createDrawable('.kv-pouch-line', 0, 0)
        const jugLines = createDrawable('.kv-jug-line', 0, 0)
        const brewStream = createDrawable('.kv-stream-brew', 0, 0)
        const milkStream = createDrawable('.kv-stream-milk', 0, 0)
        const swirl = createDrawable('.kv-swirl-line', 0, 0)

        const tl = createTimeline({
          autoplay: reducedMotion
            ? false
            : onScroll({
                target: runway,
                // Starts as the panel locks under the fixed header.
                enter: () => ({ target: 'top', container: headerHeight() }),
                // Finishes as the lock releases. A panel taller than the room
                // under the header lets go sooner, so the end moves up with it.
                leave: () => {
                  const room = window.innerHeight - headerHeight()
                  const overflow = Math.max(0, panel.getBoundingClientRect().height - room)
                  return { target: 'bottom', container: window.innerHeight + overflow }
                },
                sync: 0.35,
              }),
          onUpdate: (self) => {
            const done = self.progress >= 0.999
            const time = self.currentTime
            const step = time <= 0 || done ? null : time < STEP_AT[1] ? 0 : time < STEP_AT[2] ? 1 : 2
            if (step !== lastStep) {
              lastStep = step
              setActiveStep(step)
            }
          },
        })

        tl
          // Depth: turned away at first, facing you by the end.
          .add(
            '.kv-scene',
            { rotateX: [16, 6], rotateY: [-16, 9], scale: [0.92, 0.97], duration: 2000, ease: 'inOutSine' },
            0,
          )
          .add(
            '.kv-scene',
            { rotateX: [6, 0], rotateY: [9, 0], scale: [0.97, 1], duration: 1900, ease: 'inOutSine' },
            2000,
          )
          .add('.kv-floor-shadow', { scaleX: [0.8, 1], opacity: [0.12, 0.3], duration: TOTAL, ease: 'inOutSine' }, 0)

          // [1] Pour — Add 10 ml Kelvo.
          .add(cupLines, { draw: ['0 0', '0 1'], duration: 650, ease: 'inOutSine', delay: stagger(70) }, 0)
          .add('.kv-pouch', { opacity: [0, 1], duration: 350, ease: 'outQuad' }, 120)
          .add(pouchLines, { draw: ['0 0', '0 1'], duration: 700, ease: 'inOutSine', delay: stagger(50) }, 120)
          .add('.kv-pouch', { rotate: [0, -20], duration: 450, ease: 'outQuart' }, 560)
          .add('.kv-label-10', { opacity: [0, 1], translateY: [6, 0], duration: 300, ease: 'outQuad' }, 780)
          .add(brewStream, { draw: ['0 0', '0 1'], duration: 320, ease: 'inQuad' }, 780)
          .add('.kv-liquid', { scaleY: [0, 0.3], duration: 650, ease: 'outCubic' }, 950)
          .add(
            '.kv-plip-brew',
            {
              opacity: [0, 1, 0],
              translateY: [0, -16],
              translateX: stagger(8, { start: -8 }),
              duration: 420,
              ease: 'outQuad',
            },
            960,
          )
          // The splash is flung out behind the glass as the first drop lands.
          .add(
            '.kv-splash',
            { opacity: [0, 1], scale: [0.55, 1], rotate: [-6, 0], duration: 700, ease: 'outBack(1.4)' },
            900,
          )
          .add(brewStream, { draw: ['0 1', '1 1'], duration: 260, ease: 'inQuad' }, 1320)
          .add('.kv-pouch', { opacity: [1, 0], rotate: [-20, 0], duration: 380, ease: 'inQuad' }, 1360)
          .add('.kv-label-10', { opacity: [1, 0], duration: 260, ease: 'inQuad' }, 1400)

          // [2] Mix — Add 150 ml hot or cold milk and sugar.
          .add('.kv-jug', { opacity: [0, 1], translateX: [16, 0], duration: 420, ease: 'outQuart' }, 1500)
          .add(jugLines, { draw: ['0 0', '0 1'], duration: 520, ease: 'inOutSine', delay: stagger(50) }, 1500)
          .add('.kv-label-150', { opacity: [0, 1], translateY: [6, 0], duration: 300, ease: 'outQuad' }, 1850)
          .add(milkStream, { draw: ['0 0', '0 1'], duration: 300, ease: 'inQuad' }, 1850)
          .add('.kv-liquid', { scaleY: [0.3, 0.9], duration: 720, ease: 'outCubic' }, 1980)
          .add('.kv-milk-tint', { opacity: [0, 1], duration: 720, ease: 'outCubic' }, 1980)
          .add(
            '.kv-plip-milk',
            {
              opacity: [0, 1, 0],
              translateY: [0, -18],
              translateX: stagger(9, { start: -9 }),
              duration: 460,
              ease: 'outQuad',
            },
            1990,
          )
          .add('.kv-splash', { scale: [1, 1.05], duration: 720, ease: 'outCubic' }, 1980)
          .add('.kv-sugar', { opacity: [0, 1, 1, 0], translateY: [0, 92], duration: 620, ease: 'inQuad' }, 2080)
          .add(milkStream, { draw: ['0 1', '1 1'], duration: 260, ease: 'inQuad' }, 2450)
          .add('.kv-jug', { opacity: [1, 0], translateX: [0, 10], duration: 360, ease: 'inQuad' }, 2500)
          .add('.kv-label-150', { opacity: [1, 0], duration: 260, ease: 'inQuad' }, 2540)

          // [3] Enjoy — Stir. Sip. Repeat.
          .add('.kv-spoon', { opacity: [0, 1], translateY: [-24, 0], duration: 380, ease: 'outQuart' }, 2600)
          .add('.kv-spoon', { rotate: [0, -10, 8, -4, 0], duration: 900, ease: 'inOutSine' }, 2700)
          .add(swirl, { draw: ['0 0', '0 1'], duration: 420, ease: 'outSine' }, 2650)
          .add('.kv-swirl', { rotate: [0, 320], duration: 900, ease: 'inOutSine' }, 2650)
          .add(swirl, { draw: ['0 1', '1 1'], duration: 300, ease: 'inQuad' }, 3250)
          .add('.kv-cup-layer', { translateY: [0, -10, 0], rotate: [0, -4, 0], duration: 700, ease: 'inOutSine' }, 3200)

        if (reducedMotion) tl.seek(tl.duration)
      })
    })

    return () => {
      cancelled = true
      scope?.revert()
    }
  }, [reducedMotion])

  return (
    <section id="how-to-kelvo" aria-labelledby="ritual-heading" className="scroll-mt-24 px-3 py-16 sm:px-4 sm:py-20">
      {/* Runway: the panel, plus half a viewport of scroll for it to hold. */}
      <div ref={runwayRef}>
        {/* Always one screen tall (under the header, with a small margin), like
            the hero. Below lg it also clears the sticky "Shop the flavours" bar.
            The drawing takes whatever height the heading and steps leave, sized
            to fit its slot both ways, so nothing spills off the bottom of the
            screen at any size. */}
        <div
          ref={stageRef}
          className={cn(
            'kv-surface ground-classic [--surface:rgb(188_233_239_/_0.8)] mx-auto flex h-[calc(100svh-var(--spacing-header)-1rem)] min-h-[28rem] max-w-[75rem] flex-col rounded-xl max-lg:h-[calc(100svh-var(--spacing-header)-5.75rem-env(safe-area-inset-bottom))]',
            !reducedMotion && 'sticky top-[var(--spacing-header)]',
          )}
        >
          <div className="flex min-h-0 w-full flex-1 flex-col px-6 py-8 max-lg:[@media(max-height:720px)]:py-6 sm:px-10 sm:py-10 lg:px-16 lg:py-12">
            <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-x-16 gap-y-5 max-lg:[@media(max-height:720px)]:gap-y-3 [grid-template-areas:'heading'_'art'_'steps'] lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_auto_auto_minmax(0,1fr)] lg:gap-y-0 lg:[grid-template-areas:'art_.'_'art_heading'_'art_steps'_'art_.']">
              <h2 id="ritual-heading" className="text-h2 text-center [grid-area:heading] lg:mb-7">
                How to Kelvo.
              </h2>

              {/* The drawing sits right under the heading on mobile, so it is on
                  screen the moment the panel locks. Its slot is a size container:
                  the drawing is as big as fits it, up to a cap. */}
              <div className="flex min-h-0 items-center justify-center [container-type:size] [grid-area:art]">
                <div
                  className="aspect-[320/360] w-[min(100cqw,18rem,100cqh*320/360)] lg:w-[min(100cqw,25rem,100cqh*320/360)]"
                  style={{ perspective: '900px' }}
                >
                  <PourSequence />
                </div>
              </div>

              <div className="mx-auto w-full max-w-[30rem] [grid-area:steps] sm:max-w-[40rem] lg:max-w-[30rem]">
                <ol className="flex flex-col gap-1 sm:grid sm:grid-cols-3 sm:gap-2 lg:flex">
                  {brand.ritual.map((item, index) => {
                    const active = activeStep === index
                    return (
                      <li
                        key={item.step}
                        className={cn(
                          // Below lg everything is centred in its box: on phones the number
                          // and name share a line with the copy under them, on tablets they
                          // stack. From lg the number sits beside the name and copy.
                          'flex flex-col items-center gap-1 rounded-md border-2 px-4 py-2 text-center transition-[background-color,border-color] duration-300 max-sm:[@media(max-height:720px)]:py-1 sm:gap-2 sm:px-3 sm:py-3 lg:grid lg:grid-cols-[auto_1fr] lg:items-center lg:gap-x-5 lg:gap-y-0 lg:px-4 lg:py-4 lg:text-left lg:[grid-template-areas:"num_title"_"num_copy"]',
                          active ? 'kv-grain ground-paper border-ink' : 'border-transparent',
                        )}
                      >
                        <div className="flex items-center gap-3 sm:flex-col sm:gap-2 lg:contents">
                          <span
                            aria-hidden="true"
                            className={cn(
                              'grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-[1.35rem] leading-none transition-colors duration-300 lg:size-12 lg:[grid-area:num] lg:text-[1.6rem]',
                              // The active step's number is filled: Ink disc, Paper figure.
                              active && 'bg-ink text-paper',
                            )}
                          >
                            {index + 1}
                          </span>
                          <h3 className="text-[1.6rem] leading-none sm:text-[1.85rem] lg:self-end lg:text-[2.2rem] lg:[grid-area:title]">
                            {item.step}
                          </h3>
                        </div>
                        <p className="text-[1rem] font-medium sm:mt-0 lg:mt-1.5 lg:self-start lg:text-[1.02rem] lg:[grid-area:copy]">
                          {item.copy}
                        </p>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </div>
        </div>
        {!reducedMotion && <div aria-hidden="true" className="h-[50svh]" />}
      </div>
    </section>
  )
}

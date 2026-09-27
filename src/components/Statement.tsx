import { Reveal } from './ui/Reveal'
import { StoryArt } from './StoryArt'

/**
 * SECTION 4 — The story, in the reference's founder-note layout: an
 * warm off-white (#F2F0EE) panel with the graph grid, the words flush left, and an
 * illustration tucked into the bottom-right corner.
 *
 * The drawing is live SVG with no paper of its own (StoryArt), so the grid
 * shows through it, as if drawn on the pad; it assembles itself the first
 * time it comes into view and then idles very quietly. Its left and top edges
 * ease away to nothing (.kv-fade-corner), so it reads as part of the panel
 * rather than a picture placed on it. The copy is the back-of-pack story, verbatim.
 */
export function Statement() {
  return (
    <section id="story" aria-labelledby="story-heading" className="px-3 py-16 sm:px-4 sm:py-20">
      {/* A warm off-white card with a light rule on its rounded edge; the grid is
          ruled at half its usual strength. On desktop the illustration's
          visible part is always 75% of the card's width (93.75% wide, pushed
          20% past the edge), and the card is at least tall enough to show all
          of it: 0.55 x its own width. */}
      <div className="kv-surface relative mx-auto max-w-[75rem] overflow-hidden rounded-xl border-2 border-ink/20 [--grid-rule:rgb(27_25_24_/_0.055)] [--surface:#F2F0EE] lg:flex lg:min-h-[calc(min(100vw-2rem,75rem)*0.55)] lg:items-center">
        <div className="relative z-10 px-6 pt-12 text-center sm:px-10 sm:pt-16 lg:max-w-[40%] lg:text-left lg:py-20 lg:pr-4 lg:pl-12 xl:pl-16">
          <Reveal>
            <h2 id="story-heading" className="text-h2 whitespace-nowrap">
              We&rsquo;re not
              <br />
              coffee nerds.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mx-auto mt-8 flex max-w-[44ch] flex-col gap-4 lg:mx-0 lg:max-w-[34ch] text-[1.1rem] leading-relaxed sm:text-[1.2rem]">
              <p>We don&rsquo;t care about roast profiles or tasting notes.</p>
              <p>
                We just got bored of coffee tasting like{' '}
                <span className="kv-grain ground-caramel inline-block -rotate-2 rounded-sm px-2 font-display leading-[1.25]">
                  coffee.
                </span>
              </p>
              <p>
                So we thought, why not add flavours? That&rsquo;s how Kelvo was born: our take on filter coffee,
                familiar but way more fun.
              </p>
            </div>
          </Reveal>

        </div>

        {/* Pinned to the bottom-right corner and nudged past it (the panel clips only the
            empty wash at the far right); in flow under the text on small screens. */}
        <StoryArt className="kv-fade-corner mt-2 ml-auto block w-full opacity-85 lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:w-[93.75%] lg:translate-x-[20%]" />
      </div>
    </section>
  )
}

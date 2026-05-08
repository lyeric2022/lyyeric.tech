import React from 'react';

export const metadata = {
  id: 13,
  slug: 'vibecoding-engineering-and-skill',
  title: 'Does Vibecoding Count as Engineering?',
  date: '11.20.25',
  draftKind: 'note',
};

export const content = (
  <>
    <br />

    <p>
      <em>
        “Coding agents on the other hand feels like I’ve become a PM…” “…I worry that new engineers will never gain the skills of actually knowing how these things lace together because they’re no longer doing, they’re just observing and referring (or just not reviewing at all).”
      </em>
      {' '}
      –shub
    </p>
    <br />

    <h2>Vibecoding at work</h2>

    <p>
      Having worked in 3 startups, I feel like my abilities as a SWE haven’t grown enough on the raw coding side. I could’ve just self-coded more, but some thoughts emerge: if coding models get better– what’s the point of putting in so much effort if LLMs could just do it faster and better?
    </p>
    <br />

    <p>
      A recent friend at big tech also asked me: “Eric, how much do you vibecode?” Like unironically: &gt;90%. He was shocked because for his work, which was much more niche and specialized– coding tools were not used nearly to the same degree. He spends half the day researching XR and generates ~100 lines of code a week.
    </p>
    <br />

    <p>
      Subsequently, he gave a remark that really echoed what I felt internally– does vibecoding even count as engineering? I’m offloading coding ability in favor of speed and higher-level decisions. But is this copium?
    </p>
    <br />

    <h2>Context, agents, and the brainrot tax</h2>

    <p>
      As AI coding tools become ever-powerful, context becomes king, and providing agents with the right set of instructions and knowledge bases– enables them to practically achieve most tasks. I do truly believe AI is an enabling tool, but it feels like vibe-coding your way to a solution does also feel somewhat brainrotting. But also realistically, it would’ve probably taken me longer to implement the changes, and even longer to implement newer features.
    </p>
    <br />

    <p>
      There’s the obvious solution: use Cursor as only a guide, and raw code more often. This would enable a deeper understanding of the code actually being generated, and offset the brainrot tax.
    </p>
    <br />

    <h2>Where ROI tilts</h2>

    <p>
      Yet, if coding models truly are getting better then:
    </p>

    <ol>
      <li>ROI for understanding code in depth diminishes</li>
      <li>
        ROI for better “context engineering / spec-driven development / researching” increases
      </li>
      <li>Opportunity costs grow for not leveraging coding models</li>
    </ol>

    <br />

    <p>
      Like unironically, by 2030, someone who’s never touched a line of code, will be able to fully vibe-code towards a next.js site hosted onto vercel, fastapi onto render, equipped with stripe payments, posthog analytics, supabase auth & db, redis caching, cloudflare protection, Grafana monitoring. The agents integration– multimodal, vapi voice, powered by grok inferencing, fine-tuned on hyperbolic, would easily run 200+ parallel tool calls, from letta memory to exa web searches, and communicate with 10+ other agents via MCP.
    </p>
    <br />

    <h2>Systems judgement vs foundations</h2>

    <p>
      What makes a good SWE then? IMO, it’s everything else too, but importantly, someone who understands design decisions and system flows. When cost and time of code generation depletes, domain exposure becomes the best metric for good engineering, rather than depth in coding knowledge. In the coming decade when anyone can generate code, the capacity to think in systems and structures, would likely matter more than just being able to write code.
    </p>
    <br />

    <p>
      But tbh I don’t fully agree with the thesis. Calculators haven’t deprecated mathematics, but have amplified what we can do with math. Even as LLM code generation generally outperforms junior devs, ICPC medalists are still very, very sought after– due to their deep domain knowledge in ds & algo foundations. Strong foundations flesh out strong devs, and enable us to be more than just users of tools, but also masters of the trade.
    </p>
    <br />

    <p>
      Another issue is that LLM coding use also scales downward as codebases grow. Tell cursor to generate you a site and it’ll do it with 70% competency. Use spec-driven development and it’ll do it with 80% competency. You can try context engineering further, and satisfactions grow, but the farther one strays from the “PMF” phase to real specialization moats, efficiency decreases logarithmically. You can vibe-code most of the YC companies. You can’t vibecode Meta Ads. You can’t vibecode Uber’s price matching. The marketplace for dev tools has grown even further alongside the AI boom. And lastly, overreliance also becomes harmful when we, the developers, are no longer able to solve problems without its use (although I feel like it is a weak argument).
    </p>
    <br />

    <h2>Curiosity, bar-raising, and two metaphors</h2>

    <p>
      There is also, of course, the thrill of just learning foundations as a means of curiosity. Good SWEs are generally ones that are curious, like to build, and amplified with strong work ethics. Understanding code in depth does also feel quite fun.
    </p>
    <br />

    <p>
      The expectations for SWEs have climbed, especially in code generation. Engineers will still need to understand the code output, explain their design decisions, and keep their code modular, maintainable, sanitized, etc.
    </p>
    <br />

    <p>
      Yet truthfully as well, I am confident in neither thesis. AI feels very much like Apple Maps– you don’t need to memorize streets and highways– you could just follow the maps, but ultimately, you– the driver, need to be able to drive well. Yet AI also feels like Waymo– you don’t even need to drive– you could just give a location and get to that destination.
    </p>
    <br />

    <p>
      I ultimately think that migrating to higher-level planning and design to ride the wave of code generation is a lot more important, but the traditional path of climbing upwards by learning the lower building blocks isn’t deprecated just yet. And regardless of AI’s role in the work of future SWEs, the work of researching and building won’t ever go away.
    </p>
    <br />
  </>
);

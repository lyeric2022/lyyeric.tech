import React from 'react';

export const metadata = {
  id: 9,
  slug: 'babbling-about-vibe-coding',
  title: 'How I Vibe Code',
  date: '4.26.26',
};

export const content = (
  <>
    <br />

    <p>
      Sometimes I think I'm quite clever / good at using LLMs to solve problems. But turns out, everyone everywhere is also just vibe-coding too. Here are some of my learnings though :D
    </p>
    <br />

    <h2>Speed, stack, and vendors</h2>

    <p>
      In practice, by chaining web search + vector/fs search + commit checks + logs + skills + general intuition, I'm able to effectively build anything. Maybe a year ago, models weren't reliable enough, but today, they honestly kinda are. It kinda sucks in some sense that I would've been much better syntactically and detail-wise without LLMs, but the speed at which I can build and fix problems is godlike vs. any other timeline.
    </p>
    <br />

    <p>
      On speed, it's quite freaky to see agents refactor tens of thousands of lines of code within a few hours. The ability of Composer 2 to build so quickly is astonishing. The problems that I have now are more about: 1) what to build, does this actually improve the UX, what are the costs, latency, and alternatives, and 2) what tools to use, I love to default to TypeScript, Next.js, Vercel, Node, Prisma, and deploy to Render. If I'm using Python, then I'd go with SQLAlchemy + Alembic.
    </p>
    <br />

    <p>
      Elsewhere in the default stack, TanStack, Infisical, Redis, and PostHog are very useful, and for DB, I've been just defaulting to Supabase, although Neon & Convex seem to be gaining a lot of popularity. For agent frameworks, Letta's quite awesome, although AI SDK is now the default choice for TypeScript. Tailwind is way too standard now, and I don't really think much else for UI. Devin's code review is quite nice. CI for DB migration builds is mandatory, and Linear is the greatest for tickets. E2E pipeline testing is very ideal, and so are the builds for FE/BE.
    </p>
    <br />

    <p>
      I should also give more credit to PostHog. Sentry's quite a default for many orgs, but I just love how I can do everything on PostHog: analytics, feature flags, request logs, session replays.
    </p>
    <br />

    <p>
      More broadly, my philosophy is minimizing the number of vendors, so as to keep all projects as maintainable as possible. Supabase supports so much: general Postgres, pgvector, vaults, auth. This sucked though when connection limits were maxed and auth failed alongside it.
    </p>
    <br />

    <h2>App, git, ship, infra</h2>

    <p>
      Back in the app layer, <code>useEffect</code> is a sin due to unnecessary dependency chains, and so is the amount of dead code that LLMs leave behind after a few weeks of development. You'll often end up with folders with 15 files, and if you're not careful enough, even files with 1.5k+ LOC. A simple fix for the former is just React skills & composition from Vercel, and the fix for the latter is running Composer 2 to refactor. Ensure your pre-commits check for ESLint + builds properly, with simple warnings / barriers once you reach over 600 LOC. I cap at 1000 LOC for all ts/tsx/py files. Also, over time you'll find that LLMs are repeating many declarations and components, so it's now time to create config & component files for reusability and consistency. I personally also love "HStack/VStack" to make containers more readable and consistent.
    </p>
    <br />

    <p>
      Given how LLMs can look at git history per line of code now, I like to also ensure that my commit messages are relevant & descriptive. It should be obvious to the agent why certain code was written, with what reasoning, and whose fault it was when something breaks. :)
    </p>
    <br />

    <p>
      For release, unit tests are mandatory for ensuring proper validation behaviors. Deployments really depend on the number of customers & needs, and I generally dislike over-engineering. For most stuff though, I like to have separate branches for production, demo, staging, development, and localhost.
    </p>
    <br />

    <p>
      On infra and packaging, some things that I've recently learned about are the need for worker services to be unbundled from the main server, how easy it is to upload packages for npm/PyPI, and that Docker instances should have different tags when trying to run concurrent builds, as well as issues related to race conditions, queue pollution, and process resumability.
    </p>
    <br />

    <p>
      Fixing these is kinda easy when you kinda know what you're doing and have the right logs. So ensure that all processes break loudly when they do break. Avoid silent failures.
    </p>
    <br />

    <h2>Agents, MCP, and mindset</h2>

    <p>
      Zooming out, agent harnesses are not going away for at least the next 5 years, and so it's worth looking into how they work. Cursor is genuinely so great, and Claude Code / Codex too, I'm sure. The way that LLMs are fed indexed files & can just blaze through depths of context research via vector & bash + sandboxes + MCP feels so magical.
    </p>
    <br />

    <p>
      On MCP specifically, the picture may look very different in 2 years. Letta believes that shell-based actions will triumph over browser-based / MCP-based actions, and Composio agrees too, as they're now also building in the sandbox space. MCP tools edge between being too context-pollutive and not dynamic enough, and Pointer's browser tools had recurring latency + inaccuracy.
    </p>
    <br />

    <p>
      For customizability, I like to have the LLM always explain back a technical topic / syntax so as to prevent hypnosis. The worst feeling ever when using LLMs to "do everything" is when it isn't actually able to solve the problem within a few hours. It feels like you've wasted all those hours as you're stuck with something large that you don't actually understand, so you basically have to start all over. Even as context summarization is getting increasingly good, it is still non-ideal to purely depend on the same agent session, so you'll need to ensure that you understand the code being generated.
    </p>
    <br />

    <p>
      In that same vein, software engineers are increasingly becoming just context engineers, and spec-driven development is quite popular at large orgs. I'm sure I've used such philosophy in some form, but perhaps agents maintaining a living record of past learnings and preferences may go further.
    </p>
    <br />

    <p>
      On systems and structure, parallelization vs concurrency, message queues, and content hashing are underrated. Docker & K8s are always cool, and it is so essential to understand the generated code. I feel like syntax doesn't matter anymore tbh, nor the styling of code, so long as it is readable by another developer. Modularity is very important, especially since refactors are now much more needed and frequent against the mass of generated code.
    </p>
    <br />

    <p>
      On long-running stateful agents, the key is primarily sleep and planner/evaluator + doer agents.
    </p>
    <br />

    <p>
      On evals, LLM as a judge is decent + cheap for evals. Solve real problems & research novelty. Something interesting comes out literally every week now.
    </p>
  </>
);

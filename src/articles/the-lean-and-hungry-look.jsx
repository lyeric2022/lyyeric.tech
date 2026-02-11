import React from 'react';

export const metadata = {
  id: 7,
  slug: 'the-lean-and-hungry-look',
  title: 'The Lean and Hungry Look',
  date: '2.10.26',
};

export const content = (
  <>
    <br />

    <p>
      By now, we've all seen the viral Anthropic ads. There's been a lot of talk about the merits and justifications, but my immediate feeling was: wow, what a masterplay by Dario in strategic positioning. Had Athrophic rivaled OpenAI's scale, they would've been forced to likewise service ads. Dario capitalized OpenAI's user base towards advantage.
    </p>
    <br />

    <p>
      ChatGPT has over 800 million weekly active users, of which roughly 20 million are paid subscribers: a conversion rate around 2.5%.<sup><a href="#ref-1">1</a></sup> The remaining 97.5% are free users that OpenAI services at a loss. In the first three quarters of 2025 alone, OpenAI spent $8.7 billion on Microsoft Azure inference (the compute cost of actually running queries).<sup><a href="#ref-2">2</a></sup> Full-year 2025 revenue hit ~$20 billion, but operating burn was ~$17 billion,<sup><a href="#ref-3">3</a></sup> and the company projects $115 billion in cumulative cash burn through 2029.<sup><a href="#ref-4">4</a></sup> HSBC estimates they won't actually be profitable until 2030.<sup><a href="#ref-5">5</a></sup> OpenAI has committed to $1.15 trillion in infrastructure spending between 2025 and 2035.<sup><a href="#ref-6">6</a></sup>
    </p>
    <br />

    <p>
      Anthropic, by comparison, has about 19 million monthly active users on claude.ai,<sup><a href="#ref-7">7</a></sup> roughly 2,300 employees (vs OpenAI's ~7,000), and a $350 billion valuation to OpenAI's $830 billion. Revenue was ~$3.7 billion in 2025 against a $3 billion burn, down from $5.6 billion in 2024.<sup><a href="#ref-8">8</a></sup> They spent $2.66 billion on AWS through September 2025.<sup><a href="#ref-9">9</a></sup> They project breakeven by 2028: two years ahead of OpenAI.<sup><a href="#ref-10">10</a></sup>
    </p>
    <br />

    <p>
      The asymmetry is bleak. Both companies lose roughly the same amount per free query, but OpenAI services ~40x more. And OpenAI can't reduce this gap. Those 800 million users are the number that justifies the $830 billion valuation and $1.15 trillion in infrastructure commitments. If OpenAI degrades the free experience (harsher rate limits, worse models, intrusive ads), users switch to Claude or Gemini in seconds, the growth narrative collapses, and the investment thesis collapses with it. So OpenAI is trapped: it must keep spending billions to maintain a free tier for 780 million non-paying users, not because those users are valuable, but because losing them would be catastrophic. Anthropic doesn't carry that weight. Their free tier serves the same strategic function (keeping users from defaulting to ChatGPT), but at a fraction of the volume, and therefore a fraction of the cost. Every competitive disadvantage they have in scale, is simultaneously a cost advantage in unit economics.
    </p>
    <br />

    <p>
      OpenAI's playbook looks a lot like the standard blitzscaling strategy that defined the last decade of tech: subsidize users, capture the market, monetize later. Amazon did it with e-commerce, Uber did it with rides. But that strategy works when marginal costs decrease with scale. Amazon built warehouses and logistics networks where each additional order got cheaper to fulfill. The fixed costs were high, but the unit economics improved over time, and once customers were locked into Prime, switching costs kept them there. Uber's version was different: the subsidies didn't reduce marginal costs, but they solved the cold-start problem of a two-sided marketplace. More subsidized drivers meant shorter wait times, which attracted riders, which attracted more drivers. The subsidies built marketplace liquidity city by city, and once that density existed, competitors couldn't replicate it. That was the actual moat. Uber reached $6.6 billion net income in 2025 by monetizing that liquidity through algorithmic pricing once the network was entrenched.
    </p>
    <br />

    <p>
      AI inference doesn't have either advantage. Every query costs real compute, and there's no two-sided marketplace to entrench: ChatGPT's free users don't justify the supply-side partners the way Uber's subsidized riders attract supply-side drivers. You could argue that more users means more data means better models, but every major lab trains on similar datasets, and user interaction data has sharply diminishing returns compared to architectural improvements. Switching costs are incredibly low, and users can easily switch between ChatGPT, Claude, and Gemini. Bitzscaling in a market where mass subsidization doesn't build a moat, doesn't work.
    </p>
    <br />

    <p>
      As such OpenAI was forced to revise its model and subsequently announced ads last week on ChatGPT's free tier. Anthropic immediately ran four commercials titled "Betrayal," "Deception," "Violation," and "Treachery," each showing people getting pitched products mid-conversation with an AI assistant. "Ads are coming to AI. But not to Claude." By forced by OpenAI's cost structure and reframed it as a betrayal of user trust. Altman called the ads "clearly dishonest."<sup><a href="#ref-11">11</a></sup>
    </p>
    <br />

    <p>
      This maps to the Fudenberg-Tirole taxonomy,<sup><a href="#ref-12">12</a></sup> a game theory framework that classifies how incumbents and entrants should behave based on the competitive environment. OpenAI is what Fudenberg and Tirole call the "fat cat": an incumbent that invested heavily to dominate, but whose size now locks it into cost structures, growth narratives, and $1.15 trillion in forward infrastructure commitments that make pivoting nearly impossible. Anthropic is the "lean and hungry look": a smaller entrant that deliberately avoids large commitments, stays lean, and lets the incumbent's scale become its own problem.
    </p>
    <br />

    <p>
      This is also what Yoffie and Kwak call judo strategy:<sup><a href="#ref-13">13</a></sup> using a larger competitor's size and momentum against them rather than competing head-to-head. Anthropic doesn't need to beat OpenAI. It just needs to exist as a credible free alternative. That existence alone forces OpenAI to keep burning billions maintaining its free tier, because the alternative (cutting or degrading it) would push users to Claude and destroy the metrics that justify the entire investment thesis. Both companies maintain a free tier for the same strategic reason: user retention. But the cost of that stalemate is radically asymmetric. Anthropic's free tier for 19 million users costs a fraction of a billion. OpenAI's free tier for 800 million costs tens of billions. Same deterrent function, ~40x the price.
    </p>
    <br />

    <p>
      In game theory, when two players bleed resources over time, the one with lower ongoing costs tends to win, even if the other has more total capital. OpenAI's projected burn through 2029 is $115 billion. Anthropic's burn in 2025 was $3 billion, already declining year-over-year, with breakeven projected for 2028. They don't need to outspend OpenAI. They need to outlast them on unit economics, and the current trajectory suggests they will. Meanwhile, from that leaner position, they justify their smaller scale to investors, talent, and the public as "responsibility" rather than inability to compete.
    </p>
    <br />

    <p>
      What makes the strategy hard to counter is the layering. The safety positioning isn't fake: Anthropic's founders genuinely left OpenAI over safety disagreements, and the focus is real. But it also happens to be the optimal competitive posture, the best narrative for recruiting talent, and the strongest pitch to regulated enterprise customers in healthcare, finance, and government. Every layer reinforces the others. That's mechanism design at work: building a system where selfish actions naturally produce desirable outcomes, so that every self-interested move also looks virtuous.
    </p>
    <br />

    <p>
      The pattern isn't new. Tesla didn't beat legacy automakers by building better cars first. They exploited the fact that GM, Ford, and Toyota couldn't pivot to EVs without cannibalizing their combustion businesses, dealer networks, supply chains, and union contracts. Tesla's smaller scale meant no legacy baggage. The "save the planet" framing was a bonus that made a structural advantage feel like moral leadership. Same mechanism, different industry.
    </p>
    <br />

    <p>
      From my own thesis on market equilibria, this also explains why Anthropic's position is more durable than people expect. While OpenAI fights a costly war for hundreds of millions of free consumers, Anthropic locks in the enterprise segment where margins exist and contracts are sticky. The 2028 projections tell the story: Anthropic expects up to $70 billion in revenue and positive cash flow, while OpenAI projects roughly $74 billion in operating losses that same year.<sup><a href="#ref-10">10</a></sup><sup><a href="#ref-14">14</a></sup> One company is projecting profitability. The other is projecting its largest annual loss ever. The equilibrium rewards restraint.
    </p>
    <br />

    <p>
      To be clear, OpenAI isn't losing. They're valued at $830 billion, they're raising the largest private round in history, and there's real value in owning the consumer default. But Anthropic is playing a different game entirely. Scale is usually a moat, but when your competitor can turn your scale into a cost center, reframe your monetization as betrayal on national television, and recruit your safety-conscious engineers with a cleaner narrative, you start bleeding from the very thing that was supposed to protect you.
    </p>
    <br />

    <p>
      For aspiring founders: you don't beat a giant by being a bigger giant. You find the spot where their strength becomes their liability, and you build there. If you can make that position look principled too, even better. :)
    </p>

    <br />
    <h2>References</h2>

    <ol className="references">
      <li id="ref-1"><a href="https://www.demandsage.com/chatgpt-statistics/" target="_blank" rel="noopener noreferrer">DemandSage, "ChatGPT Users Statistics," February 2026.</a></li>
      <li id="ref-2"><a href="https://www.theregister.com/2025/11/12/openai_spending_report/" target="_blank" rel="noopener noreferrer">The Register, "OpenAI's viability called into question by reported inference spending with Microsoft," November 2025.</a></li>
      <li id="ref-3"><a href="https://www.webpronews.com/openai-revenue-triples-to-20b-in-2025-amid-17b-burn-and-risks/" target="_blank" rel="noopener noreferrer">WebProNews, "OpenAI Revenue Triples to $20B in 2025 Amid $17B Burn and Risks," 2025.</a></li>
      <li id="ref-4"><a href="https://fortune.com/2025/09/06/openai-spending-outlook-115-billion-through-2029-data-center-server-chips/" target="_blank" rel="noopener noreferrer">Fortune, "OpenAI says spending to rise to $115 billion through 2029," September 2025.</a></li>
      <li id="ref-5"><a href="https://finance.yahoo.com/news/openai-won-t-money-2030-182441351.html" target="_blank" rel="noopener noreferrer">HSBC via Yahoo Finance, "OpenAI won't make money by 2030 and still needs to come up with another $207 billion," 2025.</a></li>
      <li id="ref-6"><a href="https://tomtunguz.com/openai-hardware-spending-2025-2035/" target="_blank" rel="noopener noreferrer">Tom Tunguz, "OpenAI's $1 Trillion Infrastructure Spend," 2025.</a></li>
      <li id="ref-7"><a href="https://www.businessofapps.com/data/claude-statistics/" target="_blank" rel="noopener noreferrer">Business of Apps, "Claude Revenue and Usage Statistics," 2026.</a></li>
      <li id="ref-8"><a href="https://www.techmeme.com/250214/p41" target="_blank" rel="noopener noreferrer">The Information via Techmeme, "Anthropic expects to burn $3B in 2025, down from $5.6B in 2024, and make up to $3.7B in revenue," February 2025.</a></li>
      <li id="ref-9"><a href="https://www.osnews.com/story/143599/this-is-how-much-anthropic-and-cursor-spend-on-amazon-web-services/" target="_blank" rel="noopener noreferrer">OSNews, "This is how much Anthropic and Cursor spend on Amazon Web Services," 2025.</a></li>
      <li id="ref-10"><a href="https://www.techmeme.com/251110/p36#a251110p36" target="_blank" rel="noopener noreferrer">Wall Street Journal via Techmeme, "Anthropic expects to break even in 2028, while OpenAI projects ~$74B in operating losses that year," November 2025.</a></li>
      <li id="ref-11"><a href="https://cnbc.com/2026/02/05/super-bowl-ai-ad-altman-anthropic-open-ai.html" target="_blank" rel="noopener noreferrer">CNBC, "Altman lashes out at 'clearly dishonest' Anthropic ads," February 2026.</a> <a href="https://arstechnica.com/information-technology/2026/02/openai-is-hoppin-mad-about-anthropics-new-super-bowl-tv-ads" target="_blank" rel="noopener noreferrer">Ars Technica, "OpenAI is hoppin' mad about Anthropic's new Super Bowl TV ads," February 2026.</a></li>
      <li id="ref-12"><a href="https://econpapers.repec.org/RePEc:aea:aecrev:v:74:y:1984:i:2:p:361-66" target="_blank" rel="noopener noreferrer">Fudenberg & Tirole, "The Fat-Cat Effect, the Puppy-Dog Ploy, and the Lean and Hungry Look," American Economic Review, 1984.</a></li>
      <li id="ref-13"><a href="https://hbr.org/1999/01/judo-strategy-the-competitive-dynamics-of-internet-time" target="_blank" rel="noopener noreferrer">Yoffie & Kwak, "Judo Strategy: The Competitive Dynamics of Internet Time," Harvard Business Review, 1999.</a></li>
      <li id="ref-14"><a href="https://www.reuters.com/technology/anthropic-projects-soaring-growth-345-billion-2027-revenue-information-reports-2025-02-13/" target="_blank" rel="noopener noreferrer">Reuters, "Anthropic sees revenue potentially soaring to $34.5 billion in 2027," February 2025.</a> <a href="https://techcrunch.com/2025/11/04/anthropic-expects-b2b-demand-to-boost-revenue-to-70b-in-2028-report/" target="_blank" rel="noopener noreferrer">TechCrunch, "Anthropic projects $70B in revenue by 2028," November 2025.</a></li>
    </ol>
  </>
);

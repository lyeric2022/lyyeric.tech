import React from 'react';

export const metadata = {
  id: 7,
  slug: 'the-lean-and-hungry-ant',
  title: 'The Lean and Hungry Ant',
  date: '2.10.26',
};

export const content = (
  <>
    <br />

    <p>
      By now, we've all seen the viral Anthropic <a href="https://www.youtube.com/watch?v=FDNkDBNR7AM" target="_blank" rel="noopener noreferrer">ads</a> against OpenAI. There's been a lot of talk about the merits and justifications, but my immediate feeling was: wow, what a masterplay by Dario in strategic positioning– arbitraging his rival's massive user base advantage towards own. Had Anthropic rivaled OpenAI's consumer scale, they would've also serviced ads.
    </p>
    <br />

    <p>
      ChatGPT has over 800 million weekly active users, of which roughly 20 million are paid subscribers: a conversion rate around 2.5%.<sup><a href="#ref-1">1</a></sup> The remaining 97.5% are free users that OpenAI services at a loss. In the first three quarters of 2025 alone, OpenAI spent $8.7 billion on Microsoft Azure inference.<sup><a href="#ref-2">2</a></sup> Full-year 2025 revenue hit ~$20 billion, but operating burn was ~$17 billion,<sup><a href="#ref-3">3</a></sup> and the company projects $115 billion in cumulative cash burn through 2029.<sup><a href="#ref-4">4</a></sup> HSBC estimates they won't actually be profitable until 2030.<sup><a href="#ref-5">5</a></sup> OpenAI has committed to $1.15 trillion in infrastructure spending between 2025 and 2035.<sup><a href="#ref-6">6</a></sup>
    </p>
    <br />

    <p>
      Anthropic, by comparison, has about 19 million monthly active users on claude.ai,<sup><a href="#ref-7">7</a></sup> roughly 2,300 employees (vs OpenAI's ~7,000), and a $350 billion valuation to OpenAI's $830 billion. Revenue was ~$3.7 billion in 2025 against a $3 billion burn, down from $5.6 billion in 2024.<sup><a href="#ref-8">8</a></sup> They spent $2.66 billion on AWS through September 2025.<sup><a href="#ref-9">9</a></sup> They project breakeven by 2028: two years ahead of OpenAI.<sup><a href="#ref-10">10</a></sup>
    </p>
    <br />

    <p>
      The asymmetry is obvious. Both companies lose roughly the same amount per free query, but OpenAI services that cost ~40x more. And OpenAI can't reduce this gap without needed ads. Those 800 million users are the number that justifies the $830 billion valuation and $1.15 trillion in infrastructure commitments. If OpenAI degrades the free experience (harsher rate limits, worse models, slowness), users can switch to Claude or Gemini. Then the growth narrative collapses, and the investment thesis collapses with it.
    </p>
    <br />

    <p>
      So OpenAI is trapped: it must spend billions to maintain a free tier for 780 million non-paying users, because losing them would be catastrophic towards hypergrowth valuations and hurt future funding. Ads were known to be coming since Fidji Simo began meeting candidates for a head of ads role in September 2025.<sup><a href="#ref-11">11</a></sup> Yet whilst Anthropic's free tier has the same serving per-capita costs, they are at a fraction of OpenAI's volume, and therefore a fraction of the cost. Anthropic's disadvantage in consumer scale is an advantage in unit cost economics.
    </p>
    <br />

    <p>
      OpenAI's playbook on ChatGPT looks a lot like the standard blitzscaling strategy that defined the last decade of tech: subsidize users, capture the market, monetize later. Amazon did it with e-commerce, Uber did it with rides. But that strategy works when marginal costs decrease with scale. Amazon built warehouses and logistics networks where each additional order got cheaper to fulfill. The fixed costs were high, but the unit economics improved over time, and once customers were locked into Prime, switching costs kept them there. Uber's version was different: the subsidies didn't reduce marginal costs, but they solved the cold-start problem of a two-sided marketplace. More subsidized drivers meant shorter wait times, which attracted riders, which attracted more drivers. The subsidies built marketplace liquidity city by city, and once that density existed, competitors couldn't replicate it. That was the actual moat. Uber reached $6.6 billion net income in 2025 by monetizing that liquidity through algorithmic pricing once the network was entrenched.
    </p>
    <br />

    <p>
      AI inference doesn't have either advantage. Every query costs real compute, and there's no two-sided marketplace to entrench: ChatGPT's free users don't justify the supply-side partners the way Uber's subsidized riders attract supply-side drivers. You could argue that more users means more data means better models, but every major lab trains on similar datasets, and user interaction data has sharply diminishing returns compared to architectural improvements. Switching costs are incredibly low, and users can easily switch between ChatGPT, Claude, and Gemini. Blitzscaling in a market where mass subsidization doesn't build a moat, doesn't work.
    </p>
    <br />

    <p>
      As such, OpenAI was forced to revise its servicing structure and subsequently announced ads last week on ChatGPT's free tier. Anthropic immediately ran four commercials titled "Betrayal," "Deception," "Violation," and "Treachery," each depicting personal questions met with manipulative product placements mid-conversation. "Ads are coming to AI. But not to Claude." Currently, AI chat mediums depend on being truthful, and when the line between helpfulness and sponsored manipulation blurs, the entire medium loses reliability. Anthropic reframed OpenAI's decision as a fundamental betrayal of user trust. Altman called the ads "clearly dishonest."<sup><a href="#ref-12">12</a></sup>
    </p>
    <br />

    <p>
      This dynamic maps to the Fudenberg-Tirole taxonomy,<sup><a href="#ref-13">13</a></sup> a game theory framework from 1984 that classifies competitive strategy based on two questions: are you trying to deter your rival or accommodate them, and does your commitment make them more aggressive or less? The paper identifies four postures. The relevant two here: the "fat cat," where an incumbent's heavy investment was meant to dominate, but instead locks it into cost structures and commitments that a leaner rival can exploit. And the "lean and hungry look," where a smaller entrant stays uncommitted and flexible, staying dangerous precisely because it hasn't overextended. OpenAI plays the former.
    </p>
    <br />

    <p>
      This is also what Yoffie and Kwak call judo strategy:<sup><a href="#ref-14">14</a></sup> using a larger competitor's size and momentum against them rather than competing head-to-head. Anthropic just needs to exist as a credible free alternative. That existence alone forces OpenAI to keep burning billions maintaining its free tier, because the alternative (cutting or degrading it) would push users to Claude and destroy the metrics that justify the entire investment thesis. Both companies maintain a free tier for the same strategic reason: user retention. But the cost of that stalemate means that OpenAI must pay ~40x the loss to maintain such status quo.
    </p>
    <br />

    <p>
      Lastly, in game theory, when two players bleed resources over time, the one with lower ongoing costs tends to win, even if the other has more total capital. Blockbuster was once collecting $800 million a year in late fees and operating 9,100 stores. Netflix countered by offering flat-rate DVD subscriptions with no late fees. Blockbuster couldn't drop the late fees without destroying its revenue, yet also couldn't close stores without abandoning its customer base. So it tried to do both: maintain the retail network and build an online service simultaneously. Netflix had no stores and no legacy revenue to protect. Blockbuster later filed for bankruptcy in 2010.
    </p>
    <br />

    <p>
      What makes the strategy hard to counter is the layering. Anthropic's founders likely did genuinely leave OpenAI over safety disagreements, but it also happens to be the optimal competitive posture, the best narrative for recruiting talent, and the strongest pitch to regulated enterprise customers in healthcare, finance, and government. Every layer reinforces the others.
    </p>
    <br />

    <p>
      The pattern has been done before by Tesla. They didn't beat legacy automakers by building better cars first. They exploited the fact that GM, Ford, and Toyota couldn't pivot to EVs without cannibalizing their combustion businesses, dealer networks, supply chains, and union contracts. Tesla's smaller scale meant no legacy baggage. The "save the planet" framing was a bonus that made a structural advantage feel like moral leadership.
    </p>
    <br />

    <p>
      This is why I believe Anthropic's position is quite undervalued. While OpenAI fights a costly war for hundreds of millions of free consumers, Anthropic locks in the enterprise segment where margins exist and contracts are sticky. The AI winner probably will be the sustainable one.
    </p>

    <br />
    <h2>References</h2>

    <ol className="references">
      <li id="ref-1"><a href="https://www.demandsage.com/chatgpt-statistics/" target="_blank" rel="noopener noreferrer">DemandSage, 2026</a></li>
      <li id="ref-2"><a href="https://www.theregister.com/2025/11/12/openai_spending_report/" target="_blank" rel="noopener noreferrer">The Register, Nov 2025</a></li>
      <li id="ref-3"><a href="https://www.webpronews.com/openai-revenue-triples-to-20b-in-2025-amid-17b-burn-and-risks/" target="_blank" rel="noopener noreferrer">WebProNews, 2025</a></li>
      <li id="ref-4"><a href="https://fortune.com/2025/09/06/openai-spending-outlook-115-billion-through-2029-data-center-server-chips/" target="_blank" rel="noopener noreferrer">Fortune, Sept 2025</a></li>
      <li id="ref-5"><a href="https://finance.yahoo.com/news/openai-won-t-money-2030-182441351.html" target="_blank" rel="noopener noreferrer">HSBC via Yahoo Finance, 2025</a></li>
      <li id="ref-6"><a href="https://tomtunguz.com/openai-hardware-spending-2025-2035/" target="_blank" rel="noopener noreferrer">Tom Tunguz, 2025</a></li>
      <li id="ref-7"><a href="https://www.businessofapps.com/data/claude-statistics/" target="_blank" rel="noopener noreferrer">Business of Apps, 2026</a></li>
      <li id="ref-8"><a href="https://www.techmeme.com/250214/p41" target="_blank" rel="noopener noreferrer">The Information via Techmeme, Feb 2025</a></li>
      <li id="ref-9"><a href="https://www.osnews.com/story/143599/this-is-how-much-anthropic-and-cursor-spend-on-amazon-web-services/" target="_blank" rel="noopener noreferrer">OSNews, 2025</a></li>
      <li id="ref-10"><a href="https://www.techmeme.com/251110/p36#a251110p36" target="_blank" rel="noopener noreferrer">Wall Street Journal via Techmeme, Nov 2025</a></li>
      <li id="ref-11"><a href="https://www.pymnts.com/artificial-intelligence-2/2025/openai-searching-for-ad-chief-to-bolster-monetization/" target="_blank" rel="noopener noreferrer">PYMNTS, Sept 2025</a></li>
      <li id="ref-12"><a href="https://cnbc.com/2026/02/05/super-bowl-ai-ad-altman-anthropic-open-ai.html" target="_blank" rel="noopener noreferrer">CNBC</a>, <a href="https://arstechnica.com/information-technology/2026/02/openai-is-hoppin-mad-about-anthropics-new-super-bowl-tv-ads" target="_blank" rel="noopener noreferrer">Ars Technica</a>, Feb 2026</li>
      <li id="ref-13"><a href="https://econpapers.repec.org/RePEc:aea:aecrev:v:74:y:1984:i:2:p:361-66" target="_blank" rel="noopener noreferrer">Fudenberg & Tirole, AER 1984</a></li>
      <li id="ref-14"><a href="https://hbr.org/1999/01/judo-strategy-the-competitive-dynamics-of-internet-time" target="_blank" rel="noopener noreferrer">Yoffie & Kwak, HBR 1999</a></li>
    </ol>
  </>
);

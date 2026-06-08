import React from 'react';
import KellyGraph from '../components/graphs/kelly/KellyGraph';
import FractionalKellyGraph from '../components/graphs/kelly/FractionalKellyGraph';
import NegativeGeometricDragGraph from '../components/graphs/kelly/NegativeGeometricDragGraph';
import ArithmeticGeometricGraph from '../components/graphs/kelly/ArithmeticGeometricGraph';
import KellyArithmeticGeometricGraph from '../components/graphs/kelly/KellyArithmeticGeometricGraph';

export const metadata = {
  id: 1,
  slug: 'bet-sizing-with-fractional-kelley',
  title: 'Bet Sizing with Fractional Kelly',
  date: '1.31.26',
  draftKind: 'essay',
};

export const content = (
  <>
    <br />

    <p>
      The Kelly criterion is one of my favorite formulas. It tells you what fraction of your bankroll to wager when you have an edge, so you maximize long-term compound growth. People use it in investing and gambling; traders like Warren Buffett think in these terms too.
    </p>
    <br />

    <p>
      Scenario 1: A coin lands heads 55% of the time. Each flip, you win or lose your wager. You start with $100 and play 100 rounds. What is your strategy?
    </p>

    <KellyGraph />

    <br />

    <p>
      The optimal play is to bet 10% of your bankroll every time. Why not more?
    </p>

    <br />

    <p>
      Volatility creates negative geometric drag: the effort required to recover from losses grows faster than intuition suggests. Lose half your stake and you must double to get back; lose 75% and you need a 4× run. It works like gravity—the closer you are to the bottom, the harder it is to climb out.
    </p>
    <br />

    <p>
      The chart below shows how that drag eats compound returns.
    </p>

    <NegativeGeometricDragGraph />
    <br />

    <p>
      Kelly sizing keeps you out of holes that are hard to escape, while still maximizing long-term growth. Fixed fractions, fixed dollar amounts, and Martingale-style doubling tend to grow slower, risk ruin, or fail to scale with bankroll.
    </p>
    <br />

    <p>
      Real markets have fat tails, and you never know variance precisely. Recoveries can take years, so practitioners often use fractional Kelly—half-Kelly is common—to leave margin for being wrong about the odds.
    </p>

    <FractionalKellyGraph />

    <br />

    <p>
      Conventional advice pushes diversification: 80/20 splits, ETFs, bonds. That is fine as life advice, but it treats every opportunity as interchangeable and undersells the value of a real edge.
    </p>

    <br />

    <p>
      Kelly cuts back to first principles: maximize long-term compound growth. Each bet is sized from your edge—win probability and payout—not from habit. The trade-off between safety and growth falls out of the math instead of rules of thumb.
    </p>

    <br />

    <h2>Extra: when the arithmetic mean lies</h2>

    <p>
      Scenario 2: 50% chance to gain 60%, 50% chance to lose 40%. The arithmetic average looks like a 10% return. Is that actually a good bet?
    </p>

    <br />

    <p>
      The arithmetic mean and the geometric mean tell different stories.
    </p>

    <ArithmeticGeometricGraph />

    <br />

    <p>
      After two independent rounds you might see win-win (1.6 × 1.6 = 2.56), win-lose or lose-win (1.6 × 0.6 = 0.96), or lose-lose (0.6 × 0.6 = 0.36). Each sequence is equally likely before you play. The tidy 10% arithmetic story still sounds plausible, yet most paths lose ground once you compound. That is what variance drag is about.
    </p>

    <br />

    <p>
      The arithmetic average is not wrong—it really is the average across paths. Rare streaks of huge wins pull that average up while most paths lag. After many bets, outcomes pile up near the geometric mean, where drag dominates.
    </p>
    <br />

    <p>
      Kelly fixes this. Betting everything maximizes the wrong objective; Kelly maximizes expected log growth. Bet about 16.7% of your bankroll each round and you optimize for the geometric mean—enough to turn this proposition from a loser into a winner.
    </p>

    <KellyArithmeticGeometricGraph />

    <br />
    <p>Happy betting! :)</p>
  </>
);


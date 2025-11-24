import React from 'react';
import KellyGraph from '../components/graphs/kelly/KellyGraph';
import FractionalKellyGraph from '../components/graphs/kelly/FractionalKellyGraph';
import NegativeGeometricDragGraph from '../components/graphs/kelly/NegativeGeometricDragGraph';
import StrategyComparison from '../components/graphs/kelly/StrategyComparison';
import InteractiveFormula from '../components/writing/InteractiveFormula';
import HoverableText from '../components/writing/HoverableText';
import ArithmeticGeometricGraph from '../components/graphs/kelly/ArithmeticGeometricGraph';
import KellyArithmeticGeometricGraph from '../components/graphs/kelly/KellyArithmeticGeometricGraph';

export const metadata = {
  id: 1,
  slug: 'bet-sizing-with-fractional-kelley',
  title: 'Bet Sizing with Fractional Kelly',
  date: '1.31.25',
};

export const content = (
  <>
    <br />

    <p>
      The <InteractiveFormula 
        formula="f* = (bp - (1-p)) / b"
        explanation="where p is the probability of winning and b is the payout ratio (profit per unit bet when you win)"
        triggerText="Kelly Criterion"
      /> is one of my favorite formulas. 
      It finds the optimal fraction of your bankroll to wager when you have an edge, 
      maximizing long-term compound growth. 
      Useful in investing, gambling, and used by traders like Warren Buffett.
    </p>
    <br />

    <p>Scenario 1: A coin is flipped heads 55% of the time, with a payout/loss of your wager. Assuming you had $100 and 100 rounds, whats your strategy?</p>

    <KellyGraph />

    <br />

    <p>The strategy: bet 10% of your bankroll. But why not higher?</p>

    <br />

    <p>
        Due to the nature of the negative geometric drag, effort to recover from losses grow exponentially. 
        Losing half your money needs 2x recovery to break even; losing 75% needs 4x recovery to break even. 
        Like gravitational pulls- the closer you are, the stronger the pull, and the harder it is to escape. 
    </p>
    <br />

    <p>
      The <InteractiveFormula 
        formula="NGD = 1 − r²"
        explanation="where r is the measure of the compounding return rate"
        triggerText="Negative Geometric Drag"
      /> measures how volatility reduces compound returns.
    </p>

    <NegativeGeometricDragGraph />
    <br />

    <p>
    With the Kelly Criterion, you are shielded from falling into an unrecoverable hole of losses whilst still maintaining maximum long-term growth.
    Other strategies, like <HoverableText tooltip="Betting a fixed percentage of bankroll (e.g., always 5%) regardless of your edge. Simple but suboptimal—doesn't adapt to changing probabilities or payouts.">fixed fractional betting</HoverableText>,{' '}
    <HoverableText tooltip="Betting the same dollar amount every time (e.g., always $10). Doesn't scale with bankroll growth, so you're under-betting as you get richer.">fixed bet sizes</HoverableText>, or{' '}
    <HoverableText tooltip="Doubling your bet after each loss. Can lead to rapid ruin during losing streaks—requires infinite bankroll to guarantee recovery.">Martingale</HoverableText> either grow slower, risk ruin, 
    or fail to scale with bankroll.
    </p>
    <br />
    
    
    <p>
      However, markets do also have <HoverableText tooltip="Fat tails refer to probability distributions where extreme events (both gains and losses) occur more frequently than normal distributions predict. Real markets experience rare but severe crashes and booms that standard models underestimate.">fat tails</HoverableText>, and variance is not truly known. 
      Recoveries can take many years, so traders preferably use fractional Kelly (e.g., half-Kelly) to hedge against variance.
    </p>

    <FractionalKellyGraph />

    <br />
    <p>Conventional wisdom typically tells you to diversify: 80-20 allocations, ETFs, bonds. Such approach is simplistic, yet it equates all opportunities, and undervalues your edge. </p>
    
    <br />
    <p>Kelly returns to first principles: maximize long-term compound growth. It sizes each bet mathematically based on your edge— win probability and payout ratio. This optimizes the safety-growth trade-off, rather than adhering to arbitrary rules. The formula derives from the math, rather than heuristics.</p>

    <br />

    <h2>Extra: the peculiar case of Arithmetic-Geometric Divergence</h2>

    <p>
      Scenario 2: 50% chance to win 60%, 50% chance to lose 40%. The arithmetic mean says 10% average return. But is this a really a good bet?
    </p>

    <br />
    <p>
      The <InteractiveFormula 
        formula="E[X] = p × win + (1-p) × loss"
        explanation="For our scenario 2: 0.5 × 0.6 + 0.5 × (-0.4) = 0.1 (10% average)"
        triggerText="arithmetic mean"
      /> and <InteractiveFormula 
        formula="G = (win^p × loss^(1-p))"
        explanation="For our scenario 2: (1.6^0.5 × 0.6^0.5) ≈ 0.98 (2% loss per bet)"
        triggerText="geometric mean"
      /> tell two different stories.
    </p>

    <ArithmeticGeometricGraph />

    <br />

    <p>
      Compounds work against you. After two bets, you could win-win (1.6 × 1.6 = 2.56), 
      win-lose (1.6 × 0.6 = 0.96), lose-win (0.6 × 1.6 = 0.96), or lose-lose (0.6 × 0.6 = 0.36). 
      The <InteractiveFormula 
        formula="Geometric Mean = √(2.56 × 0.96 × 0.96 × 0.36) ≈ 0.92"
        explanation="Taking the fourth root of all four outcomes: (2.56 × 0.96 × 0.96 × 0.36)^(1/4) ≈ 0.92, meaning an 8% loss"
        triggerText="compounded outcome"
      /> shows an 8% loss, not a 10% gain.
    </p>

    <br />
    <p>
      The <InteractiveFormula 
        formula="E[X] = (x₁ + x₂ + ... + xₙ) / n"
        explanation="The arithmetic mean sums all outcomes and divides by the number of trials. For our scenario 2: (1.6 + 0.6 + 1.6 + 0.6 + ...) / n = 1.1 (10% average)"
        triggerText="simple average"
      /> technically isn't wrong— it correctly calculates the average outcome. 
      But rare extreme sequences (win-win-win-win-win) inflate this average. A few paths with massive gains pull the arithmetic mean up, 
      while most paths are losers. After many bets, outcomes cluster around the geometric mean, which accounts for variance drag.
    </p>
    <br />

    <p>
      Yet you can actually still win with the <InteractiveFormula 
        formula="f* = (bp - (1-p)) / b"
        explanation="For this scenario 2: p=0.5, b=1.5 (win 60% vs lose 40%), so f* = (1.5×0.5 - 0.5) / 1.5 = 0.167 (16.7% of bankroll)"
        triggerText="Kelly Criterion"
      />! 
      Instead of betting your full bankroll (which leads to geometric drag), Kelly sizes your bet to maximize expected logarithmic growth. 
      By betting 16.7% of your bankroll each round, you optimize for the geometric mean— turning a losing bet into a winning strategy. :)
    </p>

    <KellyArithmeticGeometricGraph />

    <br />
    <p>Hope this was insightful! Happy betting! :D</p>
  </>
);


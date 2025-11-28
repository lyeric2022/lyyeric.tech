import React from 'react';
import HoverableText from '../components/writing/HoverableText';

export const metadata = {
  id: 5,
  slug: 'xai-vs-t1-ai-next-benchmark',
  title: 'XAI vs T1: AI\'s Next Benchmark',
  date: '11.28.25',
};

export const content = (
  <>
    <br />

    <p>
      Growing up, I played a lot of chess, League of Legends, and Starcraft 2.
    </p>
    <br />

    <p>
      Elon putting xAI vs T1 in League of Legends makes my inner child so so happy, and as an adult, it's quite awesome my addictions converging to become proxies for AI research environments.
    </p>
    <br />

    <p>
      Google DeepMind is the most beloved AI lab, and has inspired many (like myself) to dive further into AI. When DeepMind (AlphaGo) beat Stockfish (the world's then <HoverableText tooltip="State of the Art - the best performing system at the time">SOTA</HoverableText> chess engine) 28-72-0, it also changed the narrative on AI applications. It demonstrated that (under perfect-view, static-environments) <HoverableText tooltip="Reinforcement Learning neural networks - AI systems that learn through trial and error, receiving rewards for good actions and penalties for bad ones">RL neural networks</HoverableText> could drastically outperform decades of work on handcrafted alpha-beta pruning algorithms. It also showed that AI would one day be able to master any static skill, and helped to validate use of RL and NN into the mainstream public. Every student now learns about DeepMind when learning AI history.
    </p>
    <br />

    <p>
      Then when Deepmind began working on Starcraft 2 (limited view, evolving environment), AlphaStar marked another key point in AI development— showing that AI can beat 99.9% of players even in imperfect view, evolving environments— helping to validate AI role in eventually traversing within real world (despite incomplete information, imperfect settings). Ex: autonomous vehicles.
    </p>
    <br />

    <p>
      Personally, it was also really really entertaining to watch, especially the games against Serral (highest ranked SC2 player), and it marked another real key progression in AI research. It demonstrated that AI was fully capable of managing the in-game worker economy, build complex armies, and respond to gameplay changes (cheeses, multi-pronged attacks, etc.) tbh, even another AI lab replicating the same thing today would still be an incredibly impressive feat.
    </p>
    <br />

    <p>
      Yet Starcraft 2 was DeepMind's last major work on games. So when Elon announced that xAI was moving into LOL, it got me really excited.
    </p>
    <br />

    <p>
      League of Legends is similar to SC2 in that players need to perform under time-sensitive, evolving environments, with imperfect information and painful punishments. Winning against T1 (the world's greatest LOL team), requires mastering similar skills, such as managing the minion resources, defeating objectives, crafting items, and reacting to dynamic developments. xAI's Grok competing vs T1 would be an incredibly entertaining watch, and if successful, would mark another major key point in AI development.
    </p>
    <br />

    <p>
      <a href="https://x.com/CMS_Flash" target="_blank" rel="noopener noreferrer">CMS_Flash</a> wrote a fun piece explaining many of the technical challenges and I recommend my readers also check that out: <a href="https://x.com/CMS_Flash/status/1993686753350427064" target="_blank" rel="noopener noreferrer">https://x.com/CMS_Flash/status/1993686753350427064</a>
    </p>
    <br />

    <p>
      Yet unlike StarCraft, LOL is also a 5v5 team game. Even in a 5v3 scenario, T1 would still absolutely dominate against a perfectly skilled Grok (with mastery over items crafting, <HoverableText tooltip="Macro = economy, resource management, and strategic decisions. Micro = precise unit control and mechanical skill">macro/micro</HoverableText> depths, ability timings, and champion knowledge). Why? Because winning a game of LOL at the competitive level, also requires communication and teamwork. With perfect control, Grok will probably win lane against Faker (a highly ranked player). Yet the Grok team would still lose against the T1 team 100/100 times, as collectively, T1 can plan long-term strategy, support initiatives, and coordinate combinations of abilities that force-multiply output.
    </p>
    <br />

    <p>
      So, if xAI manages to train Grok in a way that it is able to rival AlphaStar in <HoverableText tooltip="Macro = economy, resource management, and strategic decisions. Micro = precise unit control and mechanical skill">macro/micro</HoverableText>, AND also coordinate with its peer AIs in strategy, planning, and communication, then it would unironically mark the next era in AI intelligence. The emergence of future developments that comes from Grok's gameplay vs T1 will pave the way for an even richer AI future.
    </p>
    <br />

    <p>
      Currently, <HoverableText tooltip="Systems where multiple AI agents work together, requiring communication, shared strategy, and coordinated actions">multi-agent strategy and coordination</HoverableText> is still a very immature sector of AI systems, and isn't really performant/useful beyond very limited scenarios. If xAI's Grok manages to win, then they'll have effectively proved AI's role in the next few decades– demonstrating intelligence via not just knowledge, tool calling, memories, benchmarking, but also multi-agent teamwork and force-multiplying coordination (leveraging RTS games that mimic real world challenges).
    </p>
    <br />

    <p>
      As LLMs progress through current benchmarks, I predict that game-testing AIs will be the next major benchmark. Pokemon is already quite popular, and I predict other labs like Gemini, OpenAI, Anthropic, Alibaba, DeepSeek, Moonshot will start to also similarly build out LOL teams in the coming years :)
    </p>
    <br />
  </>
);


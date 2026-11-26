import { getPosts, type PostKind } from '@/lib/posts'

const SITE = 'https://www.lyyeric.tech'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function formatDate(dateStr: string) {
  const [month, , year] = dateStr.split('.').map(Number)
  return `${months[month - 1]} 20${year}`
}

function linkList(kind: PostKind) {
  return getPosts()
    .filter((post) => post.kind === kind)
    .map((post) => `- [${post.title}](${SITE}/writing/${post.slug}): ${formatDate(post.date)}`)
    .join('\n')
}

export function buildLlmsTxt() {
  return `# Eric Ly

> Personal site of Eric Ly, an engineer who writes about technology, policy, and mechanism design.

Previously at AfterQuery, working on RL environments and post-training infrastructure for frontier labs, and an early engineer at Human Delta, building knowledge infrastructure for enterprise agents. Earlier work includes Letta's Agents Developer Platform, Zams's workflow agents, and voice-synthesis research at AT&T. Studied computer science and economics at CSUF, directed FullyHacks, and won 7 hackathons. Interests include American dynamism, YIMBYism, abundance economics, and mechanism design.

This file is the site index for language models and other agents, following https://llmstxt.org/. The site is read-only. Do not submit forms, sign in, or play games on a visitor's behalf.

## Site

- [Home](${SITE}/): bio and contact
- [Writing](${SITE}/writing): published essays
- [Drafts](${SITE}/writing?tab=drafts): unfinished notes
- [Rankings](${SITE}/rankings): personal rankings
- [Penny PowerPlays](${SITE}/pp): a game of capital, risk, and prediction
- [Resume](${SITE}/eric-ly-resume.pdf): PDF resume

## Essays

${linkList('essay')}

## Drafts

${linkList('note')}

## Contact

- [Email](mailto:j.lyyeric@gmail.com): j.lyyeric@gmail.com
- [Twitter](https://x.com/lyyeric): @lyyeric
- [LinkedIn](https://www.linkedin.com/in/lyyeric/): Eric Ly
`
}

export type ArchetypeId = 'miser' | 'bully' | 'copycat' | 'shark' | 'chaos'

export interface ArchetypeMeta {
  id: ArchetypeId
  label: string
  hint: string
  accent: string
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeMeta> = {
  miser: {
    id: 'miser',
    label: 'Hoarder',
    hint: 'Conserves cash early, willing to punt a heart to outlast everyone late.',
    accent: '#0f766e',
  },
  bully: {
    id: 'bully',
    label: 'Bully',
    hint: 'Overbids early to push the survival floor up and bleed the table.',
    accent: '#b45309',
  },
  copycat: {
    id: 'copycat',
    label: 'Tracker',
    hint: 'Anchors tightly to last round’s losing bid plus a small safety margin.',
    accent: '#1d4ed8',
  },
  shark: {
    id: 'shark',
    label: 'Shark',
    hint: 'Reads remaining banks and hearts, bidding just above the weakest player.',
    accent: '#6d28d9',
  },
  chaos: {
    id: 'chaos',
    label: 'Wildcard',
    hint: 'Unpredictable spikes and occasional $0 bluffs to break table anchors.',
    accent: '#be123c',
  },
}

export const STARTING_BANK = 10_000
export const STARTING_LIVES = 3
export const INTEREST_RATE_OPTIONS = [0, 5, 10, 20] as const
export const ROUND_TIMER_OPTIONS = [0, 60, 120] as const

function snapToOption(value: number, options: readonly number[]): number {
  return options.reduce((best, option) =>
    Math.abs(option - value) < Math.abs(best - value) ? option : best
  )
}

export interface GameSettings {
  startingBank: number
  startingLives: number
  /** Percent earned each round on cash left after the bid. Survivors only. */
  interestRate: number
  bidStep: number
  roundTimerSec: number // 0 = no timer
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  startingBank: STARTING_BANK,
  startingLives: STARTING_LIVES,
  interestRate: 0,
  bidStep: 1,
  roundTimerSec: 60,
}

export function sanitizeGameSettings(raw?: Partial<GameSettings> | null): GameSettings {
  const startingBank = Math.max(
    100,
    Math.min(1_000_000, Math.round(Number(raw?.startingBank) || STARTING_BANK))
  )
  const startingLives = Math.max(
    1,
    Math.min(7, Math.round(Number(raw?.startingLives) || STARTING_LIVES))
  )
  const interestRate = snapToOption(
    Math.round(Number(raw?.interestRate) || 0),
    INTEREST_RATE_OPTIONS
  )
  const rawTimer = Math.round(
    Number(raw?.roundTimerSec ?? DEFAULT_GAME_SETTINGS.roundTimerSec)
  )
  const roundTimerSec = snapToOption(
    Number.isFinite(rawTimer) ? rawTimer : DEFAULT_GAME_SETTINGS.roundTimerSec,
    ROUND_TIMER_OPTIONS
  )

  return {
    startingBank,
    startingLives,
    interestRate,
    bidStep: 1,
    roundTimerSec,
  }
}

/** Cash left after a bid, plus interest if the player survived the round. */
export function bankAfterRound(
  bank: number,
  bid: number,
  interestRate: number,
  stillAlive: boolean
): number {
  const remaining = Math.max(0, bank - bid)
  if (!stillAlive || interestRate <= 0) return remaining
  return Math.round(remaining * (1 + interestRate / 100))
}

const NAME_PREFIXES = [
  'COOL',
  'SUPER',
  'HIP',
  'SMUG',
  'SILKY',
  'SAFE',
  'WARM',
  'RICH',
  'DARK',
  'SOFT',
  'BUFF',
  'DOPE',
]

const NAME_ANIMALS = [
  'BEAR',
  'FOX',
  'LAMB',
  'LION',
  'BOAR',
  'GOAT',
  'VOLE',
  'SEAL',
  'PUMA',
  'MULE',
  'BULL',
  'CROW',
]

export interface Player {
  id: string
  name: string
  isHuman: boolean
  archetype?: ArchetypeId
  bank: number
  lives: number
  alive: boolean
  eliminatedRound: number | null
  lastBid: number | null
  totalContributed: number
  bankHistory: number[]
  bidHistory: Array<number | null>
  heartsLostHistory: number[]
}

export interface RoundRecord {
  round: number
  bids: Record<string, number>
  minBid: number
  maxBid: number
  safeFloor: number | null
  losers: string[]
  eliminated: string[]
  potAdded: number
  tiebreakerSaved?: string
  commentary: string
}

export interface MatchState {
  mode: 'ai' | 'pass-and-play'
  settings?: GameSettings
  round: number
  phase: 'bidding' | 'reveal' | 'finished'
  players: Player[]
  history: RoundRecord[]
  totalPot: number
  winnerIds: string[]
  mutualRuin: boolean
}

function clampBid(amount: number, bank: number): number {
  if (!Number.isFinite(amount)) return 0
  return Math.max(0, Math.min(bank, Math.round(amount)))
}

function roundToStep(amount: number, bank: number, step = 50): number {
  if (amount >= bank) return bank
  if (amount <= 0) return 0
  const safeStep = Math.max(1, step)
  return clampBid(Math.round(amount / safeStep) * safeStep, bank)
}

export function pickUniqueNames(count: number, exclude: Set<string>): string[] {
  const results: string[] = []
  const used = new Set(exclude)
  let guard = 0
  while (results.length < count && guard < 200) {
    guard++
    const p = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)]
    const a = NAME_ANIMALS[Math.floor(Math.random() * NAME_ANIMALS.length)]
    const candidate = `${p} ${a}`
    if (!used.has(candidate)) {
      used.add(candidate)
      results.push(candidate)
    }
  }
  while (results.length < count) {
    results.push(`DEBTOR ${results.length + 1}`)
  }
  return results
}

const DEFAULT_BOT_NAMES = [
  'DARK PUMA',
  'SILKY VOLE',
  'BUFF BOAR',
  'SMUG FOX',
  'DOPE GOAT',
  'COOL CROW',
]

export function createMatch(options: {
  mode: 'ai' | 'pass-and-play'
  playerCount: number
  humanNames: string[]
  deterministic?: boolean
}): MatchState {
  const count = Math.max(2, Math.min(6, options.playerCount))
  const players: Player[] = []

  if (options.mode === 'ai') {
    const humanName = options.humanNames[0]?.trim() || 'YOU'
    players.push({
      id: 'p-0',
      name: humanName,
      isHuman: true,
      bank: STARTING_BANK,
      lives: STARTING_LIVES,
      alive: true,
      eliminatedRound: null,
      lastBid: null,
      totalContributed: 0,
      bankHistory: [STARTING_BANK],
      bidHistory: [],
      heartsLostHistory: [],
    })

    const archetypeOrder: ArchetypeId[] = ['shark', 'miser', 'bully', 'copycat', 'chaos']
    const orderedArchetypes = options.deterministic
      ? archetypeOrder
      : [...archetypeOrder].sort(() => Math.random() - 0.5)
    const botNames = options.deterministic
      ? DEFAULT_BOT_NAMES.slice(0, count - 1)
      : pickUniqueNames(count - 1, new Set([humanName.toUpperCase()]))

    for (let i = 0; i < count - 1; i++) {
      players.push({
        id: `p-${i + 1}`,
        name: botNames[i],
        isHuman: false,
        archetype: orderedArchetypes[i % orderedArchetypes.length],
        bank: STARTING_BANK,
        lives: STARTING_LIVES,
        alive: true,
        eliminatedRound: null,
        lastBid: null,
        totalContributed: 0,
        bankHistory: [STARTING_BANK],
        bidHistory: [],
        heartsLostHistory: [],
      })
    }
  } else {
    for (let i = 0; i < count; i++) {
      const label = options.humanNames[i]?.trim() || `DEBTOR ${i + 1}`
      players.push({
        id: `p-${i}`,
        name: label,
        isHuman: true,
        bank: STARTING_BANK,
        lives: STARTING_LIVES,
        alive: true,
        eliminatedRound: null,
        lastBid: null,
        totalContributed: 0,
        bankHistory: [STARTING_BANK],
        bidHistory: [],
        heartsLostHistory: [],
      })
    }
  }

  return {
    mode: options.mode,
    round: 1,
    phase: 'bidding',
    players,
    history: [],
    totalPot: 0,
    winnerIds: [],
    mutualRuin: false,
  }
}

export function computeAiBid(player: Player, state: MatchState): number {
  if (!player.alive || player.bank <= 0) return 0

  const settings = sanitizeGameSettings(state.settings)
  const step = settings.bidStep
  const startBank = settings.startingBank
  const scale = startBank / STARTING_BANK

  const alive = state.players.filter((p) => p.alive)
  const opponents = alive.filter((p) => p.id !== player.id)
  if (opponents.length === 0) return 0

  const lastRound = state.history[state.history.length - 1] ?? null
  const oppBanks = opponents.map((o) => o.bank).sort((a, b) => a - b)
  const minOppBank = oppBanks[0]
  const maxOppBank = oppBanks[oppBanks.length - 1]
  const avgOppBank = oppBanks.reduce((s, v) => s + v, 0) / oppBanks.length

  // Guaranteed-safe cap: beating the poorest opponent by one step guarantees you aren't sole lowest
  const beatPoorestCap = Math.min(player.bank, minOppBank + step)

  // Heads-up endgame (1v1): pure war of attrition
  if (opponents.length === 1) {
    const opp = opponents[0]
    if (player.bank > opp.bank && opp.lives === 1) {
      return Math.min(player.bank, opp.bank + step)
    }
    if (opp.bank === 0) {
      return Math.min(player.bank, step)
    }
    if (player.lives > 1 && player.lives >= opp.lives && Math.random() < 0.32) {
      return 0
    }
    const base1v1 = Math.min(player.bank, opp.bank * (0.28 + Math.random() * 0.28))
    return roundToStep(base1v1, player.bank, step)
  }

  // Estimate expected survival floor based on history or round-1 baseline
  const lastCutoff = lastRound
    ? lastRound.safeFloor ?? lastRound.minBid + Math.max(step, 200 * scale)
    : (950 + Math.floor(Math.random() * 450)) * scale

  // Scale expected floor down as table liquidity shrinks
  const liquidityRatio = Math.min(1, avgOppBank / Math.max(1, startBank))
  const scaledFloor = Math.max(
    step,
    Math.min(lastCutoff * (0.85 + 0.25 * liquidityRatio), avgOppBank * 0.42)
  )

  const urgency = player.lives === 1 ? 1.38 : player.lives === 2 ? 1.06 : 0.88
  const noise = 0.84 + Math.random() * 0.34
  let target = scaledFloor * urgency * noise

  switch (player.archetype) {
    case 'miser': {
      if (player.lives >= settings.startingLives && scaledFloor > 1150 * scale && Math.random() < 0.45) {
        return 0
      }
      target = scaledFloor * (player.lives === 1 ? 1.25 : 0.72) * noise
      break
    }
    case 'bully': {
      target = scaledFloor * (state.round <= 3 ? 1.38 : 1.12) * noise
      break
    }
    case 'copycat': {
      const anchor = lastRound ? lastRound.minBid + Math.max(step, 250 * scale) : 1200 * scale
      target = anchor * (player.lives === 1 ? 1.3 : 1.02) * (0.9 + Math.random() * 0.22)
      break
    }
    case 'shark': {
      if (minOppBank < scaledFloor * 0.9 && player.bank > minOppBank) {
        target = minOppBank + step + (Math.random() < 0.35 ? step * 2 : 0)
      } else if (player.lives >= settings.startingLives && player.bank < avgOppBank * 0.85 && Math.random() < 0.4) {
        return 0
      } else {
        target = scaledFloor * (player.lives === 1 ? 1.32 : 1.05) * (0.92 + Math.random() * 0.18)
      }
      break
    }
    case 'chaos': {
      const roll = Math.random()
      if (player.lives > 1 && roll < 0.24) {
        return 0
      }
      if (roll > 0.76) {
        target = Math.min(player.bank * 0.48, scaledFloor * 1.75)
      } else {
        target = scaledFloor * (0.65 + Math.random() * 0.85)
      }
      break
    }
    default:
      break
  }

  if (player.archetype !== 'bully' && minOppBank === 0 && player.bank >= step) {
    return step
  }
  if (player.archetype !== 'bully' && beatPoorestCap < target && player.lives > 1) {
    target = Math.min(target, beatPoorestCap + step * 2)
  }
  target = Math.min(target, maxOppBank + step)

  if (player.lives === 1 && target < step * 2 && player.bank >= step * 2) {
    target = Math.min(player.bank, Math.max(step * 3, beatPoorestCap))
  }

  return roundToStep(target, player.bank, step)
}

function buildCommentary(params: {
  losers: Player[]
  eliminated: Player[]
  minBid: number
  maxBid: number
  safeFloor: number | null
  tiebreakerSaved?: Player
}): string {
  const { losers, eliminated, minBid, maxBid, safeFloor, tiebreakerSaved } = params

  if (tiebreakerSaved) {
    return `Mutual floor collapse at $${minBid.toLocaleString()} — ${tiebreakerSaved.name} survives on superior reserves.`
  }
  if (eliminated.length > 0) {
    const names = eliminated.map((p) => p.name).join(' & ')
    return `${names} liquidated at $${minBid.toLocaleString()}. Payday Corp thanks them for their contribution.`
  }
  if (losers.length > 1) {
    const names = losers.map((p) => p.name).join(' & ')
    return `${names} tied at the floor ($${minBid.toLocaleString()}) — all tied debtors lose a heart.`
  }
  const loser = losers[0]
  if (minBid === 0) {
    return `${loser.name} punted $0 and traded a heart for liquidity.`
  }
  if (safeFloor !== null && maxBid - safeFloor >= 1200) {
    return `${loser.name} fell short at $${minBid.toLocaleString()} while someone overpaid by $${(maxBid - safeFloor).toLocaleString()}.`
  }
  if (safeFloor !== null && safeFloor - minBid <= 150) {
    return `Razor-thin margin: ${loser.name} missed survival by just $${(safeFloor - minBid).toLocaleString()}.`
  }
  return `${loser.name} posted the lowest tribute ($${minBid.toLocaleString()}) and lost a heart.`
}

export function resolveRound(
  state: MatchState,
  humanBids: Record<string, number>
): MatchState {
  const alivePlayers = state.players.filter((p) => p.alive)
  const bids: Record<string, number> = {}

  for (const player of alivePlayers) {
    if (player.isHuman) {
      bids[player.id] = clampBid(humanBids[player.id] ?? 0, player.bank)
    } else {
      bids[player.id] = computeAiBid(player, state)
    }
  }

  const bidValues = alivePlayers.map((p) => bids[p.id])
  const minBid = Math.min(...bidValues)
  const maxBid = Math.max(...bidValues)
  const aboveMin = bidValues.filter((v) => v > minBid)
  const safeFloor = aboveMin.length > 0 ? Math.min(...aboveMin) : null
  const potAdded = bidValues.reduce((sum, v) => sum + v, 0)

  const initialLosers = alivePlayers.filter((p) => bids[p.id] === minBid)
  const loserIdSet = new Set(initialLosers.map((p) => p.id))

  // Check if everyone remaining would die on the exact same round
  const wouldAllDie = alivePlayers.every((p) => {
    const nextLives = loserIdSet.has(p.id) ? p.lives - 1 : p.lives
    return nextLives <= 0
  })

  let tiebreakerSavedId: string | undefined
  if (wouldAllDie && alivePlayers.length > 1) {
    const remainingBanks = alivePlayers.map((p) => ({
      id: p.id,
      afterBank: p.bank - bids[p.id],
    }))
    const bestBank = Math.max(...remainingBanks.map((r) => r.afterBank))
    const richest = remainingBanks.filter((r) => r.afterBank === bestBank)
    if (richest.length === 1) {
      tiebreakerSavedId = richest[0].id
      loserIdSet.delete(tiebreakerSavedId)
    }
  }

  const settings = sanitizeGameSettings(state.settings)
  const eliminatedIds: string[] = []
  const nextPlayers: Player[] = state.players.map((p) => {
    if (!p.alive) {
      return {
        ...p,
        lastBid: null,
        bankHistory: [...p.bankHistory, p.bank],
        bidHistory: [...p.bidHistory, null],
        heartsLostHistory: [...p.heartsLostHistory, 0],
      }
    }

    const bid = bids[p.id]
    const lostHeart = loserIdSet.has(p.id) ? 1 : 0
    const nextLives = Math.max(0, p.lives - lostHeart)
    const stillAlive = nextLives > 0
    const nextBank = bankAfterRound(p.bank, bid, settings.interestRate, stillAlive)

    if (!stillAlive) {
      eliminatedIds.push(p.id)
    }

    return {
      ...p,
      bank: nextBank,
      lives: nextLives,
      alive: stillAlive,
      eliminatedRound: stillAlive ? null : state.round,
      lastBid: bid,
      totalContributed: p.totalContributed + bid,
      bankHistory: [...p.bankHistory, nextBank],
      bidHistory: [...p.bidHistory, bid],
      heartsLostHistory: [...p.heartsLostHistory, lostHeart],
    }
  })

  const losers = nextPlayers.filter((p) => loserIdSet.has(p.id))
  const eliminated = nextPlayers.filter((p) => eliminatedIds.includes(p.id))
  const tiebreakerSaved = tiebreakerSavedId
    ? nextPlayers.find((p) => p.id === tiebreakerSavedId)
    : undefined

  const record: RoundRecord = {
    round: state.round,
    bids,
    minBid,
    maxBid,
    safeFloor,
    losers: losers.map((p) => p.id),
    eliminated: eliminatedIds,
    potAdded,
    tiebreakerSaved: tiebreakerSavedId,
    commentary: buildCommentary({
      losers,
      eliminated,
      minBid,
      maxBid,
      safeFloor,
      tiebreakerSaved,
    }),
  }

  const survivors = nextPlayers.filter((p) => p.alive)
  const isFinished = survivors.length <= 1

  return {
    ...state,
    phase: isFinished ? 'finished' : 'reveal',
    players: nextPlayers,
    history: [...state.history, record],
    totalPot: state.totalPot + potAdded,
    winnerIds: isFinished ? survivors.map((p) => p.id) : [],
    mutualRuin: isFinished && survivors.length === 0,
  }
}

export function advanceToNextRound(state: MatchState): MatchState {
  if (state.phase !== 'reveal') return state
  return {
    ...state,
    round: state.round + 1,
    phase: 'bidding',
  }
}

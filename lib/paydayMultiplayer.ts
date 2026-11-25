'use client'

import type { User } from 'firebase/auth'
import {
  get,
  onValue,
  ref,
  remove,
  runTransaction,
  set,
  update,
} from 'firebase/database'
import { getFirebaseDatabase } from './firebaseAuth'
import {
  DEFAULT_GAME_SETTINGS,
  pickUniqueNames,
  resolveRound,
  sanitizeGameSettings,
  type ArchetypeId,
  type GameSettings,
  type MatchState,
  type Player,
  type RoundRecord,
} from './paydayPurgatory'

export interface OnlinePlayer {
  id: string
  name: string
  photoURL: string | null
  isHuman: boolean
  archetype: ArchetypeId | null
  bank: number
  lives: number
  alive: boolean
  ready: boolean
  currentBid: number | null
  lastBid: number | null
  eliminatedRound: number | null
  totalContributed: number
  joinedAt: number
  bankHistory: number[]
  bidHistory: Array<number | null>
  heartsLostHistory: number[]
}

export interface OnlineRoundRecord {
  round: number
  bids: Record<string, number>
  minBid: number
  maxBid: number
  safeFloor: number | null
  losers: string[]
  eliminated: string[]
  potAdded: number
  tiebreakerSaved: string | null
  commentary: string
}

export interface OnlineRoom {
  code: string
  hostId: string
  status: 'lobby' | 'bidding' | 'finished'
  locked: boolean
  settings: GameSettings
  round: number
  roundDeadline: number | null
  totalPot: number
  mutualRuin: boolean
  winnerIds: string[]
  createdAt: number
  updatedAt: number
  players: Record<string, OnlinePlayer>
  history: OnlineRoundRecord[]
}

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const BOT_ARCHETYPES: ArchetypeId[] = ['shark', 'miser', 'bully', 'copycat', 'chaos']

export function normalizeRoomCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
}

export function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)]
  }
  return code
}

function makeFreshPlayer(params: {
  id: string
  name: string
  photoURL: string | null
  isHuman: boolean
  archetype: ArchetypeId | null
  joinedAt: number
  settings?: GameSettings
}): OnlinePlayer {
  const cfg = sanitizeGameSettings(params.settings)
  return {
    id: params.id,
    name: params.name.trim().slice(0, 18) || 'DEBTOR',
    photoURL: params.photoURL,
    isHuman: params.isHuman,
    archetype: params.archetype,
    bank: cfg.startingBank,
    lives: cfg.startingLives,
    alive: true,
    ready: false,
    currentBid: null,
    lastBid: null,
    eliminatedRound: null,
    totalContributed: 0,
    joinedAt: params.joinedAt,
    bankHistory: [cfg.startingBank],
    bidHistory: [],
    heartsLostHistory: [],
  }
}

function toArray<T>(value: unknown): T[] {
  if (!value) return []
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, T>)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => (value as Record<string, T>)[k])
  }
  return []
}

export function normalizeRoom(raw: unknown, fallbackCode: string): OnlineRoom | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const settings = sanitizeGameSettings(r.settings as Partial<GameSettings> | undefined)
  const rawPlayers = (r.players as Record<string, Record<string, unknown>> | undefined) ?? {}
  const players: Record<string, OnlinePlayer> = {}

  for (const [id, p] of Object.entries(rawPlayers)) {
    if (!p || typeof p !== 'object') continue
    const bank = typeof p.bank === 'number' ? p.bank : settings.startingBank
    const lives = typeof p.lives === 'number' ? p.lives : settings.startingLives
    players[id] = {
      id,
      name: typeof p.name === 'string' && p.name.trim() ? p.name : 'DEBTOR',
      photoURL: typeof p.photoURL === 'string' && p.photoURL ? p.photoURL : null,
      isHuman: p.isHuman !== false,
      archetype: (p.archetype as ArchetypeId | null) ?? null,
      bank,
      lives,
      alive: p.alive !== false && lives > 0,
      ready: p.ready === true,
      currentBid: typeof p.currentBid === 'number' ? p.currentBid : null,
      lastBid: typeof p.lastBid === 'number' ? p.lastBid : null,
      eliminatedRound: typeof p.eliminatedRound === 'number' ? p.eliminatedRound : null,
      totalContributed: typeof p.totalContributed === 'number' ? p.totalContributed : 0,
      joinedAt: typeof p.joinedAt === 'number' ? p.joinedAt : 0,
      bankHistory: toArray<number>(p.bankHistory).length > 0 ? toArray<number>(p.bankHistory) : [bank],
      bidHistory: toArray<number | null>(p.bidHistory),
      heartsLostHistory: toArray<number>(p.heartsLostHistory),
    }
  }

  const history: OnlineRoundRecord[] = toArray<Record<string, unknown>>(r.history).map((item, idx) => ({
    round: typeof item.round === 'number' ? item.round : idx + 1,
    bids: (item.bids as Record<string, number>) ?? {},
    minBid: typeof item.minBid === 'number' ? item.minBid : 0,
    maxBid: typeof item.maxBid === 'number' ? item.maxBid : 0,
    safeFloor: typeof item.safeFloor === 'number' ? item.safeFloor : null,
    losers: toArray<string>(item.losers),
    eliminated: toArray<string>(item.eliminated),
    potAdded: typeof item.potAdded === 'number' ? item.potAdded : 0,
    tiebreakerSaved: typeof item.tiebreakerSaved === 'string' ? item.tiebreakerSaved : null,
    commentary: typeof item.commentary === 'string' ? item.commentary : '',
  }))

  return {
    code: typeof r.code === 'string' ? r.code : fallbackCode,
    hostId: typeof r.hostId === 'string' ? r.hostId : '',
    status: r.status === 'bidding' || r.status === 'finished' ? r.status : 'lobby',
    locked: r.locked === true,
    settings,
    round: typeof r.round === 'number' ? r.round : 1,
    roundDeadline: typeof r.roundDeadline === 'number' ? r.roundDeadline : null,
    totalPot: typeof r.totalPot === 'number' ? r.totalPot : 0,
    mutualRuin: r.mutualRuin === true,
    winnerIds: toArray<string>(r.winnerIds),
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : Date.now(),
    players,
    history,
  }
}

export function getSortedPlayers(room: OnlineRoom): OnlinePlayer[] {
  return Object.values(room.players).sort((a, b) => a.joinedAt - b.joinedAt)
}

function requireDb() {
  const db = getFirebaseDatabase()
  if (!db) throw new Error('Firebase Realtime Database is only available in the browser.')
  return db
}

export async function createOnlineRoom(user: User, displayName?: string): Promise<string> {
  const db = requireDb()
  const now = Date.now()
  const name = (displayName?.trim() || user.displayName || user.email?.split('@')[0] || 'PLAYER').slice(0, 18)

  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateRoomCode()
    const roomRef = ref(db, `rooms/${code}`)
    const existing = await get(roomRef)
    if (existing.exists()) continue

    const player = makeFreshPlayer({
      id: user.uid,
      name,
      photoURL: user.photoURL ?? null,
      isHuman: true,
      archetype: null,
      joinedAt: now,
    })

    const room: OnlineRoom = {
      code,
      hostId: user.uid,
      status: 'lobby',
      locked: false,
      settings: { ...DEFAULT_GAME_SETTINGS },
      round: 1,
      roundDeadline: null,
      totalPot: 0,
      mutualRuin: false,
      winnerIds: [],
      createdAt: now,
      updatedAt: now,
      players: { [user.uid]: player },
      history: [],
    }

    await set(roomRef, room)
    return code
  }

  throw new Error('Could not allocate a unique room code. Please try again.')
}

export async function joinOnlineRoom(
  rawCode: string,
  user: User,
  displayName?: string
): Promise<string> {
  const db = requireDb()
  const code = normalizeRoomCode(rawCode)
  if (!code) throw new Error('Enter a valid room code.')

  const roomRef = ref(db, `rooms/${code}`)
  const now = Date.now()
  const name = (displayName?.trim() || user.displayName || user.email?.split('@')[0] || 'PLAYER').slice(0, 18)

  const snapshot = await get(roomRef)

  if (!snapshot.exists()) {
    if (code === 'PUBLIC') {
      const player = makeFreshPlayer({
        id: user.uid,
        name,
        photoURL: user.photoURL ?? null,
        isHuman: true,
        archetype: null,
        joinedAt: now,
      })
      const freshPublic: OnlineRoom = {
        code: 'PUBLIC',
        hostId: user.uid,
        status: 'lobby',
        locked: false,
        settings: { ...DEFAULT_GAME_SETTINGS },
        round: 1,
        roundDeadline: null,
        totalPot: 0,
        mutualRuin: false,
        winnerIds: [],
        createdAt: now,
        updatedAt: now,
        players: { [user.uid]: player },
        history: [],
      }
      await set(roomRef, freshPublic)
      return 'PUBLIC'
    }
    throw new Error(`Room "${code}" not found. Double-check the code or create a new room.`)
  }

  const room = normalizeRoom(snapshot.val(), code)
  if (!room) throw new Error(`Room "${code}" is unavailable.`)

  // Already seated? Re-join seamlessly (even if match is in progress!)
  if (room.players[user.uid]) {
    await update(ref(db, `rooms/${code}`), { updatedAt: now })
    return code
  }

  const humanCount = Object.values(room.players).filter((p) => p.isHuman).length

  // If the public room is empty or finished and stale, reset it for the incoming player
  if (code === 'PUBLIC' && (humanCount === 0 || (room.status === 'finished' && now - room.updatedAt > 120_000))) {
    const player = makeFreshPlayer({
      id: user.uid,
      name,
      photoURL: user.photoURL ?? null,
      isHuman: true,
      archetype: null,
      joinedAt: now,
    })
    const resetPublic: OnlineRoom = {
      code: 'PUBLIC',
      hostId: user.uid,
      status: 'lobby',
      locked: false,
      settings: { ...DEFAULT_GAME_SETTINGS },
      round: 1,
      roundDeadline: null,
      totalPot: 0,
      mutualRuin: false,
      winnerIds: [],
      createdAt: now,
      updatedAt: now,
      players: { [user.uid]: player },
      history: [],
    }
    await set(roomRef, resetPublic)
    return 'PUBLIC'
  }

  if (room.locked || room.status === 'bidding') {
    throw new Error(`Room "${code}" is locked or already in session.`)
  }

  const newPlayer = makeFreshPlayer({
    id: user.uid,
    name,
    photoURL: user.photoURL ?? null,
    isHuman: true,
    archetype: null,
    joinedAt: now,
    settings: room.settings,
  })

  const updates: Record<string, unknown> = {
    [`players/${user.uid}`]: newPlayer,
    updatedAt: now,
  }
  if (!room.hostId || !room.players[room.hostId]) {
    updates.hostId = user.uid
  }
  await update(roomRef, updates)
  return code
}

export function subscribeRoom(
  code: string,
  onUpdate: (room: OnlineRoom | null) => void,
  onError?: (error: Error) => void
): () => void {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)
  return onValue(
    roomRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null)
        return
      }
      onUpdate(normalizeRoom(snapshot.val(), code))
    },
    (err) => {
      onError?.(err)
    }
  )
}

export async function updateOnlinePlayerName(
  code: string,
  uid: string,
  name: string
): Promise<void> {
  const trimmed = name.trim().slice(0, 18)
  if (!trimmed) return
  const db = requireDb()
  await update(ref(db, `rooms/${code}/players/${uid}`), { name: trimmed })
}

export async function addAiBotToRoom(code: string): Promise<void> {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)
  await runTransaction(roomRef, (raw) => {
    if (!raw) return raw
    const room = normalizeRoom(raw, code)
    if (!room || room.status !== 'lobby') return raw
    const existingPlayers = Object.values(room.players)

    const existingNames = new Set(existingPlayers.map((p) => p.name.toUpperCase()))
    const [botName] = pickUniqueNames(1, existingNames)
    const botCount = existingPlayers.filter((p) => !p.isHuman).length
    const archetype = BOT_ARCHETYPES[botCount % BOT_ARCHETYPES.length]
    const botId = `bot-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`

    room.players[botId] = makeFreshPlayer({
      id: botId,
      name: botName,
      photoURL: null,
      isHuman: false,
      archetype,
      joinedAt: Date.now(),
      settings: room.settings,
    })
    room.updatedAt = Date.now()
    return room
  })
}

export async function updateRoomSettings(
  code: string,
  partial: Partial<GameSettings>
): Promise<void> {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)
  await runTransaction(roomRef, (raw) => {
    if (!raw) return raw
    const room = normalizeRoom(raw, code)
    if (!room || room.status !== 'lobby') return raw

    const nextSettings = sanitizeGameSettings({ ...room.settings, ...partial })
    const updatedPlayers: Record<string, OnlinePlayer> = {}
    for (const p of Object.values(room.players)) {
      updatedPlayers[p.id] = makeFreshPlayer({
        id: p.id,
        name: p.name,
        photoURL: p.photoURL,
        isHuman: p.isHuman,
        archetype: p.archetype,
        joinedAt: p.joinedAt,
        settings: nextSettings,
      })
    }

    return {
      ...room,
      settings: nextSettings,
      players: updatedPlayers,
      updatedAt: Date.now(),
    }
  })
}

export async function removePlayerFromRoom(code: string, targetId: string): Promise<void> {
  const db = requireDb()
  await remove(ref(db, `rooms/${code}/players/${targetId}`))
}

export async function toggleRoomLock(code: string, locked: boolean): Promise<void> {
  const db = requireDb()
  await update(ref(db, `rooms/${code}`), { locked, updatedAt: Date.now() })
}

export async function startOnlineMatch(code: string): Promise<void> {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)
  await runTransaction(roomRef, (raw) => {
    if (!raw) return raw
    const room = normalizeRoom(raw, code)
    if (!room) return raw
    const playersList = Object.values(room.players)
    if (playersList.length < 2) return raw

    const cfg = sanitizeGameSettings(room.settings)
    const now = Date.now()
    const resetPlayers: Record<string, OnlinePlayer> = {}
    for (const p of playersList) {
      resetPlayers[p.id] = makeFreshPlayer({
        id: p.id,
        name: p.name,
        photoURL: p.photoURL,
        isHuman: p.isHuman,
        archetype: p.archetype,
        joinedAt: p.joinedAt,
        settings: cfg,
      })
    }

    return {
      ...room,
      settings: cfg,
      status: 'bidding',
      locked: true,
      round: 1,
      roundDeadline: cfg.roundTimerSec > 0 ? now + cfg.roundTimerSec * 1000 : null,
      totalPot: 0,
      mutualRuin: false,
      winnerIds: [],
      history: [],
      players: resetPlayers,
      updatedAt: now,
    }
  })
}

export async function resetOnlineRoomToLobby(code: string): Promise<void> {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)
  await runTransaction(roomRef, (raw) => {
    if (!raw) return raw
    const room = normalizeRoom(raw, code)
    if (!room) return raw

    const cfg = sanitizeGameSettings(room.settings)
    const resetPlayers: Record<string, OnlinePlayer> = {}
    for (const p of Object.values(room.players)) {
      resetPlayers[p.id] = makeFreshPlayer({
        id: p.id,
        name: p.name,
        photoURL: p.photoURL,
        isHuman: p.isHuman,
        archetype: p.archetype,
        joinedAt: p.joinedAt,
        settings: cfg,
      })
    }

    return {
      ...room,
      settings: cfg,
      status: 'lobby',
      locked: false,
      round: 1,
      roundDeadline: null,
      totalPot: 0,
      mutualRuin: false,
      winnerIds: [],
      history: [],
      players: resetPlayers,
      updatedAt: Date.now(),
    }
  })
}

function buildMatchStateFromRoom(room: OnlineRoom): MatchState {
  const sorted = getSortedPlayers(room)
  const players: Player[] = sorted.map((p) => ({
    id: p.id,
    name: p.name,
    isHuman: p.isHuman,
    archetype: p.archetype ?? undefined,
    bank: p.bank,
    lives: p.lives,
    alive: p.alive,
    eliminatedRound: p.eliminatedRound,
    lastBid: p.lastBid,
    totalContributed: p.totalContributed,
    bankHistory: p.bankHistory,
    bidHistory: p.bidHistory,
    heartsLostHistory: p.heartsLostHistory,
  }))

  const history: RoundRecord[] = room.history.map((h) => ({
    round: h.round,
    bids: h.bids,
    minBid: h.minBid,
    maxBid: h.maxBid,
    safeFloor: h.safeFloor,
    losers: h.losers,
    eliminated: h.eliminated,
    potAdded: h.potAdded,
    tiebreakerSaved: h.tiebreakerSaved ?? undefined,
    commentary: h.commentary,
  }))

  return {
    mode: 'pass-and-play',
    settings: sanitizeGameSettings(room.settings),
    round: room.round,
    phase: 'bidding',
    players,
    history,
    totalPot: room.totalPot,
    winnerIds: room.winnerIds,
    mutualRuin: room.mutualRuin,
  }
}

function resolveIfAllReady(room: OnlineRoom, forceTimeout = false): OnlineRoom {
  if (room.status !== 'bidding') return room
  const aliveHumans = Object.values(room.players).filter((p) => p.alive && p.isHuman)
  const aliveAll = Object.values(room.players).filter((p) => p.alive)
  const now = Date.now()
  if (aliveAll.length <= 1) {
    return {
      ...room,
      status: 'finished',
      roundDeadline: null,
      winnerIds: aliveAll.map((p) => p.id),
      mutualRuin: aliveAll.length === 0,
      updatedAt: now,
    }
  }

  // Wait until every alive human has locked in a bid (unless timer expired)
  if (!forceTimeout && aliveHumans.length > 0 && !aliveHumans.every((p) => p.ready && p.currentBid !== null)) {
    return room
  }

  const humanBids: Record<string, number> = {}
  for (const h of aliveHumans) {
    humanBids[h.id] = h.ready && h.currentBid !== null ? h.currentBid : 0
  }

  const engineState = buildMatchStateFromRoom(room)
  const resolved = resolveRound(engineState, humanBids)

  const nextPlayers: Record<string, OnlinePlayer> = {}
  for (const resolvedPlayer of resolved.players) {
    const prev = room.players[resolvedPlayer.id]
    nextPlayers[resolvedPlayer.id] = {
      id: resolvedPlayer.id,
      name: resolvedPlayer.name,
      photoURL: prev?.photoURL ?? null,
      isHuman: resolvedPlayer.isHuman,
      archetype: resolvedPlayer.archetype ?? null,
      bank: resolvedPlayer.bank,
      lives: resolvedPlayer.lives,
      alive: resolvedPlayer.alive,
      ready: false,
      currentBid: null,
      lastBid: resolvedPlayer.lastBid,
      eliminatedRound: resolvedPlayer.eliminatedRound,
      totalContributed: resolvedPlayer.totalContributed,
      joinedAt: prev?.joinedAt ?? now,
      bankHistory: resolvedPlayer.bankHistory,
      bidHistory: resolvedPlayer.bidHistory,
      heartsLostHistory: resolvedPlayer.heartsLostHistory,
    }
  }

  const nextHistory: OnlineRoundRecord[] = resolved.history.map((h) => ({
    round: h.round,
    bids: h.bids,
    minBid: h.minBid,
    maxBid: h.maxBid,
    safeFloor: h.safeFloor,
    losers: h.losers,
    eliminated: h.eliminated,
    potAdded: h.potAdded,
    tiebreakerSaved: h.tiebreakerSaved ?? null,
    commentary: h.commentary,
  }))

  const isFinished = resolved.phase === 'finished'
  const cfg = sanitizeGameSettings(room.settings)

  return {
    ...room,
    status: isFinished ? 'finished' : 'bidding',
    round: isFinished ? room.round : room.round + 1,
    roundDeadline:
      !isFinished && cfg.roundTimerSec > 0 ? now + cfg.roundTimerSec * 1000 : null,
    totalPot: resolved.totalPot,
    mutualRuin: resolved.mutualRuin,
    winnerIds: resolved.winnerIds,
    players: nextPlayers,
    history: nextHistory,
    updatedAt: now,
  }
}

export async function resolveTimedOutRound(code: string, expectedRound: number): Promise<void> {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)
  await runTransaction(roomRef, (raw) => {
    if (!raw) return raw
    const room = normalizeRoom(raw, code)
    if (!room || room.status !== 'bidding' || room.round !== expectedRound) return raw
    if (!room.roundDeadline || Date.now() < room.roundDeadline) return raw
    return resolveIfAllReady(room, true)
  })
}

export async function submitOnlineBid(
  code: string,
  uid: string,
  rawAmount: number
): Promise<void> {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)

  await runTransaction(roomRef, (raw) => {
    if (!raw) return raw
    const room = normalizeRoom(raw, code)
    if (!room || room.status !== 'bidding') return raw
    const player = room.players[uid]
    if (!player || !player.alive) return raw

    const clamped = Math.max(0, Math.min(player.bank, Math.round(rawAmount)))
    room.players[uid] = {
      ...player,
      ready: true,
      currentBid: clamped,
    }
    room.updatedAt = Date.now()

    return resolveIfAllReady(room)
  })
}

export async function advanceBotOnlyRound(code: string): Promise<void> {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)
  await runTransaction(roomRef, (raw) => {
    if (!raw) return raw
    const room = normalizeRoom(raw, code)
    if (!room || room.status !== 'bidding') return raw
    return resolveIfAllReady(room)
  })
}

export async function leaveOnlineRoom(code: string, uid: string): Promise<void> {
  const db = requireDb()
  const roomRef = ref(db, `rooms/${code}`)

  let shouldDeleteRoom = false

  await runTransaction(roomRef, (raw) => {
    if (!raw) return raw
    const room = normalizeRoom(raw, code)
    if (!room) return raw

    if (!room.players[uid]) return raw
    delete room.players[uid]

    const remainingHumans = getSortedPlayers(room).filter((p) => p.isHuman)
    if (remainingHumans.length === 0) {
      shouldDeleteRoom = true
      return null
    }

    if (room.hostId === uid) {
      room.hostId = remainingHumans[0].id
    }
    room.updatedAt = Date.now()

    if (room.status === 'bidding') {
      return resolveIfAllReady(room)
    }

    return room
  })

  if (shouldDeleteRoom) {
    await remove(roomRef).catch(() => {})
  }
}

'use client'

import type { User } from 'firebase/auth'
import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Crown,
  DoorOpen,
  FastForward,
  Lock,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Unlock,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addAiBotToRoom,
  advanceBotOnlyRound,
  createOnlineRoom,
  getSortedPlayers,
  joinOnlineRoom,
  leaveOnlineRoom,
  normalizeRoomCode,
  removePlayerFromRoom,
  resetOnlineRoomToLobby,
  resolveTimedOutRound,
  startOnlineMatch,
  submitOnlineBid,
  subscribeRoom,
  toggleRoomLock,
  updateOnlinePlayerName,
  updateRoomSettings,
  type OnlinePlayer,
  type OnlineRoom,
} from '@/lib/paydayMultiplayer'
import {
  INTEREST_RATE_OPTIONS,
  ROUND_TIMER_OPTIONS,
  type GameSettings,
} from '@/lib/paydayPurgatory'
import { BidSplitPreview, CashStack, VaultMeter } from './CashVisuals'

const SERIES_COLORS = [
  '#0066cc',
  '#0f766e',
  '#b45309',
  '#6d28d9',
  '#be123c',
  '#334155',
  '#0369a1',
  '#4d7c0f',
]

function fmtMoney(n: number): string {
  return `$${Math.max(0, Math.round(n)).toLocaleString()}`
}

function fmtTimer(sec: number): string {
  if (sec <= 0) return 'Off'
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}

function fmtCountdown(sec: number): string {
  const safe = Math.max(0, Math.floor(sec))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

function OnlineTrajectoryChart({
  players,
  rounds,
  currentUid,
  startingBank,
}: {
  players: OnlinePlayer[]
  rounds: number
  currentUid: string
  startingBank: number
}) {
  if (rounds < 1) return null

  const width = 640
  const height = 180
  const padL = 52
  const padR = 14
  const padT = 14
  const padB = 26
  const innerW = width - padL - padR
  const innerH = height - padT - padB

  const maxObserved = Math.max(
    startingBank,
    ...players.flatMap((p) => p.bankHistory),
    100
  )

  const xFor = (r: number) => padL + (r / Math.max(1, rounds)) * innerW
  const yFor = (val: number) =>
    padT + innerH - (Math.max(0, Math.min(maxObserved, val)) / maxObserved) * innerH

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((frac) => Math.round(maxObserved * frac))

  const fmtAxis = (v: number) => {
    if (v === 0) return '$0'
    if (v >= 1000) return `$${Number((v / 1000).toFixed(1))}k`
    return `$${v}`
  }

  return (
    <div className="payday-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Online bankroll history chart">
        {yTicks.map((tick) => {
          const y = yFor(tick)
          return (
            <g key={tick}>
              <line
                x1={padL}
                y1={y}
                x2={width - padR}
                y2={y}
                stroke="rgba(15, 23, 42, 0.08)"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="rgba(15, 23, 42, 0.45)"
              >
                {fmtAxis(tick)}
              </text>
            </g>
          )
        })}

        {Array.from({ length: rounds + 1 }, (_, r) => {
          if (rounds > 8 && r % 2 !== 0 && r !== rounds) return null
          return (
            <text
              key={r}
              x={xFor(r)}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(15, 23, 42, 0.45)"
            >
              {r === 0 ? 'Start' : `R${r}`}
            </text>
          )
        })}

        {players.map((p, idx) => {
          const color = SERIES_COLORS[idx % SERIES_COLORS.length]
          const points = p.bankHistory
            .map((val, r) => `${xFor(r).toFixed(1)},${yFor(val).toFixed(1)}`)
            .join(' ')
          const isSelf = p.id === currentUid

          return (
            <g key={p.id}>
              <polyline
                fill="none"
                stroke={color}
                strokeWidth={isSelf ? 2.5 : 1.75}
                strokeOpacity={p.alive ? 0.92 : 0.42}
                strokeDasharray={p.alive ? undefined : '4 3'}
                points={points}
              />
              {p.eliminatedRound !== null && (
                <circle
                  cx={xFor(p.eliminatedRound)}
                  cy={yFor(p.bankHistory[p.eliminatedRound] ?? p.bank)}
                  r="3.5"
                  fill="#be123c"
                />
              )}
            </g>
          )
        })}
      </svg>

      <div className="payday-chart-legend">
        {players.map((p, idx) => (
          <span key={p.id} className="payday-legend-item">
            <span
              className="payday-legend-dot"
              style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }}
            />
            {p.name}
          </span>
        ))}
      </div>
    </div>
  )
}

interface OnlineMultiplayerProps {
  user: User | null
  authBusy: boolean
  onSignIn: () => void
  initialRoomCode: string
  onRoomCodeChange: (code: string | null) => void
}

export default function OnlineMultiplayer({
  user,
  authBusy,
  onSignIn,
  initialRoomCode,
  onRoomCodeChange,
}: OnlineMultiplayerProps) {
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode)
  const [activeCode, setActiveCode] = useState<string | null>(null)
  const [room, setRoom] = useState<OnlineRoom | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [bidDraft, setBidDraft] = useState<string>('0')
  const [nameDraft, setNameDraft] = useState<string>('')
  const [nameSaved, setNameSaved] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [customBankInput, setCustomBankInput] = useState<string>('')
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const lastRoundSeenRef = useRef<number>(0)
  const timeoutTriggeredRoundRef = useRef<number>(0)

  useEffect(() => {
    if (initialRoomCode && !activeCode) {
      setRoomCodeInput(initialRoomCode)
    }
  }, [initialRoomCode, activeCode])

  useEffect(() => {
    if (!activeCode) {
      setRoom(null)
      return
    }
    const unsub = subscribeRoom(
      activeCode,
      (nextRoom) => {
        setRoom(nextRoom)
        if (!nextRoom) {
          setError(`Room "${activeCode}" was closed.`)
          setActiveCode(null)
          onRoomCodeChange(null)
        }
      },
      (err) => {
        setError(err.message || 'Lost connection to live room.')
      }
    )
    return unsub
  }, [activeCode, onRoomCodeChange])

  useEffect(() => {
    if (!user && activeCode) {
      setActiveCode(null)
      setRoom(null)
      onRoomCodeChange(null)
    }
  }, [user, activeCode, onRoomCodeChange])

  const me = user && room ? room.players[user.uid] ?? null : null
  const isHost = Boolean(user && room && room.hostId === user.uid)
  const players = useMemo(() => (room ? getSortedPlayers(room) : []), [room])

  useEffect(() => {
    if (me && !nameDraft) {
      setNameDraft(me.name)
    }
  }, [me, nameDraft])

  useEffect(() => {
    if (!room || !me) return
    if (room.round !== lastRoundSeenRef.current) {
      lastRoundSeenRef.current = room.round
      setBidDraft('0')
    }
  }, [room, me])

  // Keep custom bank draft synced with room settings
  useEffect(() => {
    if (room?.settings.startingBank !== undefined) {
      setCustomBankInput(String(room.settings.startingBank))
    }
  }, [room?.settings.startingBank])

  // Live countdown timer when roundTimerSec > 0
  useEffect(() => {
    if (!room || room.status !== 'bidding' || !room.roundDeadline) {
      setSecondsLeft(null)
      return
    }
    const deadline = room.roundDeadline
    const currentRound = room.round
    const code = room.code

    const tick = () => {
      const rem = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSecondsLeft(rem)
      if (rem === 0 && timeoutTriggeredRoundRef.current !== currentRound) {
        timeoutTriggeredRoundRef.current = currentRound
        resolveTimedOutRound(code, currentRound).catch(() => {})
      }
    }

    tick()
    const id = window.setInterval(tick, 400)
    return () => window.clearInterval(id)
  }, [room?.status, room?.roundDeadline, room?.round, room?.code, room])

  const handleUpdateSetting = async (partial: Partial<GameSettings>) => {
    if (!activeCode || !isHost) return
    setError(null)
    try {
      await updateRoomSettings(activeCode, partial)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Could not update match settings.')
    }
  }

  const handleCreateRoom = async () => {
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      const code = await createOnlineRoom(user)
      setActiveCode(code)
      setNameDraft((user.displayName || user.email?.split('@')[0] || 'PLAYER').slice(0, 18))
      onRoomCodeChange(code)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to create room.')
    } finally {
      setBusy(false)
    }
  }

  const handleJoinRoom = async (targetCode?: string) => {
    if (!user) return
    const code = normalizeRoomCode(targetCode ?? roomCodeInput)
    if (!code) {
      setError('Enter a room code to join.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const joinedCode = await joinOnlineRoom(code, user)
      setActiveCode(joinedCode)
      setNameDraft((user.displayName || user.email?.split('@')[0] || 'PLAYER').slice(0, 18))
      onRoomCodeChange(joinedCode)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to join room.')
    } finally {
      setBusy(false)
    }
  }

  const handleLeaveRoom = async () => {
    if (!user || !activeCode) return
    const code = activeCode
    setBusy(true)
    setError(null)
    try {
      await leaveOnlineRoom(code, user.uid)
    } catch {
      // ignore network error on leave
    } finally {
      setActiveCode(null)
      setRoom(null)
      setNameDraft('')
      onRoomCodeChange(null)
      setBusy(false)
    }
  }

  const handleCopyInvite = async () => {
    if (!activeCode || typeof window === 'undefined') return
    const url = `${window.location.origin}${window.location.pathname}?room=${activeCode}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError(`Share this link: ${url}`)
    }
  }

  const handleSaveName = async () => {
    if (!user || !activeCode || !nameDraft.trim()) return
    try {
      await updateOnlinePlayerName(activeCode, user.uid, nameDraft)
      setNameSaved(true)
      window.setTimeout(() => setNameSaved(false), 1400)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Could not update name.')
    }
  }

  const handleSubmitBid = async () => {
    if (!user || !activeCode || !me || !me.alive) return
    const numeric = Math.max(0, Math.min(me.bank, Math.round(Number(bidDraft) || 0)))
    setBusy(true)
    setError(null)
    try {
      await submitOnlineBid(activeCode, user.uid, numeric)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Could not submit bid.')
    } finally {
      setBusy(false)
    }
  }

  const handleStartMatch = async () => {
    if (!activeCode) return
    setBusy(true)
    setError(null)
    try {
      await startOnlineMatch(activeCode)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Could not start match.')
    } finally {
      setBusy(false)
    }
  }

  const handleAddBot = async () => {
    if (!activeCode) return
    setBusy(true)
    setError(null)
    try {
      await addAiBotToRoom(activeCode)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Could not add AI bot.')
    } finally {
      setBusy(false)
    }
  }

  const handleResetToLobby = async () => {
    if (!activeCode) return
    setBusy(true)
    setError(null)
    try {
      await resetOnlineRoomToLobby(activeCode)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Could not reset room.')
    } finally {
      setBusy(false)
    }
  }

  const handleAdvanceBotRound = async () => {
    if (!activeCode) return
    setBusy(true)
    try {
      await advanceBotOnlyRound(activeCode)
    } finally {
      setBusy(false)
    }
  }

  // Signed-out gate
  if (!user) {
    return (
      <section className="payday-online-gate">
        <div className="payday-online-gate__stack">
          <CashStack ratio={0.9} maxBills={10} variant="vault" size="lg" label="Stack of cash" />
        </div>
        <h2>Online Multiplayer</h2>
        <p>
          Sign in with Google to host private rooms with shareable invite links and play real-time
          sealed-bid rounds synced over Firebase.
        </p>
        {initialRoomCode && (
          <p className="payday-online-gate__invite">
            Invited to room <strong>{initialRoomCode}</strong> — sign in to take your seat.
          </p>
        )}
        <button
          type="button"
          className="payday-primary-btn"
          onClick={onSignIn}
          disabled={authBusy}
        >
          {authBusy ? 'Signing in…' : 'Sign in with Google to Play Online'}
        </button>
      </section>
    )
  }

  // Room launcher (signed in, not in a room yet)
  if (!activeCode || !room) {
    return (
      <section className="payday-online-launcher">
        {error && (
          <div className="payday-auth-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </div>
        )}

        <div className="payday-launcher-grid">
          <div className="payday-launcher-card">
            <div className="payday-launcher-card__head">
              <h3>Host a Private Table</h3>
              <CashStack ratio={1} maxBills={8} variant="vault" size="sm" />
            </div>
            <p>
              Spin up a 4-letter room code with an invite link. Seat as many friends as you want —
              or add AI bots to pad the table.
            </p>
            <button
              type="button"
              className="payday-primary-btn"
              onClick={handleCreateRoom}
              disabled={busy}
            >
              <Play size={14} />
              {busy ? 'Creating…' : 'Create Private Room'}
            </button>
          </div>

          <div className="payday-launcher-card">
            <div className="payday-launcher-card__head">
              <h3>Join with Room Code</h3>
              <CashStack ratio={0.55} maxBills={8} variant="burn" size="sm" />
            </div>
            <p>Have a 4-letter code from a friend? Enter it below to sit at their table.</p>
            <div className="payday-code-row">
              <input
                type="text"
                className="payday-code-input"
                placeholder="e.g. K7M2"
                maxLength={8}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(normalizeRoomCode(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoinRoom()
                }}
              />
              <button
                type="button"
                className="payday-primary-btn"
                onClick={() => handleJoinRoom()}
                disabled={busy || !roomCodeInput}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Connected room state
  const alivePlayers = players.filter((p) => p.alive)
  const aliveHumans = alivePlayers.filter((p) => p.isHuman)
  const readyHumans = aliveHumans.filter((p) => p.ready)
  const lastRecord = room.history[room.history.length - 1] ?? null

  const sortedLeaderboard = [...players].sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1
    if (b.lives !== a.lives) return b.lives - a.lives
    return b.bank - a.bank
  })

  const settings = room.settings
  const step = Math.max(1, settings.bidStep)
  const maxBid = me?.bank ?? 0
  const numericDraft = Math.max(0, Math.min(maxBid, Math.round(Number(bidDraft) || 0)))
  const barScale = Math.max(settings.startingBank, ...players.map((p) => p.bank), 1)

  const winners = players.filter((p) => room.winnerIds.includes(p.id))
  const iWon = winners.some((w) => w.id === user.uid)

  return (
    <div className="payday-online-room">
      {error && (
        <div className="payday-auth-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Room Status Banner */}
      <section className="payday-room-bar">
        <div className="payday-room-bar__left">
          <span className="payday-live-dot" aria-hidden="true" />
          <span className="payday-room-code">
            {room.code === 'PUBLIC' ? 'PUBLIC TABLE' : `ROOM ${room.code}`}
          </span>
          <span className="payday-room-phase">
            {room.status === 'lobby'
              ? room.locked
                ? 'Locked Lobby'
                : 'Open Lobby'
              : room.status === 'bidding'
                ? `Round ${room.round} · Live`
                : 'Match Complete'}
          </span>
        </div>

        <div className="payday-room-bar__actions">
          <button type="button" className="payday-ghost-btn" onClick={handleCopyInvite}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied Link' : 'Invite Link'}
          </button>
          {isHost && room.status === 'lobby' && (
            <button
              type="button"
              className="payday-ghost-btn"
              onClick={() => toggleRoomLock(room.code, !room.locked)}
              disabled={busy}
            >
              {room.locked ? <Unlock size={14} /> : <Lock size={14} />}
              {room.locked ? 'Unlock' : 'Lock'}
            </button>
          )}
          <button
            type="button"
            className="payday-ghost-btn"
            onClick={handleLeaveRoom}
            disabled={busy}
          >
            <DoorOpen size={14} />
            Leave
          </button>
        </div>
      </section>

      {/* LOBBY PHASE */}
      {room.status === 'lobby' && (
        <section className="payday-bid-card payday-lobby-card">
          <div className="payday-bid-header">
            <h2>
              Waiting Room ({players.length} {players.length === 1 ? 'Player' : 'Players'})
            </h2>
            <span>
              {fmtMoney(settings.startingBank)} start · {settings.startingLives}{' '}
              {settings.startingLives === 1 ? 'heart' : 'hearts'}
              {settings.interestRate > 0 ? ` · ${settings.interestRate}% interest` : ''}
              {settings.roundTimerSec > 0 ? ` · ${fmtTimer(settings.roundTimerSec)} timer` : ''}
            </span>
          </div>

          {me && (
            <div className="payday-lobby-name-row">
              <label htmlFor="online-name-input">Your Name</label>
              <input
                id="online-name-input"
                type="text"
                maxLength={18}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                }}
              />
              <button type="button" className="payday-ghost-btn" onClick={handleSaveName}>
                {nameSaved ? 'Saved' : 'Update'}
              </button>
            </div>
          )}

          {/* Host Match Settings (collapsed by default) */}
          <div className={`payday-host-settings${rulesOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="payday-host-settings__toggle"
              onClick={() => setRulesOpen((open) => !open)}
              aria-expanded={rulesOpen}
            >
              <span className="payday-host-settings__title">
                <SlidersHorizontal size={13} />
                Match Rules
              </span>
              <span className="payday-host-settings__summary">
                {fmtMoney(settings.startingBank)} · {settings.startingLives} ♥
                {settings.interestRate > 0 ? ` · ${settings.interestRate}% interest` : ''}
                {settings.roundTimerSec > 0 ? ` · ${fmtTimer(settings.roundTimerSec)}` : ' · No timer'}
              </span>
              <span className="payday-host-settings__chevron" aria-hidden="true">
                {rulesOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            </button>

            {rulesOpen && (
              <div className="payday-host-settings__body">
                {isHost ? (
                  <div className="payday-host-settings__grid">
                    <div className="payday-setting-group">
                      <label className="payday-setting-label" htmlFor="setting-starting-bank">
                        Starting Bank
                      </label>
                      <div className="payday-setting-custom payday-setting-custom--wide">
                        <span>$</span>
                        <input
                          id="setting-starting-bank"
                          type="number"
                          min={100}
                          max={1000000}
                          step={500}
                          value={customBankInput}
                          onChange={(e) => setCustomBankInput(e.target.value)}
                          onBlur={() => {
                            const parsed = Math.round(Number(customBankInput))
                            if (
                              Number.isFinite(parsed) &&
                              parsed >= 100 &&
                              parsed !== settings.startingBank
                            ) {
                              handleUpdateSetting({ startingBank: parsed })
                            } else {
                              setCustomBankInput(String(settings.startingBank))
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const parsed = Math.round(Number(customBankInput))
                              if (Number.isFinite(parsed) && parsed >= 100) {
                                handleUpdateSetting({ startingBank: parsed })
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="payday-setting-group">
                      <span className="payday-setting-label">Starting Hearts</span>
                      <div className="payday-setting-stepper">
                        <button
                          type="button"
                          className="payday-setting-chip"
                          disabled={settings.startingLives <= 1}
                          onClick={() =>
                            handleUpdateSetting({
                              startingLives: Math.max(1, settings.startingLives - 1),
                            })
                          }
                          aria-label="Decrease starting hearts"
                        >
                          −
                        </button>
                        <span className="payday-setting-stepper__val">
                          {settings.startingLives}{' '}
                          <span className="payday-setting-stepper__heart" aria-hidden="true">
                            ♥
                          </span>
                        </span>
                        <button
                          type="button"
                          className="payday-setting-chip"
                          disabled={settings.startingLives >= 7}
                          onClick={() =>
                            handleUpdateSetting({
                              startingLives: Math.min(7, settings.startingLives + 1),
                            })
                          }
                          aria-label="Increase starting hearts"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="payday-setting-group">
                      <span className="payday-setting-label">Interest Rate</span>
                      <div className="payday-setting-chips">
                        {INTEREST_RATE_OPTIONS.map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            className={`payday-setting-chip${settings.interestRate === rate ? ' active' : ''}`}
                            onClick={() => handleUpdateSetting({ interestRate: rate })}
                          >
                            {rate === 0 ? 'Off' : `${rate}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="payday-setting-group">
                      <span className="payday-setting-label">Round Timer</span>
                      <div className="payday-setting-chips">
                        {ROUND_TIMER_OPTIONS.map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            className={`payday-setting-chip${settings.roundTimerSec === sec ? ' active' : ''}`}
                            onClick={() => handleUpdateSetting({ roundTimerSec: sec })}
                          >
                            {fmtTimer(sec)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="payday-guest-rules">
                    <span>
                      Bank: <strong>{fmtMoney(settings.startingBank)}</strong>
                    </span>
                    <span>
                      Hearts: <strong>{settings.startingLives} ♥</strong>
                    </span>
                    <span>
                      Interest:{' '}
                      <strong>{settings.interestRate > 0 ? `${settings.interestRate}%` : 'None'}</strong>
                    </span>
                    <span>
                      Timer: <strong>{fmtTimer(settings.roundTimerSec)}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="payday-lobby-roster">
            {players.map((p) => {
              const pIsHost = p.id === room.hostId
              return (
                <div key={p.id} className="payday-lobby-seat">
                  <div className="payday-lobby-seat__id">
                    {p.photoURL ? (
                      <img
                        src={p.photoURL}
                        alt={p.name}
                        className="payday-row-avatar"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="payday-bot-avatar" aria-hidden="true">
                        {p.isHuman ? p.name.slice(0, 1).toUpperCase() : <Bot size={12} />}
                      </span>
                    )}
                    <span className="payday-player-name">{p.name}</span>
                    {p.id === user.uid && <span className="payday-tag payday-tag--you">You</span>}
                    {pIsHost && (
                      <span className="payday-tag payday-tag--host">
                        <Crown size={11} /> Host
                      </span>
                    )}
                    {!p.isHuman && <span className="payday-tag">AI</span>}
                  </div>

                  {isHost && p.id !== user.uid && (
                    <button
                      type="button"
                      className="payday-seat-remove"
                      onClick={() => removePlayerFromRoom(room.code, p.id)}
                      aria-label={`Remove ${p.name}`}
                      title="Remove from table"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="payday-lobby-footer">
            {isHost ? (
              <>
                <button
                  type="button"
                  className="payday-ghost-btn"
                  onClick={handleAddBot}
                  disabled={busy}
                >
                  <Bot size={14} />
                  Add AI Bot
                </button>
                <button
                  type="button"
                  className="payday-primary-btn"
                  onClick={handleStartMatch}
                  disabled={busy || players.length < 2}
                >
                  <Play size={14} />
                  {players.length < 2 ? 'Need 2+ Debtors to Start' : 'Lock & Start Match'}
                </button>
              </>
            ) : (
              <p className="payday-waiting-note">
                Waiting for <strong>{room.players[room.hostId]?.name ?? 'the host'}</strong> to
                start the match…
              </p>
            )}
          </div>
        </section>
      )}

      {/* ACTIVE MATCH / FINISHED PHASE */}
      {room.status !== 'lobby' && (
        <>
          <section className="payday-metrics" aria-label="Online match metrics">
            <div className="payday-metric">
              <div className="payday-metric__label">Round</div>
              <div className="payday-metric__value">{room.round}</div>
            </div>
            <div className="payday-metric">
              <div className="payday-metric__label">Alive</div>
              <div className="payday-metric__value">
                {alivePlayers.length} / {players.length}
              </div>
            </div>
            <div className="payday-metric">
              <div className="payday-metric__label">Bids Locked</div>
              <div className="payday-metric__value">
                {room.status === 'finished'
                  ? 'Done'
                  : `${readyHumans.length} / ${aliveHumans.length}`}
              </div>
            </div>
            <div className="payday-metric">
              <div className="payday-metric__label">Interest Rate</div>
              <div className="payday-metric__value">
                {settings.interestRate > 0 ? `${settings.interestRate}%` : 'Off'}
              </div>
            </div>
          </section>

          {/* Last Round Commentary */}
          {lastRecord && room.status === 'bidding' && (
            <section className="payday-banner">
              <div className="payday-banner__body">
                <strong>Round {lastRecord.round} Resolved</strong>
                <span>{lastRecord.commentary}</span>
              </div>
            </section>
          )}

          {/* Match Over Banner */}
          {room.status === 'finished' && (
            <section
              className={`payday-banner ${
                room.mutualRuin
                  ? 'payday-banner--danger'
                  : iWon
                    ? 'payday-banner--victory'
                    : 'payday-banner--danger'
              }`}
            >
              <div className="payday-banner__body">
                <strong>
                  {room.mutualRuin
                    ? 'Mutual Liquidation'
                    : winners.length === 1
                      ? iWon
                        ? 'You Survived Payday Purgatory'
                        : `${winners[0].name} Wins`
                      : 'Match Complete'}
                </strong>
                <span>
                  {lastRecord?.commentary}{' '}
                  {winners.length === 1
                    ? `Finished after ${room.history.length} rounds with ${fmtMoney(winners[0].bank)} remaining.`
                    : `Every debtor went under after ${room.history.length} rounds.`}
                </span>
              </div>
              {isHost && (
                <div className="payday-room-bar__actions">
                  <button
                    type="button"
                    className="payday-primary-btn"
                    onClick={handleStartMatch}
                    disabled={busy}
                  >
                    <RotateCcw size={14} />
                    Rematch
                  </button>
                  <button
                    type="button"
                    className="payday-ghost-btn"
                    onClick={handleResetToLobby}
                    disabled={busy}
                  >
                    Lobby
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Sealed Bid Controls */}
          {room.status === 'bidding' && (
            <section className="payday-bid-card" aria-label="Online sealed bid controls">
              {me && me.alive ? (
                <>
                  <div className="payday-bid-header">
                    <h2>Round {room.round} — Your Sealed Bid</h2>
                    {secondsLeft !== null && (
                      <span className="payday-bid-header__meta">
                        <span
                          className={`payday-timer-pill${secondsLeft <= 15 ? ' is-urgent' : ''}`}
                        >
                          <Clock size={12} />
                          {fmtCountdown(secondsLeft)}
                        </span>
                      </span>
                    )}
                  </div>

                  {me.ready && (
                    <div className="payday-locked-callout">
                      <Check size={15} />
                      <span>
                        Sealed at <strong>{fmtMoney(me.currentBid ?? 0)}</strong> — waiting for{' '}
                        {aliveHumans.length - readyHumans.length} other{' '}
                        {aliveHumans.length - readyHumans.length === 1 ? 'player' : 'players'}. You
                        can still adjust your bid until everyone locks in.
                      </span>
                    </div>
                  )}

                  <BidSplitPreview
                    bank={me.bank}
                    startingBank={barScale}
                    bid={numericDraft}
                    interestRate={settings.interestRate}
                  />

                  <div className="payday-bid-row">
                    <div className="payday-bid-input-wrap">
                      <span>$</span>
                      <input
                        type="number"
                        min={0}
                        max={maxBid}
                        step={step}
                        value={bidDraft}
                        onChange={(e) => setBidDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmitBid()
                        }}
                        aria-label="Online contribution amount in dollars"
                      />
                    </div>
                    <input
                      type="range"
                      className="payday-slider"
                      min={0}
                      max={maxBid}
                      step={maxBid >= step ? step : 1}
                      value={numericDraft}
                      onChange={(e) => setBidDraft(e.target.value)}
                      aria-label="Online contribution slider"
                    />
                    <button
                      type="button"
                      className="payday-primary-btn"
                      onClick={handleSubmitBid}
                      disabled={busy}
                    >
                      {me.ready ? 'Update Bid' : 'Lock Sealed Bid'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="payday-handoff">
                  <h2>{me ? 'You Have Been Liquidated' : 'Spectating Live Match'}</h2>
                  <p>
                    {aliveHumans.length > 0
                      ? `Waiting on ${aliveHumans.length - readyHumans.length} remaining human ${aliveHumans.length - readyHumans.length === 1 ? 'debtor' : 'debtors'} to submit Round ${room.round} bids…`
                      : 'Only AI bots remain at the table.'}
                  </p>
                  {aliveHumans.length === 0 && isHost && (
                    <button
                      type="button"
                      className="payday-primary-btn"
                      onClick={handleAdvanceBotRound}
                      disabled={busy}
                    >
                      <FastForward size={14} />
                      Resolve Next Bot Round
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Live Players Leaderboard */}
          <section className="payday-table" aria-label="Online players leaderboard">
            {sortedLeaderboard.map((player) => {
              const bankRatio = Math.max(0, Math.min(1, player.bank / barScale))
              const lostLastRound = lastRecord?.losers.includes(player.id) ?? false
              const isSelf = player.id === user.uid
              const isCritical = player.alive && player.lives === 1

              const rowClasses = [
                'payday-row',
                'payday-row--visual',
                isSelf ? 'payday-row--self' : '',
                lostLastRound ? 'payday-row--loser' : '',
                !player.alive ? 'payday-row--dead' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div key={player.id} className={rowClasses}>
                  <div className="payday-row-stack">
                    <CashStack
                      ratio={player.alive ? bankRatio : 0}
                      maxBills={9}
                      variant="vault"
                      size="sm"
                    />
                  </div>

                  <div className="payday-player-id">
                    <div className="payday-player-top">
                      {player.photoURL && (
                        <img
                          src={player.photoURL}
                          alt={player.name}
                          className="payday-row-avatar"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className="payday-player-name">{player.name}</span>
                      {isSelf && <span className="payday-tag payday-tag--you">You</span>}
                      {!player.isHuman && <span className="payday-tag">AI</span>}
                      {room.status === 'bidding' && player.alive && player.isHuman && (
                        <span className={`payday-ready-pill${player.ready ? ' is-ready' : ''}`}>
                          {player.ready ? 'Locked ✓' : 'Thinking…'}
                        </span>
                      )}
                      {lostLastRound && (
                        <span className="payday-tag payday-tag--danger">-1 ♥</span>
                      )}
                      {!player.alive && (
                        <span className="payday-tag payday-tag--dead">
                          Out R{player.eliminatedRound}
                        </span>
                      )}
                    </div>

                    <div
                      className={`payday-hearts${isCritical ? ' payday-hearts--critical' : ''}`}
                      aria-label={`${player.lives} hearts left`}
                    >
                      {Array.from({ length: settings.startingLives }, (_, idx) => (
                        <span
                          key={idx}
                          className={`payday-heart${idx >= player.lives ? ' payday-heart--empty' : ''}`}
                          aria-hidden="true"
                        >
                          ♥
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="payday-bank-col">
                    <VaultMeter bank={player.bank} maxBank={barScale} />
                  </div>

                  <div className="payday-bid-col">
                    <div className="payday-bid-col__label">Last Bid</div>
                    <div
                      className={`payday-bid-col__val${
                        player.lastBid === null
                          ? ' payday-bid-col__val--muted'
                          : lostLastRound
                            ? ' payday-bid-col__val--loser'
                            : ''
                      }`}
                    >
                      {player.lastBid === null ? '—' : fmtMoney(player.lastBid)}
                    </div>
                  </div>
                </div>
              )
            })}
          </section>

          {/* Bankroll Trajectory Chart */}
          {room.history.length > 0 && (
            <section className="payday-section">
              <h3>Bankroll Trajectory</h3>
              <OnlineTrajectoryChart
                players={players}
                rounds={room.history.length}
                currentUid={user.uid}
                startingBank={settings.startingBank}
              />
            </section>
          )}

          {/* Round-by-Round Ledger */}
          {room.history.length > 0 && (
            <section className="payday-section">
              <h3>Round Ledger</h3>
              <div className="payday-ledger">
                {[...room.history].reverse().map((rec) => (
                  <div key={rec.round} className="payday-ledger-row">
                    <div>
                      <strong>R{rec.round}</strong>
                      {rec.commentary}
                    </div>
                    <span className="payday-ledger-stats">
                      Floor {fmtMoney(rec.minBid)} · High {fmtMoney(rec.maxBid)} · Burned{' '}
                      {fmtMoney(rec.potAdded)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

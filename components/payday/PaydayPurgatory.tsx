'use client'

import type { User } from 'firebase/auth'
import { BookOpen, LogOut, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { signInWithGoogle, signOutGoogle, subscribeAuth } from '@/lib/firebaseAuth'
import { normalizeRoomCode } from '@/lib/paydayMultiplayer'
import OnlineMultiplayer from './OnlineMultiplayer'

function GoogleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.85Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3a7.17 7.17 0 0 1-10.67-3.77H1.4v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.39 14.32a7.21 7.21 0 0 1 0-4.64V6.59H1.4a12 12 0 0 0 0 10.82l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.4 6.59l3.99 3.09A7.16 7.16 0 0 1 12 4.75Z"
      />
    </svg>
  )
}

export function PaydayPurgatory() {
  const [initialRoomCode, setInitialRoomCode] = useState<string>('')
  const [showRules, setShowRules] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roomParam = normalizeRoomCode(params.get('room') ?? '')
    if (roomParam) {
      setInitialRoomCode(roomParam)
    }
  }, [])

  const handleRoomCodeUrlSync = useCallback((code: string | null) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (code) {
      url.searchParams.set('room', code)
    } else {
      url.searchParams.delete('room')
    }
    window.history.replaceState({}, '', url.toString())
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeAuth((nextUser) => {
      setUser(nextUser)
      if (nextUser) {
        setAuthError(null)
      }
    })
    return unsubscribe
  }, [])

  const handleGoogleSignIn = async () => {
    setAuthBusy(true)
    setAuthError(null)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError(null)
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          `Add "${window.location.hostname}" to Firebase Auth → Settings → Authorized domains.`
        )
      } else {
        setAuthError('Google sign-in failed. Please try again.')
      }
    } finally {
      setAuthBusy(false)
    }
  }

  useEffect(() => {
    if (!showSignOutConfirm && !showRules) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSignOutConfirm(false)
        setShowRules(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showSignOutConfirm, showRules])

  const handleGoogleSignOut = async () => {
    setAuthBusy(true)
    try {
      await signOutGoogle()
      setShowSignOutConfirm(false)
    } finally {
      setAuthBusy(false)
    }
  }

  return (
    <main className="payday-page">
      <header className="payday-header">
        <div className="payday-title-group">
          <h1>Payday Purgatory</h1>
        </div>

        <div className="payday-header-actions">
          {user ? (
            <div className="payday-user-pill">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="payday-avatar"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="payday-user-pill__name">
                {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <button
                type="button"
                className="payday-user-pill__out"
                onClick={() => setShowSignOutConfirm(true)}
                disabled={authBusy}
                aria-label="Sign out of Google"
                title="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="payday-google-btn"
              onClick={handleGoogleSignIn}
              disabled={authBusy}
            >
              <GoogleMark />
              {authBusy ? 'Signing in…' : 'Sign in with Google'}
            </button>
          )}
          <button
            type="button"
            className="payday-ghost-btn"
            onClick={() => setShowRules(true)}
          >
            <BookOpen size={14} />
            Rules &amp; Lore
          </button>
        </div>
      </header>

      {authError && (
        <div className="payday-auth-error" role="alert">
          <span>{authError}</span>
          <button type="button" onClick={() => setAuthError(null)} aria-label="Dismiss error">
            <X size={13} />
          </button>
        </div>
      )}

      <OnlineMultiplayer
        user={user}
        authBusy={authBusy}
        onSignIn={handleGoogleSignIn}
        initialRoomCode={initialRoomCode}
        onRoomCodeChange={handleRoomCodeUrlSync}
      />

      {showSignOutConfirm && user && (
        <div
          className="payday-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm sign out"
          onClick={() => !authBusy && setShowSignOutConfirm(false)}
        >
          <div
            className="payday-modal payday-modal--compact"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payday-modal-head">
              <h2>Sign out?</h2>
              <button
                type="button"
                className="payday-ghost-btn"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={authBusy}
                aria-label="Cancel sign out"
              >
                <X size={14} />
              </button>
            </div>
            <p className="payday-confirm-text">
              You&apos;re signed in as{' '}
              <strong>{user.displayName || user.email || 'Google user'}</strong>. Signing out will
              disconnect you from any active room.
            </p>
            <div className="payday-confirm-actions">
              <button
                type="button"
                className="payday-ghost-btn"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={authBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="payday-primary-btn payday-primary-btn--danger"
                onClick={handleGoogleSignOut}
                disabled={authBusy}
              >
                <LogOut size={14} />
                {authBusy ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <div
          className="payday-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Rules and Lore"
          onClick={() => setShowRules(false)}
        >
          <div className="payday-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payday-modal-head">
              <h2>Payday Purgatory</h2>
              <button
                type="button"
                className="payday-ghost-btn"
                onClick={() => setShowRules(false)}
                aria-label="Close rules"
              >
                <X size={14} />
              </button>
            </div>

            <h4>Rules</h4>
            <ul>
              <li>
                Every player starts with the host&apos;s configured bank (default{' '}
                <strong>$10,000</strong>) and hearts (default <strong>3 ♥</strong>).
              </li>
              <li>
                Each round is a <strong>sealed-bid all-pay auction</strong>: everyone secretly bids
                from their remaining bank, and all bids are permanently deducted.
              </li>
              <li>
                The <strong>lowest contributor(s)</strong> lose 1 heart. Ties at the floor punish
                all tied players.
              </li>
              <li>
                At 0 hearts, you are eliminated. <strong>Last player standing wins.</strong>
              </li>
            </ul>

            <h4>Strategy Note</h4>
            <p>
              Overpaying early feels safe but leaves you broke in the endgame. Sometimes the sharpest
              move with hearts to spare is bidding <strong>$0</strong> — trading a heart to preserve
              cash while the rest of the table bleeds each other dry.
            </p>

            <h4>Payday Corp Lore</h4>
            <p>
              In a desolate future ruled by Payday Corp, debtors are dropped into a liquidity arena
              where survival isn&apos;t won with weapons, but with capital discipline, reads, and
              nerve. Only the last solvent player walks out.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

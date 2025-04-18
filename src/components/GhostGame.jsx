import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GoBackButton from './GoBackButton';
import './GhostGame.scss';

// Game configuration
const gameConfig = {
    stages: [
        {
            question: "Which hackathon has Eric not been to?",
            doors: ["IrvineHacks", "LAHacks", "HackMIT", "DiamondHacks"],
            correctDoor: "IrvineHacks",
            ghostSpeed: 2,
            maxGhostSpeed: 2.5,
            playerSpeed: 7  // Updated to 7
        },
        {
            question: "When was Eric born?",
            doors: ["Feb 29th", "April 1st", "December 25th", "Jan 1st"],
            correctDoor: "Feb 29th",
            ghostSpeed: 3,
            maxGhostSpeed: 3.5,
            playerSpeed: 7  // Updated to 7
        },
        {
            question: "What race does Eric main for Starcraft?",
            doors: ["Terran", "Protoss", "Zerg", "Random"],
            correctDoor: "Zerg",
            ghostSpeed: 4,
            maxGhostSpeed: 4.5,
            playerSpeed: 7  // Updated to 7
        },
        {
            question: "Which door represents Eric's main interest?",
            doors: ["AI/ML", "Web Dev", "Cloud", "CyberSec"],
            correctDoor: "AI/ML",
            ghostSpeed: 5,
            maxGhostSpeed: 5.5,
            playerSpeed: 7  // Updated to 7
        },
        {
            question: "How many hackathons has Eric won?",
            doors: ["0", "2", "4", "6"],
            correctDoor: "6",
            ghostSpeed: 5,
            maxGhostSpeed: 5.5,
            playerSpeed: 7  // Updated to 7
        },
        {
            question: "Which game does Eric play?",
            doors: ["League of Legends", "Roblox", "Marvel Rivals", "Minecraft"],
            correctDoor: "League of Legends",
            ghostSpeed: 6,
            maxGhostSpeed: 6.5,
            playerSpeed: 7  // Updated to 7
        }
    ]
};

const GhostGame = () => {
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [playerEmoji, setPlayerEmoji] = useState('🤖');
    const [gameStatus, setGameStatus] = useState('setup'); // 'setup', 'playing', 'won', 'lost'
    const [lossReason, setLossReason] = useState(''); // 'caught' or 'wrong-door'
    const gameAreaRef = useRef(null);
    const [stage, setStage] = useState(0);
    const [playerPos, setPlayerPos] = useState({ x: 100, y: 100 });
    const [targetPos, setTargetPos] = useState({ x: 100, y: 100 });
    const [ghostPos, setGhostPos] = useState({ x: 400, y: 400 });
    const [doorPositions, setDoorPositions] = useState([]);
    const [safeMode, setSafeMode] = useState(false); // Short invincibility when stage starts
    const [doorHover, setDoorHover] = useState(null); // Track which door is being hovered
    const [showSecret, setShowSecret] = useState(false); // State for the secret modal
    const [hasWonBefore, setHasWonBefore] = useState(false); // State to remember if the player has won before
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const safeModeTimerRef = useRef();

    // Helper function to get emoji for door
    const getDoorEmoji = (doorText) => {
        switch (doorText) {
            // Stage 1 - Hackathons
            case 'IrvineHacks': return '🍊';
            case 'LAHacks': return '🌆';
            case 'HackMIT': return '🧠';
            case 'DiamondHacks': return '💎';

            // Stage 2 - Birthday
            case 'Feb 29th': return '🎂';
            case 'April 1st': return '🃏';
            case 'December 25th': return '🎄';
            case 'Jan 1st': return '🎆';

            // Stage 3 - Starcraft
            case 'Terran': return '👨‍🚀';
            case 'Protoss': return '🛸';
            case 'Zerg': return '🦠';
            case 'Random': return '🎲';

            // Stage 4 - Interests
            case 'AI/ML': return '🤖';
            case 'Web Dev': return '🕸️';
            case 'Cloud': return '☁️';
            case 'CyberSec': return '🔒';

            // Stage 5 - Hackathon wins
            case '0': return '0️⃣';
            case '2': return '2️⃣';
            case '4': return '4️⃣';
            case '6': return '6️⃣';

            // Stage 6 - Games
            case 'League of Legends': return '🧙‍♂️';
            case 'Roblox': return '🟥';
            case 'Marvel Rivals': return '🦸';
            case 'Minecraft': return '⛏️';

            default: return '🚪';
        }
    };

    // Initialize door positions
    useEffect(() => {
        // Only initialize if we're in playing state
        if (gameStatus !== 'playing') return;

        if (gameAreaRef.current) {
            const width = gameAreaRef.current.clientWidth;
            const height = gameAreaRef.current.clientHeight;
            const isLandscape = width > height;

            let positions;

            if (isLandscape) {
                // Position doors along the RIGHT side
                const doorHeight = height / 4;
                positions = gameConfig.stages[stage].doors.map((_, i) => ({
                    x: width - 80,
                    y: i * doorHeight + doorHeight / 2,
                    width: 120,
                    height: doorHeight * 0.7
                }));

                // Reset positions (player on LEFT side, ghost on RIGHT)
                setPlayerPos({ x: 150, y: height / 2 });
                setTargetPos({ x: 150, y: height / 2 });
                setGhostPos({ x: width - 150, y: height / 2 });
            } else {
                // Position doors along the BOTTOM
                const doorWidth = width / 4;
                positions = gameConfig.stages[stage].doors.map((_, i) => ({
                    x: i * doorWidth + doorWidth / 2,
                    y: height - 80,
                    width: doorWidth * 0.7,
                    height: 120
                }));

                // Reset positions (player on TOP, ghost on BOTTOM)
                setPlayerPos({ x: width / 2, y: 150 });
                setTargetPos({ x: width / 2, y: 150 });
                setGhostPos({ x: width / 2, y: height - 150 });
            }

            setDoorPositions(positions);
            
            // Set safe mode for 1.5 seconds when stage starts
            setSafeMode(true);
            if (safeModeTimerRef.current) {
                clearTimeout(safeModeTimerRef.current);
            }
            safeModeTimerRef.current = setTimeout(() => {
                setSafeMode(false);
            }, 1500);
        }
        
        // Cleanup function
        return () => {
            if (safeModeTimerRef.current) {
                clearTimeout(safeModeTimerRef.current);
            }
        };
    }, [stage, gameStatus]);

    // Handle game start
    const handleStartGame = () => {
        if (playerName.trim() === '') {
            alert('Please enter your name!');
            return;
        }
        setStage(0);
        setGameStatus('playing');
    };

    // Handle reset game
    const handleResetGame = () => {
        setStage(0);
        setGameStatus('setup');
        setPlayerName('');
        setPlayerEmoji('🤖');
    };

    // Handle mouse movement - now just updates target position
    const handleMouseMove = (e) => {
        if (gameStatus !== 'playing') return;

        const rect = gameAreaRef.current.getBoundingClientRect();
        setTargetPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        
        // Check if hovering over doors
        let hovering = null;
        doorPositions.forEach((door, index) => {
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (
                mouseX > door.x - door.width / 2 &&
                mouseX < door.x + door.width / 2 &&
                mouseY > door.y - door.height / 2 &&
                mouseY < door.y + door.height / 2
            ) {
                hovering = index;
            }
        });
        setDoorHover(hovering);
    };

    // Handle navigation to secret modal
    const handleSecretClick = () => {
        setShowSecret(true);
    };

    // Game loop
    const gameLoop = (time) => {
        if (previousTimeRef.current === undefined) {
            previousTimeRef.current = time;
        }

        const deltaTime = time - previousTimeRef.current;
        previousTimeRef.current = time;

        // Only update game if playing
        if (gameStatus === 'playing') {
            // Move player toward target (mouse) with smooth acceleration
            const pDx = targetPos.x - playerPos.x;
            const pDy = targetPos.y - playerPos.y;
            const pDistance = Math.sqrt(pDx * pDx + pDy * pDy);

            if (pDistance > 5) { // Only move if not at target
                // Adjust speed based on distance for smoother movement
                const speedFactor = Math.min(1, pDistance / 100); // Slower when closer to target
                const pSpeed = gameConfig.stages[stage].playerSpeed * 0.1 * speedFactor;
                const pVx = (pDx / pDistance) * pSpeed;
                const pVy = (pDy / pDistance) * pSpeed;

                setPlayerPos(prev => ({
                    x: prev.x + pVx,
                    y: prev.y + pVy
                }));
            }

            // Only chase player if not in safe mode
            if (!safeMode) {
                // Move ghost toward player with increasing speed
                const dx = playerPos.x - ghostPos.x;
                const dy = playerPos.y - ghostPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 30) {
                    // Ghost caught player
                    setLossReason('caught');
                    setGameStatus('lost');
                } else {
                    // Adjust ghost speed based on distance - faster when closer
                    const ghostSpeedFactor = Math.min(
                        gameConfig.stages[stage].maxGhostSpeed / gameConfig.stages[stage].ghostSpeed,
                        1 + (300 - Math.min(distance, 300)) / 300
                    );
                    
                    const speed = gameConfig.stages[stage].ghostSpeed * 0.1 * ghostSpeedFactor;
                    const vx = (dx / distance) * speed;
                    const vy = (dy / distance) * speed;

                    setGhostPos(prev => ({
                        x: prev.x + vx,
                        y: prev.y + vy
                    }));
                }
            }

            // Check if player reached a door
            doorPositions.forEach((door, index) => {
                if (
                    playerPos.x > door.x - door.width / 2 &&
                    playerPos.x < door.x + door.width / 2 &&
                    playerPos.y > door.y - door.height / 2 &&
                    playerPos.y < door.y + door.height / 2
                ) {
                    // Player entered a door
                    const selectedDoor = gameConfig.stages[stage].doors[index];
                    const correctDoor = gameConfig.stages[stage].correctDoor;

                    if (selectedDoor === correctDoor) {
                        if (stage === gameConfig.stages.length - 1) {
                            // Won the game
                            setGameStatus('won');
                            setHasWonBefore(true); // Remember that player has won
                        } else {
                            // Advance to next stage
                            setStage(prev => prev + 1);
                        }
                    } else {
                        // Wrong door
                        setLossReason('wrong-door');
                        setGameStatus('lost');
                    }
                }
            });
        }

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        if (gameStatus === 'playing') {
            requestRef.current = requestAnimationFrame(gameLoop);
            return () => cancelAnimationFrame(requestRef.current);
        }
    }, [gameStatus, playerPos, ghostPos, doorPositions, safeMode]);

    return (
        <div
            className="ghost-game"
            ref={gameAreaRef}
            onMouseMove={handleMouseMove}
        >
            <h2>Boo! 👻</h2>

            {/* Setup screen */}
            {gameStatus === 'setup' && (
                <div className="setup-screen">
                    <div className="intro-message">
                        <h3> You've found the secret challenge! GLHF :P</h3>
                        {hasWonBefore && (
                            <div className="veteran-badge">
                                <span>🏆 You've defeated the ghost before! 🏆</span>
                                <button 
                                    className="wisdom-button" 
                                    onClick={handleSecretClick}
                                >
                                    Revisit Secret Wisdom 📜
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="playerName">Your Name:</label>
                        <input
                            type="text"
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name"
                            maxLength={15}
                        />
                    </div>

                    <div className="emoji-selection">
                        <label>Choose your character:</label>
                        <div className="emoji-options">
                            <button
                                className={playerEmoji === '👽' ? 'selected' : ''}
                                onClick={() => setPlayerEmoji('👽')}
                                aria-label="Alien"
                            >
                                👽
                            </button>
                            <button
                                className={playerEmoji === '😼' ? 'selected' : ''}
                                onClick={() => setPlayerEmoji('😼')}
                                aria-label="Cat"
                            >
                                😼
                            </button>
                            <button
                                className={playerEmoji === '🤖' ? 'selected' : ''}
                                onClick={() => setPlayerEmoji('🤖')}
                                aria-label="Robot"
                            >
                                🤖
                            </button>
                            <button
                                className={playerEmoji === '😴' ? 'selected' : ''}
                                onClick={() => setPlayerEmoji('😴')}
                                aria-label="Sleepy"
                            >
                                😴
                            </button>
                            <button
                                className={playerEmoji === '🤠' ? 'selected' : ''}
                                onClick={() => setPlayerEmoji('🤠')}
                                aria-label="Cowboy"
                            >
                                🤠
                            </button>
                        </div>
                    </div>

                    <div className="button-row">
                        <button className="start-button" onClick={handleStartGame}>
                            Start Game
                        </button>
                        <GoBackButton className="go-back-button" />
                    </div>
                </div>
            )}

            {gameStatus === 'playing' && (
                <>
                    {/* Game HUD */}
                    <div className="game-hud">
                        <div className="player-info">
                            <span className="player-emoji">{playerEmoji}</span>
                            <span className="player-name">{playerName}</span>
                        </div>
                        <div className="stage-info">
                            Level {stage + 1}/{gameConfig.stages.length}
                        </div>
                    </div>
                    
                    <div className="question-banner">
                        <p>{gameConfig.stages[stage].question}</p>
                    </div>

                    {/* Safe mode indicator */}
                    {safeMode && (
                        <div className="safe-mode-indicator">
                            SAFE MODE - GO!
                        </div>
                    )}

                    <div
                        className={`player ${safeMode ? 'safe-mode' : ''}`}
                        style={{
                            transform: `translate(${playerPos.x}px, ${playerPos.y}px)`
                        }}
                    >
                        {playerEmoji}
                    </div>
                    <div
                        className="ghost"
                        style={{
                            transform: `translate(${ghostPos.x}px, ${ghostPos.y}px)`
                        }}
                    >
                        👻
                    </div>
                    {doorPositions.map((door, index) => (
                        <div
                            key={index}
                            className={`door ${doorHover === index ? 'hover' : ''}`}
                            style={{
                                left: door.x - door.width / 2,
                                top: door.y - door.height / 2,
                                width: door.width,
                                height: door.height
                            }}
                        >
                            <span className="door-emoji">
                                {getDoorEmoji(gameConfig.stages[stage].doors[index])}
                            </span>
                            <span className="door-text">
                                {gameConfig.stages[stage].doors[index]}
                            </span>
                        </div>
                    ))}
                </>
            )}

            {gameStatus === 'won' && (
                <div className="result-message success">
                    <h3>🎉 Congratulations, {playerName}!</h3>
                    <p>You've successfully completed all {gameConfig.stages.length} stages!</p>
                    <p className="secret-message">A secret message has been unlocked! 📜</p>
                    <div className="result-buttons">
                        <button className="secret-button" onClick={handleSecretClick}>
                            Reveal Message📜
                        </button>
                        <button onClick={() => { 
                            setStage(0); 
                            setGameStatus('setup');
                            setTimeout(() => setGameStatus('playing'), 0); 
                        }}>Play Again</button>
                        <button onClick={handleResetGame}>New Player</button>
                    </div>
                </div>
            )}

            {/* Add the secret modal overlay */}
            {showSecret && (
                <div className="secret-overlay" onClick={() => setShowSecret(false)}>
                    <div className="secret-content" onClick={(e) => e.stopPropagation()}>
                        <h3>✨ Secret Wisdom Unlocked ✨</h3>
                        <div className="wisdom-container">
                            <p className="wisdom-text">
                                "Minimal specialties erodes future value; fractional upskilling across several domains accrues optionality. Against a volatile world, have multiple vectors to success."
                            </p>
                        </div>
                        <p className="wisdom-attribution">— Eric Ly</p>
                        <button className="close-button" onClick={() => setShowSecret(false)}>
                            Incredible. I'll Remember This. 🙏
                        </button>
                    </div>
                </div>
            )}

            {/* Different loss screens based on reason */}
            {gameStatus === 'lost' && lossReason === 'caught' && (
                <div className="result-message failure">
                    <h3>👻 BOO! GOTCHA! 👻</h3>
                    <p>Oh no, {playerName}! The ghost was too fast and caught you!</p>
                    <p>You reached level {stage + 1} of {gameConfig.stages.length}.</p>
                    <div className="result-buttons">
                        <button onClick={() => {
                            // Reset to stage 0 (start over)
                            setStage(0);
                            setGameStatus('setup');
                            setTimeout(() => setGameStatus('playing'), 0);
                        }}>Try Again</button>
                        <button onClick={handleResetGame}>New Player</button>
                    </div>
                </div>
            )}

            {gameStatus === 'lost' && lossReason === 'wrong-door' && (
                <div className="result-message failure wrong-door">
                    <h3>WRONG DOOR! 💀</h3>
                    <p>Sorry {playerName}, that wasn't the right choice!</p>
                    <p>You reached level {stage + 1} of {gameConfig.stages.length}.</p>
                    <div className="result-buttons">
                        <button onClick={() => {
                            // Reset to stage 0 (start over)
                            setStage(0);
                            setGameStatus('setup');
                            setTimeout(() => setGameStatus('playing'), 0);
                        }}>Try Again</button>
                        <button onClick={handleResetGame}>New Player</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GhostGame;
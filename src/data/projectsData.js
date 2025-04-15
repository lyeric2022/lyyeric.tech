export const projects = [
    {
        id: 14,
        title: "Multilingual AI Resource Navigator",
        image: "diamondhacks2025.png",
        url: "https://www.hackroots.tech/",
        description: "At DiamondHacks 2025, my team and I created RootsAI, winning the Best Use of Letta award. This application helps families navigate government assistance programs like SNAP, FAFSA, Medicare, etc. Using Whisper for multilingual speech recognition and Google Gemini for informational research, RootsAI maintains conversations that remember users' details across sessions, providing personalized guidance in the user's preferred language to simplify complex government processes.",
        tags: ["React", "TypeScript", "MongoDB", "Express", "FastAPI", "Whisper", "Gemini API", "Auth0", "Docker"]
    },
    {
        id: -1,
        title: "StudyDash - Academic Productivity Tool",
        image: "study_dash.png",
        url: "https://beachhacks2025.vercel.app/",
        description: "At BeachHacks 8.0, our team created StudyDash, winning Best UI/UX Project. This academic productivity tool unifies Canvas deadlines, Google Calendar, and AI-powered insights in one dashboard. Using Next.js, Dain AI, Puppeteer, and Supabase, we built features including smart scheduling, a Pomodoro timer, and analytics. Dain AI is used to analyze grades and assignments, automatically identifying optimal study periods and offering personalized recommendations to help students prioritize effectively.",
        tags: ["Next.js", "TypeScript", "React", "Supabase", "Puppeteer", "Canvas API", "Google Calendar API"]
    },
    {
        id: 15,
        title: "Policy Duck 🦆",
        image: "policy_duck.png",
        url: "https://policy-duck.vercel.app/",
        description: "For my Dev Ops & Deployments class, we made Policy Duck! It is a platform for students to learn more about the ASI candidates. With a goal to bridge the disconnect between ASI and the student body, our platform provides deep insights and clear candidate profiles that empower you to shape your campus future. Client built with SvelteKit and Firebase, deployed on Vercel. Server built with FastAPI and deployed on AWS for PostgreSQL and Lambda.",
        tags: ["SvelteKit", "Firebase", "FastAPI", "PostgreSQL", "AWS Lambda", "Vercel"]
    },
    {
        id: 0,
        title: "Canticum - AI Music Recommender",
        image: "canticum.png",
        url: "https://canticum.vercel.app/",
        description: "For my AI class, my team built Canticum to help users discover music similar to songs they already enjoy. The system analyzes audio features from Spotify's dataset (80,000+ tracks) using MinMax Scaling and Cosine Similarity. Our hybrid recommendation algorithm weighs audio features (60%), genre (30%), and popularity (10%). With a React frontend and Flask backend, users can search songs and get personalized recommendations with detailed audio characteristics.",
        tags: ["React", "Flask", "Python", "Scikit-learn", "Pandas", "Spotify API"]
    },
    {
        id: 1,
        title: "HackLA Activities Recommendation System",
        image: "consilia.png",
        url: "https://www.consilia.tech/",
        description: "During LA Hacks 2024, we created Consilia to address the challenges of planning and coordinating outdoor activities among friends from different universities. Our team integrated front-end technologies such as React and with back-end services including Gemini Pro, MongoDB, and Express to ensure a seamless user experience. Our AI, developed using machine learning algorithms, dynamically analyzes user preferences and locations to offer personalized event recommendations.",
        tags: ["React", "MongoDB", "Express", "Node.js", "Gemini API", "Geolocation"]
    },
    {
        id: 2,
        title: "HackMIT Fire Detection System Project",
        image: "hackmit_project.png",
        url: "https://hackmit2023-pi.vercel.app/",
        description: "During HackMIT, my group sought to accurately detect real-time wildfires and evacuate people safely. We connected to the server via MQTT, allowing for WebSocket communication with an HTTP client. We used HTML geolocation, and displayed sensor data for temperature, humidity, and danger levels near the user. Also, we integrated Google Maps API to map the user's location and provide safe route suggestions away from danger zones. Together, our team achieved 2nd Place for IBM's AI challenge!",
        tags: ["MQTT", "WebSockets", "Google Maps API", "Geolocation API", "HTML", "CSS", "JavaScript"]
    },
    {
        id: 3,
        title: "Symbolic Regressor for Pringles",
        image: "symbolic_regressor.png",
        url: null, 
        customHandler: "handleOpenSymbolicRegressor",
        description: "During my ASSURE-US research program, I worked genetic programming and developed a usable generator model within symbolic regression. Given only 50 data points representing a hyperbolic paraboloid, the model can successfully reveal many shapes' mathematical formulas. The symbolic regressor uses natural selections, crossovers, and mutations, to derive the fittest genetic programs across multiple generations.",
        tags: ["Python", "NumPy", "Matplotlib", "Scikit-learn", "Genetic Programming"]
    },
    {
        id: 4,
        title: "Payday Purgatory",
        image: "payday_purgatory.png",
        url: "https://www.payday-purgatory.lyyeric.tech/",
        description: "Players are authenticated through Firebase authenticator, and data is stored/modified on Firebase's database. Each round, players contribute a portion of their total bank balance. The player with the lowest contributions that round, loses a heart. If all hearts are depleted, the player is eliminated. The objective is be the last contributor standing.",
        tags: ["JavaScript", "Firebase", "HTML", "CSS", "Firebase Authentication", "Firebase Realtime Database"]
    },
    {
        id: 5,
        title: "Projectile Poopers",
        image: "projectile_poopers.png",
        url: "https://www.projectile-poopers.lyyeric.tech/",
        description: "Built upon Drew Conley's multiplayer JS game— adding game music, coin sounds, and mobile-friendly button-based controls. Implemented an HP system to eliminate players falling below 0 HP and designed projectiles for player damage. Created a coins market where players can redeem coins for HP and projectile upgrades— utilizing Firebase for authentication and data management.",
        tags: ["JavaScript", "HTML", "CSS", "Firebase", "Web Audio API", "Responsive Design"]
    },
    {
        id: 6,
        title: "VSA Anh Chị Em Vines",
        image: "vsa-ace.png",
        url: "https://vsa-ace-vines.vercel.app/",
        description: "VSA at CSUF has a special tradition of veteran members \"adopting\" new members in their \"lines\". This process is fun, unique, and spans a decade. However, it is difficult recognize who belongs in which ancestral line, so I developed a 2D visualizer that uses D3.js to graph members' ancestral lines. On the page, users are also able to filter through specific lines, which would promptly show only members within such lines.",
        tags: ["React", "D3.js", "JavaScript", "CSS", "Data Visualization"]
    },
    {
        id: 7,
        title: "Hoa Viet Market Business Website",
        image: "hoa_viet_market.png",
        url: "https://www.hoa-viet-market.lyyeric.tech/",
        description: "I developed a website for a small Vietnamese business in Los Angeles, focusing on contact pages, operating hours, customer accommodations, a photo gallery, and Google Maps integration. The site's design captures the business's essence and provides visitors with a relevant information about the Hoa Viet market.",
        tags: ["HTML", "CSS", "JavaScript", "Google Maps API", "Yelp API", "Responsive Design"]
    },
    {
        id: 8,
        title: "Evolutionary AI Bolbs",
        image: "bolbs-evolutionary-simulator.png",
        url: "https://bolb-simulator-v1.vercel.app/",
        description: "Bolbs are randomly spawned with attributes like speed, color, hunger-timer, will-to-multiply, and age-timers. They sustain themselves by eating plants or other bolbs. Cannibalization events offer a chance for multiplication, based on the bolb's will-to-multiply. Offsprings inherit similar genetic attributes. As generations progress, bolbs optimize their balance between speed, hunger-timer, and will-to-multiply. Natural predators are introductable to tests the species' resilience.",
        tags: ["JavaScript", "HTML Canvas", "Genetic Algorithms", "CSS", "Simulation"]
    },
    {
        id: 9,
        title: "Martingale Betting Simulator",
        image: "martingale.png",
        url: "https://replit.com/@lyyeric/martingale-betting-simulator#",
        description: "In traditional gambling, players usually lose money but can occasionally win big. The martingale betting strategy reverses these odds, allowing players to often make money but risking occasional big losses. It relies on having enough funds to cover losing streaks and doubling the bet after each loss. In my simulator, users can test their chances by inputting their original money, betting amounts, and the number of rounds they want to play.",
        tags: ["Python", "NumPy", "Matplotlib", "Simulation", "Statistics"]
    },
    {
        id: 10,
        title: "Funtime Trivia",
        image: "funtime_trivia.png",
        url: "https://project-day-4.lyyeric.repl.co/",
        description: "During my Google CSSI program, I worked with two other engineers to develop a gamified, learning platform. We implemented several game modes, that ranged from music, history, culture, food, etc. We integrated multiple pages, and utilized APIs from Giphy and Api-Ninja. Our tech stack was also primarily HTML/CSS, Bulma, and vanilla Javascript.",
        tags: ["HTML", "CSS", "JavaScript", "Bulma", "Giphy API"]
    },
    {
        id: 11,
        title: "Language Quiz",
        image: "language_quiz.png",
        url: "https://cssi-2022-day-7-1.lyyeric.repl.co/",
        description: "During my Google CSSI program, I built upon a language quiz guesser. I implemented several features, such as a counter that tracked how many guesses the user had. I also added more languages to guess for, and I added more colors! My tech stack was primarily HTML/CSS, Bulma, and vanilla Javascript.",
        tags: ["HTML", "CSS", "JavaScript", "Bulma"]
    },
    {
        id: 12,
        title: "Multi-mode Pong",
        image: "p5_pong.png",
        url: "https://editor.p5js.org/lyyy.eric/full/FOjoMB4WQ",
        description: "Play with friends, where each player can navigate their paddles via the keyboard keys. Play solo, and battle against two possible AI bots that mimicks real players. Or, watch as a spectator, as AI bots battle it out in Pong. Nuanced features includes ball-color transformations, after bounces, and a tracker to measure how fast the ball is moving.",
        tags: ["p5.js", "JavaScript", "Game Development", "Canvas"]
    },
    {
        id: 13,
        title: "Amelioration",
        image: "amelioration.png",
        url: "https://editor.p5js.org/lyyy.eric/full/Fi3PUVueB",
        description: "During Google's Code Next Connect program, I created a sprite-based runner game in p5.js, inspired by Jetpack Joyride and Temple Run. The objective is to reach the last spaceship while avoiding lava pits. I playtested the game with friends and mentors, incorporated critical feedback, and added features like high-score tracking, scenery transformations, speed variations, customizable skins, pausing mechanics, and background music.",
        tags: ["p5.js", "JavaScript", "Game Development", "Sprites", "Web Audio API"]
    }
];
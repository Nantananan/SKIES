// ============================================================
// THE LITTLE PRINCE - JOURNEY
// Main interaction script: navigation, prince animation,
// modals, and interactive loop demonstrations.
// ============================================================


// ==========================================
// CUSTOM ASSET CONFIGURATION (ARRAY SUPPORTED)
// ==========================================
// Central place to swap out image files used throughout the site.
const ASSETS = {
  bird: 'assts/bird.png',           // Used by the FOR loop demo (Floor 1)
  rose: 'assts/redrose.png',        // Used by the DO-WHILE loop demo (Floor 4) and the Fox button
  sittingPrince: 'assts/littleprincesitting.png', // Prince's "sitting on planet" pose

  // The 4 illustrations for his journey across floors.
  // Index position matches the floor index (0 = Floor 1, 1 = Floor 2, etc.)
  princeForms: [
    'assts/littleprincebird.png',       // Floor 1 (Leaps to center)
    'assts/littleprincefall_left.png',  // Floor 2 (Falling)
    'assts/littleprincefall_right.png', // Floor 3 (Tumbling)
    'assts/littleprinceidle.png'        // Floor 4 (Landing)
  ]
};

// Initialize images on load — inject the starting sprites into the DOM
document.getElementById('sitting-img').src = ASSETS.sittingPrince;
document.getElementById('prince-img').src = ASSETS.princeForms[0];


// ==========================================
// THE CINEMATIC CLICK INTERACTION
// ==========================================
// Tracks whether the prince is currently in his "sitting on B-612" pose.
let isPrinceSitting = true;

/**
 * Called when the user clicks the sitting prince on Floor 1.
 * Switches him from "sitting" to "ready/traveling" state, which
 * triggers a CSS transition that flies him to the center of the screen.
 */
function togglePrincePosture(event) {
  if (event) event.stopPropagation(); // Prevents the planet's modal from also opening

  // Swap to his "Ready" illustration
  document.getElementById('prince-img').src = ASSETS.princeForms[0];

  // Setting this attribute triggers the CSS transition:
  // the sitting sprite fades out, and the traveling sprite
  // fades in while flying to the center of the screen.
  document.body.setAttribute('data-prince-state', 'ready');
  isPrinceSitting = false;
}


// ==========================================
// NAVIGATION LOGIC (With automatic illustration swapping)
// ==========================================
const strip = document.getElementById('floor-strip');
const floors = Array.from(document.querySelectorAll('.floor'));
let currentIndex = 0;     // Which floor (0-3) is currently active
let isAnimating = false;  // Prevents overlapping floor transitions

/**
 * Moves the "camera" to a given floor index.
 * Slides the floor-strip vertically and updates the prince's
 * position/illustration to match the new floor.
 * @param {number} index - Target floor index (0 = Floor 1 ... 3 = Floor 4)
 */
const goToFloor = (index) => {
  // Guard: ignore invalid indexes or clicks while already animating
  if (index < 0 || index >= floors.length || isAnimating) return;

  // Auto-activate the prince if the user scrolls down without
  // clicking him first (so he isn't left behind, still "sitting")
  if (currentIndex === 0 && index > 0 && isPrinceSitting) {
    document.body.setAttribute('data-prince-state', 'ready');
    isPrinceSitting = false;
  }

  // If returning home (e.g., via the Snake button), reset him to sitting!
  if (index === 0) {
    document.body.removeAttribute('data-prince-state');
    isPrinceSitting = true;
  }

  currentIndex = index;
  isAnimating = true;

  // Slide the floor-strip so the target floor scrolls into view
  strip.style.transform = `translateY(${-floors[index].offsetTop}px)`;

  // Tell CSS which floor is now active, so it can position the prince correctly
  document.body.setAttribute('data-active-floor', index);

  // Swap the prince's illustration dynamically as he "falls" through floors
  document.getElementById('prince-img').src = ASSETS.princeForms[index];

  // Unlock navigation once the CSS transition (1000ms) finishes
  setTimeout(() => { isAnimating = false; }, 1000);
};

// Mouse wheel navigation: scroll down = next floor, scroll up = previous floor
window.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) < 15) return; // Ignore tiny/accidental scroll jitter
  goToFloor(currentIndex + (e.deltaY > 0 ? 1 : -1));
}, { passive: true });


// ==========================================
// METEOR SHOWER EASTER EGG (Triggered by 'E' key or Hidden Planet)
// ==========================================
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e') triggerMeteorShower();
});

/**
 * Spawns 15 temporary shooting-star elements at random positions,
 * each with a random flight duration, then removes them once
 * their animation completes.
 */
function triggerMeteorShower() {

  // FOR LOOP: runs exactly 15 times (i = 0 through 14) to create 15 stars.
  for (let i = 0; i < 15; i++) {
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Randomize each star's starting position across the screen
    const startX = Math.random() * 120 - 20; // -20vw to 100vw (slightly off-edge)
    const startY = Math.random() * 120 - 20; // -20vh to 100vh
    star.style.left = `${startX}vw`;
    star.style.top = `${startY}vh`;

    // Randomize flight duration for a more natural, staggered shower
    const duration = 2.0 + Math.random() * 3.0; // 2s to 5s
    star.style.animation = `shoot ${duration}s linear forwards`;

    document.body.appendChild(star);

    // Clean up: remove the star from the DOM after its animation finishes
    setTimeout(() => { star.remove(); }, duration * 1000 + 100);
  }
}


// ==========================================
// CUSTOM MESSAGE MODAL
// ==========================================
/**
 * Displays the message modal with the given text.
 * @param {string} text - Message to show inside the modal box.
 */
function showModal(text) {
  document.getElementById('modal-text').innerText = text;
  document.getElementById('custom-modal').classList.add('visible');
}

/** Hides the message modal. */
function closeModal() {
  document.getElementById('custom-modal').classList.remove('visible');
}


// ==========================================
// INTERACTIVE LOOPS
// ==========================================

/**
 * FOR LOOP DEMO (Floor 1 - Home Planet)
 * Spawns 15 birds one-by-one around the home planet, each appearing
 * with a slight delay so they visually cascade in as a flock.
 */
function runForLoop() {
  const homePlanet = document.getElementById('home-planet');
  const statusText = document.getElementById('for-status');
  const numBirds = 15;

  // Clear any birds left over from a previous run
  document.querySelectorAll('.cloned-bird').forEach(el => el.remove());
  statusText.innerText = "Spawning...";

  // FOR LOOP: counts from 0 up to (but not including) numBirds.
  // Each iteration schedules ONE bird to appear via setTimeout,
  // staggered by 150ms per bird, so bird #0 appears instantly,
  // bird #1 appears 150ms later, bird #2 appears 300ms later, etc.
  for (let i = 0; i < numBirds; i++) {
    setTimeout(() => {
      const bird = document.createElement('img');
      bird.src = ASSETS.bird;
      bird.className = 'loop-sprite cloned-bird';

      // Slight random jitter so birds don't spawn in a perfectly straight line
      bird.style.left = `${150 + (i * 20) + (Math.random() * 20)}px`;
      bird.style.top = `${-50 - (i * 20)}px`;

      homePlanet.appendChild(bird);
      statusText.innerText = `Birds spawned: ${i + 1} / ${numBirds}`;
    }, i * 150);
  }
}

/**
 * DO-WHILE LOOP DEMO (Floor 4 - Earth)
 * Plants 40 roses across the ground, guaranteed to run at least once
 * (that's the defining trait of a do-while loop vs. a regular while loop).
 */
function runDoWhileLoop() {
  const hollowGround = document.getElementById('ground-hollow');
  const statusText = document.getElementById('dowhile-status');
  let roseCount = 0;
  const totalRoses = 40;

  // Clear any roses left over from a previous run
  document.querySelectorAll('.cloned-rose').forEach(el => el.remove());
  statusText.innerText = "Planting...";

  // DO-WHILE LOOP: the code inside `do { ... }` always runs at least
  // ONCE before the `while (condition)` is even checked. Here it keeps
  // scheduling roses until roseCount reaches totalRoses (40).
  do {
    const currentCount = roseCount; // Capture the current value for this iteration's closure

    setTimeout(() => {
      const rose = document.createElement('img');
      rose.src = ASSETS.rose;
      rose.className = 'loop-sprite cloned-rose';

      // Random position within the visible grass area of the Earth image
      rose.style.left = `${8 + (Math.random() * 84)}%`;
      rose.style.top = `${35 + (Math.random() * 35)}%`;

      hollowGround.appendChild(rose);
      statusText.innerText = `Roses planted: ${currentCount + 1} / ${totalRoses}`;
    }, currentCount * 50); // Staggered by 50ms per rose

    roseCount++;
  } while (roseCount < totalRoses); // Condition checked AFTER each pass
}


// ==========================================
// CHOICES BUTTONS (Fox & Snake - Floor 4)
// ==========================================
let foxInterval = null; // Holds the interval ID so it can be stopped later

/**
 * FOX BUTTON: "Stay and tame the fox" choice.
 * Toggles an infinite rose-planting loop on/off using setInterval.
 * Unlike the do-while demo (which runs a fixed 40 times), this runs
 * continuously every 150ms until the user clicks Fox again or picks Snake.
 */
function chooseFox() {
  const hollow = document.getElementById('ground-hollow');

  // If the loop is already running, clicking again STOPS it.
  if (foxInterval) {
    clearInterval(foxInterval);
    foxInterval = null;
    return;
  }

  // setInterval acts like an ongoing loop: this callback re-runs
  // every 150ms, indefinitely, until clearInterval() is called.
  foxInterval = setInterval(() => {
    const rose = document.createElement('img');
    rose.src = ASSETS.rose;
    rose.className = 'loop-sprite cloned-rose';

    // Random position within the visible grass area, matching the do-while demo
    const horizontalPos = 8 + (Math.random() * 84);
    const verticalPos = 35 + (Math.random() * 35);

    rose.style.position = 'absolute';
    rose.style.left = `${horizontalPos}%`;
    rose.style.top = `${verticalPos}%`;

    // Random scale + rotation so roses look naturally scattered, not uniform
    const rotation = -15 + Math.random() * 30;
    rose.style.transform = `scale(${0.6 + Math.random() * 0.8}) rotate(${rotation}deg)`;

    hollow.appendChild(rose);
  }, 150);
}

/**
 * SNAKE BUTTON: "Fly back home" choice.
 * Stops the fox's rose-planting loop (if running) and sends the
 * prince back to Floor 1 (the home planet).
 */
function chooseSnake() {
  if (foxInterval) {
    clearInterval(foxInterval);
    foxInterval = null;
  }
  goToFloor(0);
}
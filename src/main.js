import "./style.css";

// --- DOM Elements ---
const aquarium = document.getElementById("aquarium");
const addFishBtn = document.getElementById("add-fish-btn");
const removeFishBtn = document.getElementById("remove-fish-btn");
const fishCountEl = document.getElementById("fish-count");
const bubblesContainer = document.getElementById("bubbles");
// --- Constants ---
// Array of available fish images in the /public folder
const FISH_ASSETS = [
  "/fish1.png",
  "/fish2.png",
  "/fish3.png",
  "/fish4.png",
  "/fish5.png",
];

// Constants for randomizing fish size
const MIN_FISH_SIZE = 30; // pixels
const MAX_FISH_SIZE = 80; // pixels
const FISH_ASPECT_RATIO = 5 / 3; // apect ratio of our fish (width/height)

// --- State ---
let fishes = []; // An array to hold our fish objects

// --- Functions ---

function createBubble() {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  // Randomize properties
  const size = Math.random() * 10 + 5; // size between 5px and 15px
  const leftPosition = Math.random() * 100; // position between 0% and 100%
  const animationDuration = Math.random() * 8 + 5; // duration between 5s and 13s
  const animationDelay = Math.random() * 5; // start delay up to 5s

  // Apply randomized styles
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${leftPosition}%`;
  bubble.style.animationDuration = `${animationDuration}s`;
  bubble.style.animationDelay = `${animationDelay}s`;

  // Add an event listener to remove the bubble from the DOM when its animation ends
  // This is good for performance, preventing thousands of invisible elements.
  bubble.addEventListener("animationend", () => {
    bubble.remove();
  });

  bubblesContainer.appendChild(bubble);
}

/**
 * Updates the fish count display on the page.
 */

function updateFishCount() {
  fishCountEl.textContent = fishes.length;
}

/**
 * Creates a new fish with random properties and adds it to the aquarium.
 */
function addFish() {
  const aquariumRect = aquarium.getBoundingClientRect();

  // Create the fish DOM element as an image
  const fishElement = document.createElement("img");
  fishElement.classList.add("fish");

  // ** NEW: Randomly pick a fish image **
  const randomFishSrc =
    FISH_ASSETS[Math.floor(Math.random() * FISH_ASSETS.length)];
  fishElement.src = randomFishSrc;

  // ** NEW: Randomize fish size **
  const newWidth =
    Math.random() * (MAX_FISH_SIZE - MIN_FISH_SIZE) + MIN_FISH_SIZE;
  const newHeight = newWidth / FISH_ASPECT_RATIO;
  fishElement.style.width = `${newWidth}px`;
  fishElement.style.height = `${newHeight}px`;

  // Create a JavaScript object to track the fish's state
  const fish = {
    element: fishElement,
    x: Math.random() * (aquariumRect.width - newWidth),
    y: Math.random() * (aquariumRect.height - newHeight),
    speedX: (Math.random() - 0.5) * 2,
    speedY: (Math.random() - 0.5) * 1,
    // Store size for collision detection
    width: newWidth,
    height: newHeight,
  };

  // Ensure speed is not too slow
  if (Math.abs(fish.speedX) < 0.5) fish.speedX = fish.speedX < 0 ? -0.5 : 0.5;

  // Add the new fish to our array and to the DOM
  fishes.push(fish);
  aquarium.appendChild(fishElement);

  updateFishCount();
}

/**
 * Removes the most recently added fish from the aquarium.
 */
function removeFish() {
  if (fishes.length === 0) return;

  const fishToRemove = fishes.pop();
  fishToRemove.element.remove(); // Remove from DOM

  updateFishCount();
}

/**
 * The main animation loop.
 * This function will be called on every frame to move the fish.
 */
function animate() {
  const aquariumRect = aquarium.getBoundingClientRect();

  fishes.forEach((fish) => {
    // Update position
    fish.x += fish.speedX;
    fish.y += fish.speedY;

    // Boundary detection and direction change
    // ** UPDATED: Use stored width/height for accuracy **
    if (fish.x <= 0 || fish.x >= aquariumRect.width - fish.width) {
      fish.speedX *= -1;
    }
    if (fish.y <= 0 || fish.y >= aquariumRect.height - fish.height) {
      fish.speedY *= -1;
    }

    // Flip the fish image based on its horizontal direction
    if (fish.speedX > 0) {
      fish.element.style.transform = "scaleX(1)"; // Facing right
    } else {
      fish.element.style.transform = "scaleX(-1)"; // Facing left
    }

    // Apply new position to the DOM element
    fish.element.style.left = `${fish.x}px`;
    fish.element.style.top = `${fish.y}px`;
  });

  // Request the next frame
  requestAnimationFrame(animate);
}

// --- Event Listeners ---
addFishBtn.addEventListener("click", addFish);
removeFishBtn.addEventListener("click", removeFish);

// --- Initial Setup ---
// Start with a few fish
for (let i = 0; i < 5; i++) {
  addFish();
}

setInterval(createBubble, 700);

// Start the animation loop!
animate();

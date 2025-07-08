import "./style.css";

// --- DOM Elements ---
const aquarium = document.getElementById("aquarium");
const addFishBtn = document.getElementById("add-fish-btn");
const removeFishBtn = document.getElementById("remove-fish-btn");
const feedFishBtn = document.getElementById("feed-fish-btn");
const fishCountEl = document.getElementById("fish-count");
const bubblesContainer = document.getElementById("bubbles");
const feedSpan = document.getElementById("feed-span");

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
let isFeedingMode = false;
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

function toggleFeedingMode() {
  isFeedingMode = !isFeedingMode;
  document.body.classList.toggle("feeding-mode", isFeedingMode);

  if (isFeedingMode) {
    feedFishBtn.textContent = "🛑";
    feedSpan.innerHTML = "Stop Feeding";
  } else {
    feedFishBtn.textContent = "🥫";
    feedSpan.innerHTML = "Feed Fish";
  }
}

/**
 * Updates a fish's health bar color based on its health percentage.
 * @param {object} fish The fish object to update.
 */
function updateHealthBar(fish) {
  const { health, healthBarElement } = fish;
  healthBarElement.style.width = `${health}%`;

  // Remove previous color classes
  healthBarElement.classList.remove(
    "health-green",
    "health-orange",
    "health-red"
  );

  // Add the correct new color class
  if (health > 50) {
    healthBarElement.classList.add("health-green");
  } else if (health > 0) {
    healthBarElement.classList.add("health-orange");
  } else {
    healthBarElement.classList.add("health-red");
  }
}

/**
 * Increases a specific fish's health.
 * @param {object} fish The fish object to feed.
 */
function feedFish(fish) {
  fish.health = Math.min(100, fish.health + 20); // Add 5, but cap at 100
}

/**
 * Creates a new fish with random properties and adds it to the aquarium.
 */
function addFish() {
  const aquariumRect = aquarium.getBoundingClientRect();

  // Create a container for the fish and its health bar
  const fishContainer = document.createElement("div");
  fishContainer.classList.add("fish");

  // Create the health bar elements
  const healthBarContainer = document.createElement("div");
  healthBarContainer.classList.add("health-bar-container");
  const healthBar = document.createElement("div");
  healthBar.classList.add("health-bar", "health-green"); // Start green
  healthBarContainer.appendChild(healthBar);

  // Create the fish image element
  const fishImage = document.createElement("img");
  fishImage.classList.add("fish-image");
  const randomFishSrc =
    FISH_ASSETS[Math.floor(Math.random() * FISH_ASSETS.length)];
  fishImage.src = randomFishSrc;

  // Append elements to the container
  fishContainer.appendChild(healthBarContainer);
  fishContainer.appendChild(fishImage);

  // Randomize size
  const newWidth =
    Math.random() * (MAX_FISH_SIZE - MIN_FISH_SIZE) + MIN_FISH_SIZE;
  const newHeight = newWidth / FISH_ASPECT_RATIO;
  fishContainer.style.width = `${newWidth}px`;
  fishContainer.style.height = `${newHeight}px`;

  // Create the fish state object
  const fish = {
    element: fishContainer,
    healthBarElement: healthBar, // Reference to the health bar
    health: 100, // Starts at 100%
    healthDecayRate: Math.random() * 0.02 + 0.01, // Slow, random decay
    x: Math.random() * (aquariumRect.width - newWidth),
    y: Math.random() * (aquariumRect.height - newHeight),
    speedX: (Math.random() - 0.5) * 2,
    speedY: (Math.random() - 0.5) * 1,
    width: newWidth,
    height: newHeight,
  };

  if (Math.abs(fish.speedX) < 0.5) fish.speedX = fish.speedX < 0 ? -0.5 : 0.5;

  // ** NEW: Add click listener for feeding **
  fishContainer.addEventListener("click", () => {
    if (isFeedingMode) {
      feedFish(fish);
    }
  });

  fishes.push(fish);
  aquarium.appendChild(fishContainer);
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

  // Filter out dead fish and update the rest
  fishes = fishes.filter((fish) => {
    // If fish health is 0 or less, remove it
    if (fish.health <= 0) {
      fish.element.remove(); // Remove from DOM
      return false; // Remove from array
    }

    // Decrease health over time
    fish.health -= fish.healthDecayRate;

    // Update visuals
    updateHealthBar(fish);

    // Update position
    fish.x += fish.speedX;
    fish.y += fish.speedY;

    if (fish.x <= 0 || fish.x >= aquariumRect.width - fish.width)
      fish.speedX *= -1;
    if (fish.y <= 0 || fish.y >= aquariumRect.height - fish.height)
      fish.speedY *= -1;

    fish.element.style.transform = `scaleX(${fish.speedX > 0 ? 1 : -1})`;
    fish.element.style.left = `${fish.x}px`;
    fish.element.style.top = `${fish.y}px`;

    return true; // Keep fish in the array
  });

  // Update the count in case a fish was removed
  updateFishCount();

  requestAnimationFrame(animate);
}
// --- Event Listeners ---
addFishBtn.addEventListener("click", addFish);
removeFishBtn.addEventListener("click", removeFish);
feedFishBtn.addEventListener("click", toggleFeedingMode);
// --- Initial Setup ---
// Start with a few fish
for (let i = 0; i < 5; i++) {
  addFish();
}

setInterval(createBubble, 700);

// Start the animation loop!
animate();

window.addEventListener("load", () => {
  const audio = document.getElementById("bgsound");
  audio.volume = 0.07;
  audio.loop = true;
  // Try to play automatically
  audio.play().catch(() => {
    // If blocked, wait for user interaction
    // const playOnUserInteraction = () => {
    //   audio.play();
    //   document.removeEventListener("click", playOnUserInteraction);
    // };
    // document.addEventListener("click", playOnUserInteraction);
  });
});

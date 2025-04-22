import "/style.css"; // Ensure CSS is imported
import Pokedex from "pokedex-promise-v2";

const options = {
  protocol: "https",
  hostName: "pokeapi.co",
  versionPath: "/api/v2/",
  cacheLimit: 100 * 1000,
  timeout: 10 * 1000,
};
const pokemon = new Pokedex(options);

// --- DOM Elements ---
const searchButton = document.getElementById("searchButton");
const pokemonNameInput = document.getElementById("pokemonName");
const pokemonInfoDiv = document.getElementById("pokemonInfo");
const voiceSearchButton = document.getElementById("voiceSearchButton");
const historyList = document.getElementById("historyList");

// --- State ---
let searchHistory = []; // Now stores full data objects
const MAX_HISTORY_LENGTH = 3;
let lastDisplayedPokemon = null; // Track the last displayed Pokémon

// --- Functions ---

const updateHistoryDisplay = (justAddedName = null) => {
  historyList.innerHTML = ""; // Clear current list visually
  if (searchHistory.length === 0) {
    historyList.innerHTML =
      '<li class="italic text-sm text-center text-gray-600">No history yet.</li>';
  } else {
    searchHistory.forEach((pokemonData, index) => {
      const li = document.createElement("li");
      li.classList.add("cursor-pointer"); // Make whole card clickable

      // Determine scale based on index
      let scale = 1.0; // Default scale for the newest item
      if (index === 1) scale = 0.8;
      else if (index === 2) scale = 0.6;

      // Apply scale via inline style
      li.style.transform = `scale(${scale})`;

      // Build the inner HTML for the history card
      li.innerHTML = `
                <h4 class="text-center">${
                  pokemonData.name.charAt(0).toUpperCase() +
                  pokemonData.name.slice(1)
                }</h4>
                <img src="${pokemonData.sprites.front_default}" alt="${
        pokemonData.name
      }">
                <p><strong>Type(s):</strong> ${pokemonData.types
                  .map((t) => t.type.name)
                  .join(", ")}</p>
                <p><strong>Height:</strong> ${pokemonData.height / 10} m</p>
                <p><strong>Weight:</strong> ${pokemonData.weight / 10} kg</p>
            `;

      // Add click listener to the card
      li.addEventListener("click", () => {
        pokemonNameInput.value = pokemonData.name; // Set input value
        searchPokemon(); // Trigger search
      });

      // Animation for the newest item
      if (index === 0 && pokemonData.name === justAddedName) {
        li.classList.add("history-item-enter");
        // Apply initial scale for animation start
        li.style.transform = `translateX(-50px) scale(${scale * 0.9})`; // Start smaller
        setTimeout(() => {
          li.classList.remove("history-item-enter");
          // Transition back to the target scale
          li.style.transform = `scale(${scale})`;
        }, 10); // Small delay
      }

      historyList.appendChild(li);
    });
  }
};

const displayPokemonInfo = (data) => {
  const pokemonName = data.name; // Keep name for comparison
  pokemonInfoDiv.innerHTML = `
        <h2 class="text-2xl font-semibold mb-2">${
          pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)
        }</h2>
        <img src="${
          data.sprites.front_default
        }" alt="${pokemonName}" class="mx-auto mb-4 w-32 h-32">
        <p><strong>Type(s):</strong> ${data.types
          .map((typeInfo) => typeInfo.type.name)
          .join(", ")}</p>
        <p><strong>Height:</strong> ${data.height / 10} m</p>
        <p><strong>Weight:</strong> ${data.weight / 10} kg</p>
    `;

  // --- Update History ---
  // Only add the previous Pokémon to history (not the current one)
  if (lastDisplayedPokemon && lastDisplayedPokemon.name !== data.name) {
    // Remove if already exists
    searchHistory = searchHistory.filter(
      (item) => item.name !== lastDisplayedPokemon.name
    );
    // Add to beginning
    searchHistory.unshift(lastDisplayedPokemon);
    // Limit history length
    if (searchHistory.length > MAX_HISTORY_LENGTH) {
      searchHistory = searchHistory.slice(0, MAX_HISTORY_LENGTH);
    }
    updateHistoryDisplay(lastDisplayedPokemon.name);
  } else {
    updateHistoryDisplay();
  }
  // Update lastDisplayedPokemon to current
  lastDisplayedPokemon = data;
};

const displayError = (error) => {
  if (error && error.response && error.response.status === 404) {
    pokemonInfoDiv.innerHTML = `<p class="text-orange-600">Sorry, Pokémon not found. Please check the spelling and try again.</p>`;
  } else {
    pokemonInfoDiv.innerHTML = `<p class="text-red-500">An error occurred while fetching Pokémon data. Please try again later.</p>`;
    console.error("Error fetching Pokémon:", error);
  }
};

const searchPokemon = () => {
  const name = pokemonNameInput.value.trim().toLowerCase();
  if (!name) {
    pokemonInfoDiv.innerHTML = `<p class="text-yellow-600">Please enter a Pokémon name.</p>`;
    return;
  }
  pokemonInfoDiv.innerHTML = `<p>Loading...</p>`;
  pokemon.getPokemonByName(name).then(displayPokemonInfo).catch(displayError);
};

// --- Event Listeners & Voice Search ---
searchButton.addEventListener("click", searchPokemon);

pokemonNameInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchPokemon();
  }
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  voiceSearchButton.addEventListener("click", () => {
    try {
      pokemonNameInput.placeholder = "Listening...";
      recognition.start();
      voiceSearchButton.classList.add("text-red-500");
    } catch (e) {
      console.error("Speech recognition already started.", e);
      pokemonNameInput.placeholder = "Enter Pokémon name or use mic";
    }
  });

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript.toLowerCase();
    pokemonNameInput.value = speechResult;
    searchPokemon();
  };

  recognition.onspeechend = () => {
    recognition.stop();
    pokemonNameInput.placeholder = "Enter Pokémon name or use mic";
    voiceSearchButton.classList.remove("text-red-500");
  };

  recognition.onerror = (event) => {
    pokemonInfoDiv.innerHTML = `<p class="text-red-500">Voice recognition error: ${event.error}</p>`;
    console.error("Speech recognition error:", event);
    pokemonNameInput.placeholder = "Enter Pokémon name or use mic";
    voiceSearchButton.classList.remove("text-red-500");
  };

  recognition.onnomatch = (event) => {
    pokemonInfoDiv.innerHTML = `<p class="text-yellow-600">Didn't recognize that Pokémon name.</p>`;
    pokemonNameInput.placeholder = "Enter Pokémon name or use mic";
    voiceSearchButton.classList.remove("text-red-500");
  };
} else {
  console.warn("Web Speech API not supported in this browser.");
  voiceSearchButton.style.display = "none";
}

// --- Initial Setup ---
updateHistoryDisplay(); // Initialize history display on page load

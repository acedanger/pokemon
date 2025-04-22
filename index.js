import "/style.css"; // Import the CSS file
import Pokedex from "pokedex-promise-v2"; // Use bare specifier

const options = {
  protocol: "https",
  hostName: "pokeapi.co", // Use the actual PokeAPI host
  versionPath: "/api/v2/",
  cacheLimit: 100 * 1000, // 100s
  timeout: 10 * 1000, // 10s increased timeout
};
const pokemon = new Pokedex(options);

const searchButton = document.getElementById("searchButton");
const pokemonNameInput = document.getElementById("pokemonName");
const pokemonInfoDiv = document.getElementById("pokemonInfo");
const voiceSearchButton = document.getElementById("voiceSearchButton"); // Get voice button

const displayPokemonInfo = (data) => {
  pokemonInfoDiv.innerHTML = `
        <h2 class="text-2xl font-semibold mb-2">${
          data.name.charAt(0).toUpperCase() + data.name.slice(1)
        }</h2>
        <img src="${data.sprites.front_default}" alt="${
    data.name
  }" class="mx-auto mb-4 w-32 h-32">
        <p><strong>Type(s):</strong> ${data.types
          .map((typeInfo) => typeInfo.type.name)
          .join(", ")}</p>
        <p><strong>Height:</strong> ${data.height / 10} m</p>
        <p><strong>Weight:</strong> ${data.weight / 10} kg</p>
    `;
};

const displayError = (error) => {
  pokemonInfoDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
  console.error(error);
};

const searchPokemon = () => {
  const name = pokemonNameInput.value.trim().toLowerCase();
  if (!name) {
    pokemonInfoDiv.innerHTML = `<p class="text-yellow-600">Please enter a Pokémon name.</p>`;
    return;
  }
  pokemonInfoDiv.innerHTML = `<p>Loading...</p>`; // Provide loading feedback
  pokemon.getPokemonByName(name).then(displayPokemonInfo).catch(displayError);
};

searchButton.addEventListener("click", searchPokemon);

pokemonNameInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchPokemon();
  }
});

// --- Voice Search ---
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false; // Only listen for a single utterance
  recognition.lang = "en-US";
  recognition.interimResults = false; // We only want final results
  recognition.maxAlternatives = 1;

  voiceSearchButton.addEventListener("click", () => {
    try {
      pokemonNameInput.placeholder = "Listening...";
      recognition.start();
      voiceSearchButton.classList.add("text-red-500"); // Indicate listening
    } catch (e) {
      console.error("Speech recognition already started.", e);
      pokemonNameInput.placeholder = "Enter Pokémon name or use mic"; // Reset placeholder if error
    }
  });

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript.toLowerCase();
    pokemonNameInput.value = speechResult;
    // Optionally trigger search immediately after recognition
    searchPokemon();
  };

  recognition.onspeechend = () => {
    recognition.stop();
    pokemonNameInput.placeholder = "Enter Pokémon name or use mic";
    voiceSearchButton.classList.remove("text-red-500"); // Remove listening indicator
  };

  recognition.onerror = (event) => {
    pokemonInfoDiv.innerHTML = `<p class="text-red-500">Voice recognition error: ${event.error}</p>`;
    console.error("Speech recognition error:", event);
    pokemonNameInput.placeholder = "Enter Pokémon name or use mic";
    voiceSearchButton.classList.remove("text-red-500"); // Remove listening indicator
  };

  recognition.onnomatch = (event) => {
    pokemonInfoDiv.innerHTML = `<p class="text-yellow-600">Didn't recognize that Pokémon name.</p>`;
    pokemonNameInput.placeholder = "Enter Pokémon name or use mic";
    voiceSearchButton.classList.remove("text-red-500"); // Remove listening indicator
  };
} else {
  console.warn("Web Speech API not supported in this browser.");
  voiceSearchButton.style.display = "none"; // Hide button if not supported
}

const input = document.getElementById("autocomplete-input");
  const suggestionsList = document.getElementById("suggestions-list");

  input.addEventListener("input", async () => {
    const query = input.value;
    if (query.length < 3) {
      suggestionsList.innerHTML = "";
      return;
    }

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=913efa4470f1493686d0b3e935c2c881`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Clear previous suggestions
      suggestionsList.innerHTML = "";

      // Add new ones
      data.features.forEach((feature) => {
        const li = document.createElement("li");
        li.textContent = feature.properties.formatted;
        li.style.cursor = "pointer";
        li.onclick = () => {
          input.value = feature.properties.formatted;
          suggestionsList.innerHTML = ""; // Clear after selection
        };
        suggestionsList.appendChild(li);
      });

    } catch (error) {
      console.error("Autocomplete fetch error:", error);
    }
  });
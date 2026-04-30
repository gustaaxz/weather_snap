const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

// Mapeamento de códigos de clima WMO para ícones e textos
const weatherConfig = {
    0: { icon: "☀️", label: "Céu Limpo" },
    1: { icon: "🌤️", label: "Poucas Nuvens" },
    2: { icon: "⛅", label: "Parcialmente Nublado" },
    3: { icon: "☁️", label: "Nublado" },
    45: { icon: "🌫️", label: "Nevoeiro" },
    61: { icon: "🌧️", label: "Chuva Fraca" },
    80: { icon: "🌦️", label: "Pancadas de Chuva" },
    95: { icon: "⛈️", label: "Trovoada" }
};

async function getWeatherData() {
    const city = cityInput.value;
    if (!city) return;

    try {
        // 1. Geocodificação
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results) {
            alert("Cidade não encontrada.");
            return;
        }

        const { latitude, longitude, name, admin1 } = geoData.results[0];

        // 2. Busca do Clima (Forecast 7 dias)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=is_day,temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        updateUI(name, admin1, weatherData);

    } catch (error) {
        console.error("Erro na busca:", error);
    }
}

function updateUI(city, state, data) {
    const current = data.current;
    const daily = data.daily;

    // Atualiza Informações Básicas
    document.getElementById('city-display').innerText = `${city}, ${state || ''}`;
    document.getElementById('temp-display').innerText = Math.round(current.temperature_2m);
    document.getElementById('wind-display').innerText = `${current.wind_speed_10m} km/h`;
    document.getElementById('humidity-display').innerText = `${current.relative_humidity_2m}%`;
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    // Atualiza Ícone e Condição
    const config = weatherConfig[current.weather_code] || { icon: "🌡️", label: "Variável" };
    document.getElementById('main-icon').innerText = config.icon;
    document.getElementById('condition-display').innerText = config.label;

    // Troca o Tema (Dia/Noite)
    const body = document.body;
    if (current.is_day === 1) {
        body.style.backgroundColor = "#87BFFF"; // Dia
        body.classList.add('text-white');
    } else {
        body.style.backgroundColor = "#1E293B"; // Noite (Azul escuro)
    }

    // Atualiza Sugestão
    const suggestion = document.getElementById('suggestion-display');
    if (current.weather_code >= 61) {
        suggestion.innerText = "Melhor ficar em casa com um café e um bom livro! ☕📚";
    } else {
        suggestion.innerText = "O tempo está ótimo para uma caminhada ou museu! 🎨";
    }

    // Gera Previsão de 3 dias
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Limpa anterior

    for (let i = 1; i <= 3; i++) {
        const dayConfig = weatherConfig[daily.weather_code[i]] || { icon: "🌡️" };
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

        const dayHtml = `
            <div class="bg-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 border border-white/5">
                <span class="text-xs font-semibold opacity-70">${dayName}</span>
                <span class="text-2xl">${dayConfig.icon}</span>
                <span class="text-sm font-bold">${Math.round(daily.temperature_2m_max[i])}°C</span>
            </div>
        `;
        forecastContainer.innerHTML += dayHtml;
    }
}

// Eventos
searchBtn.addEventListener('click', getWeatherData);
cityInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') getWeatherData(); });

// Busca inicial padrão
cityInput.value = "Jaraguá do Sul";
getWeatherData();

function updateUI(city, state, data) {
    const current = data.current;
    const daily = data.daily;

    // 1. Atualiza Informações Básicas
    document.getElementById('city-display').innerText = `${city}, ${state || ''}`;
    document.getElementById('temp-display').innerText = Math.round(current.temperature_2m);
    document.getElementById('wind-display').innerText = `${current.wind_speed_10m} km/h`;
    document.getElementById('humidity-display').innerText = `${current.relative_humidity_2m}%`;
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    // 2. Atualiza Ícone e Condição
    const config = weatherConfig[current.weather_code] || { icon: "🌡️", label: "Variável" };
    document.getElementById('main-icon').innerText = config.icon;
    document.getElementById('condition-display').innerText = config.label;

    // --- LÓGICA DE TEMA (DIA / NOITE) ---
    const body = document.body;
    const suggestion = document.getElementById('suggestion-display');

    if (current.is_day === 1) {
        // TEMA DIA (Baseado na dia.png)
        body.style.backgroundColor = "#87BFFF"; 
        suggestion.innerText = "O tempo está ótimo para uma caminhada ou museu! 🎨";
    } else {
        // TEMA NOITE (Baseado na noite.png)
        body.style.backgroundColor = "#111827"; // Azul marinho bem escuro (Tailwind gray-900)
        suggestion.innerText = "Dia perfeito para um café quente e um bom livro! ☕📚";
    }

    // 3. Gera Previsão de 3 dias dinamicamente
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; 

    for (let i = 1; i <= 3; i++) {
        const dayConfig = weatherConfig[daily.weather_code[i]] || { icon: "🌡️" };
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

        const dayHtml = `
            <div class="bg-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 border border-white/5">
                <span class="text-xs font-semibold opacity-70">${dayName}</span>
                <span class="text-2xl">${dayConfig.icon}</span>
                <span class="text-sm font-bold">${Math.round(daily.temperature_2m_max[i])}°C</span>
            </div>
        `;
        forecastContainer.innerHTML += dayHtml;
    }
}

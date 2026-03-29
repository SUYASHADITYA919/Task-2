const continents = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];
const continentGrid = document.getElementById('continentGrid');
const countryList = document.getElementById('countryList');
const detailView = document.getElementById('detailView');
const viewTitle = document.getElementById('viewTitle');
const loader = document.getElementById('loader');

function init() {
    continentGrid.classList.remove('hidden');
    countryList.classList.add('hidden');
    detailView.classList.add('hidden');
    
    continentGrid.innerHTML = continents.map(cont => `
        <div class="relative h-24 w-full group cursor-pointer transition-all shadow-lg active:scale-95" onclick="fetchByContinent('${cont}')">
            <div class="absolute inset-0 bg-slate-700 rounded-lg border-2 border-amber-900 flex items-center px-8">
                <span class="text-xl font-bold opacity-20">${cont}</span>
            </div>
            <div class="absolute inset-0 bg-cyan-700 rounded-lg border-2 border-cyan-600 door-transition group-hover:door-open z-10 flex items-center px-8 shadow-xl">
                <i class="fas fa-location-dot text-2xl mr-4"></i>
                <span class="font-bold uppercase tracking-widest">${cont}</span>
            </div>
        </div>
    `).join('');
}

async function fetchByContinent(continent) {
    toggleLoader(true);
    try {
        const res = await fetch(`https://restcountries.com/v3.1/region/${continent}`);
        const data = await res.json();
        displayCountryList(data, continent);
    } catch (err) {
        alert("Failed to fetch countries.");
    } finally {
        toggleLoader(false);
    }
}

function displayCountryList(countries, regionName) {
    continentGrid.classList.add('hidden');
    detailView.classList.add('hidden');
    countryList.classList.remove('hidden');
    
    viewTitle.innerHTML = `<button onclick="goBack()" class="text-amber-500 mr-4"><i class="fas fa-arrow-left"></i> ${regionName}</button>`;
    
    countryList.innerHTML = countries.map(country => `
        <div onclick="fetchCountryDetail('${country.name.common}')" class="flex items-center bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-amber-500 transition cursor-pointer transition-all shadow-lg active:scale-95">
            <img src="${country.flags.svg}" class="w-40 h-15 object-cover rounded mr-4">
            <div>
                <h3 class="font-bold text-md">${country.name.common}</h3>
                <p class="text-slate-400 text-xs">Pop: ${country.population.toLocaleString()}</p>
            </div>
            <i class="fas fa-chevron-right ml-auto text-slate-600"></i>
        </div>
    `).join('');
}

async function fetchCountryDetail(name) {
    toggleLoader(true);
    continentGrid.classList.add('hidden'); 
    
    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`);
        if (!res.ok) throw new Error("Country not found");
        
        const [country] = await res.json();
        
        const capital = country.capital ? country.capital[0] : "N/A";
        const [lat, lng] = country.capitalInfo.latlng || [0, 0];
        
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const weatherData = await weatherRes.json();

        renderDetail(country, weatherData.current_weather);
    } catch (err) {
        alert("Error: " + err.message);
        goBack();
    } finally {
        toggleLoader(false);
    }
}

function renderDetail(c, w) {
    continentGrid.classList.add('hidden');
    countryList.classList.add('hidden');
    detailView.classList.remove('hidden');
    const capitalName = c.capital ? c.capital[0] : "No Capital";
    const languages = c.languages ? Object.values(c.languages).join(', ') : "Local Dialects";
    const [countryLat, countryLng] = c.latlng;
    const mapUrl = `https://www.google.com/maps?q=${countryLat},${countryLng}`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(c.name.common)}`;

    detailView.innerHTML = `
        <div class="md:flex bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div class="md:w-1/2 bg-black/10 flex items-center justify-center p-6">
                <a href="${googleSearchUrl}" target="_blank" title="Search ${c.name.common} on Google">
                <img src="${c.flags.svg}" alt="flag" class="w-full h-full max-h-80 y-40 shadow-2xl">
                </a>
            </div>
            <div class="p-8 md:w-1/2">
                <h2 class="text-4xl font-bold mb-4 text-amber-500">${c.name.common}</h2>
                <div class="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div><span class="text-slate-400">Capital:</span> ${capitalName}</div>
                    <div><span class="text-slate-400">Region:</span> ${c.region}</div>
                    <div><span class="text-slate-400">Population:</span> ${c.population.toLocaleString()}</div>
                    <div><span class="text-slate-400">Timezone:</span> ${c.timezones[0]}</div>
                </div>
                
                <div class="bg-slate-500/10 p-4 rounded-lg mb-6">
                    <h4 class="font-bold uppercase text-amber-500 mb-2">Live Weather in ${capitalName}</h4>
                    <p class="text-2xl">${w.temperature}°C <span class="text-sm text-slate-300 ml-2">Wind: ${w.windspeed} km/h</span></p>
                </div>

                <div class="space-y-2 mb-8">
                    <p><strong>Languages:</strong> ${Object.values(c.languages || {}).join(', ')}</p>
                    <p><strong>Cultural Note:</strong> In ${c.name.common}, you'll find diverse traditions and unique local cuisine.</p>
                </div>
                
                <div class="flex items-center space-y-4 mb-8">
                    <a href="${mapUrl}" target="_blank" class="flex items-center text-sm text-slate-400 hover:text-white transition group">
                        <span class="mr-3">View on Google Map</span>
                        <div class="p-2 bg-slate-900 rounded-full border border-slate-600 group-hover:border-amber-500 transition">
                            <i class="fas fa-map-marked-alt text-2xl text-amber-500 group-hover:scale-110 transition-all shadow-lg active:scale-95"></i>
                        </div>
                    </a>
                </div>
                <button onclick="goBack()" class="mt-8 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95">
                    ← Back to Explorer
                </button>
            </div>
        </div>
    `;
}

function toggleLoader(show) { 
    loader.classList.toggle('hidden', !show); 
}

function goBack() { 
    continentGrid.classList.remove('hidden'); 
    countryList.classList.add('hidden'); 
    detailView.classList.add('hidden');
    viewTitle.innerText = "Select a Continent Portal";
    document.getElementById('searchInput').value = "";
}

async function searchCountry() {
    const input = document.getElementById('searchInput').value.trim();
    if(!input) return;
    fetchCountryDetail(input);
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCountry();
});

init();
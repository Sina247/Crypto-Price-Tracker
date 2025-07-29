const cryptoList = document.getElementById('cryptoList');
const status = document.getElementById('status');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const searchInput = document.getElementById('searchInput');

let currentPage = 1;
const perPage = 40;
let allCoins = [];

async function fetchCryptoPrices(page = 1) {
	status.textContent = 'Loading data...';
	cryptoList.innerHTML = '';

	try {
		const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`);
		if (!res.ok) throw new Error('Failed to fetch data');
		const data = await res.json();

		if (data.length === 0 && page > 1) {
			nextBtn.disabled = true;
			currentPage--;
			return;
		}

		else {
			nextBtn.disabled = false;
		}

		allCoins = data;

		renderCoins(allCoins);

		pageInfo.textContent = `Page ${page}`;
		prevBtn.disabled = page === 1;
		status.textContent = '';
	}

	catch (error) {
		status.textContent = '❌ Error fetching data, please try again.';
		console.error(error);
	}
}

function renderCoins(coins) {
	cryptoList.innerHTML = '';
	if (coins.length === 0) {
		cryptoList.innerHTML = '<p class="col-span-full text-center text-gray-400">No results found.</p>';
		return;
	}

	coins.forEach(coin => {
		const priceChange = coin.price_change_percentage_24h;
		const priceChangeColor = priceChange >= 0 ? 'text-green-400' : 'text-red-400';

		const card = document.createElement('div');
		card.className = 'bg-gray-800 rounded-lg p-5 shadow-lg flex flex-col items-center text-center';

		card.innerHTML = `
        <img src="${coin.image}" alt="${coin.name}" class="w-16 h-16 mb-4" />

        <h2 class="text-xl font-semibold mb-1">${coin.name} (${coin.symbol.toUpperCase()})</h2>

        <p class="text-lg font-bold mb-2">$${coin.current_price.toLocaleString()}</p>

        <p class="${priceChangeColor} font-semibold">${priceChange?.toFixed(2) ?? '0.00'}%</p>

        <p class="text-gray-400 text-sm mt-2">Last Updated: ${new Date(coin.last_updated).toLocaleTimeString()}</p>
      `;

		cryptoList.appendChild(card);
	});
}

searchInput.addEventListener('input', () => {
	const query = searchInput.value.trim().toLowerCase();
	if (!query) {
		renderCoins(allCoins);
		return;
	}

	const filtered = allCoins.filter(c =>
		c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
	);
	renderCoins(filtered);
});

prevBtn.addEventListener('click', () => {
	if (currentPage > 1) {
		currentPage--;
		fetchCryptoPrices(currentPage);
		searchInput.value = '';
	}
});

nextBtn.addEventListener('click', () => {
	currentPage++;
	fetchCryptoPrices(currentPage);
	searchInput.value = '';
});

fetchCryptoPrices(currentPage);

setInterval(() => fetchCryptoPrices(currentPage), 60000);

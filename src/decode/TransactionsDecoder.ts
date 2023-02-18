import fs from "fs";

const FILENAME_PATH = "../../data/transactions.csv";

let transactions: any = []
let prices: any = {};
let last = '0x28ca558da5aa514b8979ff4751470395025156f325de29967e7301e3e790ec70';

export async function transformTransactions() {
	fs.readFile(FILENAME_PATH, 'utf-8', async function (err: any, data: any) {
		let lines = data.replace(/\r/g, '').split('\n');
		for (let i = 0; i < lines.length; i++)
			lines[i] = lines[i].split(',');
		let symbols: any = {};
		console.log("> last index:", findLastIndex(lines));
		for (let i = findLastIndex(lines); i < lines.length; i++) {
			let info = lines[i][9].split(' ');
			let datum = {
				timestamp: 1000 * parseInt(lines[i][1]),
				time: lines[i][2],
				tokenId: lines[i][6],
				hash: lines[i][0],
				action: lines[i][3],
				buyer: lines[i][4],
				price: parseFloat(info[0]),
				eth_price: parseFloat(info[0]),
				symbol: info[1],
				broker: lines[i][lines[i].length - 1]
			};
			if (!datum.symbol) {
				console.log("> err:", datum);
				return;
			}
			let eth_price = await getEthPrice(datum);
			datum.eth_price *= eth_price;
			if (datum.eth_price > 100) {
				console.log("> err:", datum);
				return;
			}
			console.log("> data", datum, eth_price);
			symbols[datum.symbol] = true;
			transactions.push({ ...datum });
			if (i % 100 == 0)
				fs.writeFileSync("../../data/transactionsDecoded2.json", JSON.stringify(transactions));
		}
		console.log(">> prices: ", prices);
		console.log(symbols);
	});
}


function findLastIndex(lines: any) {
	if (last === "")
		return 0;
	for (let i = 0; i < lines.length; i++)
		if (lines[i][0] === last) {
			let index = i;
			while (index < lines.length && lines[index][0] === last) index++;
			return index;
		}
	return lines.length;
}

function waitTime(millis: number) {
	let start = Date.now(), currentDate = null;
	do { currentDate = Date.now(); } while (currentDate - start < millis);
}

async function getEthPrice(datum: any) {
	let date = datum.time.split(' ')[0].replace(/-/g, '');
	if (datum.symbol === 'APE')
		return await requestEthPrice('apecoin', date);
	if (datum.symbol === 'DAI')
		return await requestEthPrice('dai', date);
	if (datum.symbol === 'USDC')
		return await requestEthPrice('usd-coin', date);
	if (datum.symbol === 'SAND')
		return await requestEthPrice('the-sandbox', date);
	if (datum.symbol === 'ATRI')
		return await requestEthPrice('atari', date);
	if (datum.symbol === 'RARI')
		return await requestEthPrice('rarible', date);
	if (datum.symbol === 'MANA')
		return await requestEthPrice('decentraland', date);
	if (datum.symbol === 'SCOTT')
		return await requestEthPrice('scotty-beam', date);
	if (datum.symbol === 'WBTC')
		return await requestEthPrice('bitcoin', date);
	if (datum.symbol === 'CUBE')
		return (parseInt(date) >= 20200221) ? await requestEthPrice('somnium-space-cubes', date) : 0.0003952656375559863;
	waitTime(200);
	return 1;
}

async function requestEthPrice(symbol: any, date: any) {
	if (prices[symbol + date])
		return prices[symbol + date];
	let url = "https://api.coingecko.com/api/v3/coins/" + symbol + "/history?date="
		+ date.substr(6) + "-" + date.substr(4, 2) + "-" + date.substr(0, 4);
	console.log("> url:", url);
	let response: any = await fetch(url, { method: 'GET' });
	response = await response.json();
	prices[symbol + date] = response.market_data.current_price.eth;
	waitTime(1000);
	return prices[symbol + date];
}

async function writeFile() {
	fs.writeFileSync("../../data/transactionsDecoded.json", JSON.stringify(transactions));
}

transformTransactions();

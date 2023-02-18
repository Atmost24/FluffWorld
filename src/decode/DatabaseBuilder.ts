import fs from "fs";
import transactionsDecoded from '../data/decodedTransactions/transactionsDecoded.json';

const DAYSIZE = 24 * 3600 * 1000;
const START = 1535760000000;
const LO = 20;

interface ITransaction {
	priceProperty: number;
}

let transactions: any[] = transactionsDecoded;

export function processTransactions() {
	let dict: any = {},
		timestamp: any = {};
	for (let transaction of transactions)
		if (transaction.eth_price > 0.05 && transaction.eth_price < LO) {
			let date = transaction.time.split(" ")[0].replace(/-/g, "");
			if (!dict[date]) {
				dict[date] = [];
				timestamp[date] = transaction.timestamp;
			}
			dict[date].push(transaction.eth_price);
		}
	let lines = "date;day;average;median;deviation";
	for (let date of Object.keys(dict)) {
		dict[date].sort(function (a: any, b: any) {
			return a - b;
		});
		let day = Math.floor((timestamp[date] - START) / DAYSIZE) + 1;
		let mid = Math.floor(dict[date].length / 2);
		let median =
			dict[date].length % 2 == 0 ? (dict[date][mid] + dict[date][mid - 1]) / 2.0 : dict[date][mid];
		let line =
			date + ";" + day + ";" + average(dict[date]) + ";" + median + ";" + deviation(dict[date]);
		lines += "\n" + line;
	}
	fs.writeFile("../data/database/database.csv", lines, function (err) {
		if (err) console.log(err);
	});

}

function average(values: any) {
	let sum = 0;
	for (let value of values) sum += value;
	return sum / values.length;
}

function deviation(values: any) {
	if (values.length < 2) return 0;
	let avg = average(values),
		sum = 0;
	for (let value of values) sum += (value - avg) * (value - avg);
	return Math.sqrt(sum / (values.length - 1));
}

processTransactions();
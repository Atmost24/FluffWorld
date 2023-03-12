import axios from "axios";
import fs from "fs";

const url = "https://api.fluf.world/api/token/";

async function data() {
	let traits: any[] = [];
	for (let i = 0; i < 10000; i++) {
		let information: any = await api(url + i);
		traits.push(information);
		console.log(">>information of fluff ", i);
	}
	fs.writeFileSync("src/data/traitsArray.json", JSON.stringify(traits));
}

async function api(url: string) {
	try {
		const { data, status } = await axios.get(url, {
			headers: {
				Accept: "application/json",
			},
		});
		return data;
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			console.log("error message: ", error.message);
			return error.message;
		} else {
			console.log("unexpected error: ", error);
			return "An unexpected error occurred";
		}
	}
}

data();

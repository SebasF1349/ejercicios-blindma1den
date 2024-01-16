import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process"

const countries = [
    {
        name: "Andorra",
        season: "winter",
        costs: 100,
        activities: "skiing",
    },
    {
        name: "Switzerland",
        season: "winter",
        costs: 100,
        activities: "tour of the Swiss Alps",
    },
    {
        name: "Spain",
        season: "summer",
        costs: 400,
        activities: "hiking and extreme sports activities",
    },
    {
        name: "Portugal",
        season: "summer",
        costs: 400,
        activities: "beaches",
    },
    {
        name: "France",
        season: "spring",
        costs: 300,
        activities: "hiking and extreme sports activities",
    },
    {
        name: "Italy",
        season: "spring",
        costs: 300,
        activities: "cultural and historical tour",
    },
    {
        name: "Belgium",
        season: "autumn",
        costs: 200,
        activities: "hiking and extreme sports activities",
    },
    {
        name: "Austria",
        season: "autumn",
        costs: 200,
        activities: "cultural and historical tour",
    },
];

console.log(`
Welcome to our travel agency. We have a special offer for travelling in any season of 2024.
Let us help you to choose the best destination for you.
`);

const rl = readline.createInterface({ input, output });

const budget = await rl.question("What is your budget? ");

if (isNaN(+budget) || +budget <= 0) {
    // TODO: re-ask
    console.log("Incorrect budget");
    process.exit(0);
}

const countriesAfterBudget = countries.filter((c) => c.costs <= budget);

if (countriesAfterBudget.length === 0) {
    console.log("We don't have any promo with that budget");
    process.exit(0);
}

const seasons = countriesAfterBudget.reduce((acc, c) => {
    if (!acc.includes(c.season)) acc.push(c.season);
    return acc;
}, []);

let countriesAfterSeason;

if (seasons.length > 1) {
    const seasonsStr = seasons.map((s, i) => `${i + 1}. ${s}`).join("\n");

    const season = await rl.question(`\n${seasonsStr}\nWhich season do you prefer? `);

    if (isNaN(+season) || +season < 1 || +season > seasons.length || +season % 1 !== 0) {
        // TODO: re-ask
        console.log("Incorrect option");
        process.exit(0);
    }

    countriesAfterSeason = countriesAfterBudget.filter((c) => c.season === seasons[season - 1]);
} else {
    countriesAfterSeason = countriesAfterBudget;
}

const activity = await rl.question(`\n1.${countriesAfterSeason[0].activities}\n2.${countriesAfterSeason[1].activities}\nWhich activities do you prefer? `);

if (+activity !== 1 && +activity !== 2) {
    // TODO: re-ask
    console.log("Incorrect option");
    process.exit(0);
}

console.log(`Your perfect destination is ${countriesAfterSeason[activity - 1].name}`);

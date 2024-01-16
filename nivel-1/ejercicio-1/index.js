import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process"

const players = [
    {
        name: "Bruno Fernandes",
        jersey: 8,
        goals: 5,
        speed: 6,
        assists: 9,
        passing: 10,
        defensive: 3
    },
    {
        name: "Rasmus Hojlund",
        jersey: 11,
        goals: 12,
        speed: 8,
        assists: 2,
        passing: 6,
        defensive: 2
    },
    {
        name: "Harry Maguire",
        jersey: 5,
        goals: 1,
        speed: 5,
        assists: 1,
        passing: 7,
        defensive: 9
    },
    {
        name: "Alejandro Garnacho",
        jersey: 17,
        goals: 8,
        speed: 5,
        assists: 1,
        passing: 6,
        defensive: 0
    },
    {
        name: "Mason Mount",
        jersey: 7,
        goals: 2,
        speed: 6,
        assists: 4,
        passing: 8,
        defensive: 1
    },
];

let menuOption = 0;

while (menuOption != 9) {
    console.log(`
MANCHESTER UNITED 
1.Player Review
2.Compare two players
3.Identify the fastest player
4.Identify the top goal scorer
5.Identify the player with the most assists
6.Identify the player with the highest passing accuracy
7.Identify the player with the most defensive involvements
9.Quit
`);

    const rl = readline.createInterface({ input, output });
    menuOption = await rl.question("Select an option between 1-7: ");
    switch (menuOption) {
        case "1":
            await playerReview();
            break;
        case "2":
            await compare();
            break;
        case "3":
            const fastest = best("speed");
            console.log(`The fastest player is ${fastest.name} with a speed of ${fastest.value}`);
            break;
        case "4":
            const goals = best("goals");
            console.log(`The top goal scorer is ${goals.name} with a total of ${goals.value} goals`);
            break;
        case "5":
            const assists = best("assists");
            console.log(`The player with the most assists is ${assists.name} with a total of ${assists.value} assists`);
            break;
        case "6":
            const passing = best("passing");
            console.log(`The player with the highest passing accuracy is ${passing.name} with a total of ${passing.value} passing points`);
            break;
        case "7":
            const defense = best("defensive");
            console.log(`The player with the most defensive involvements is ${defense.name} with ${defense.value} defensive points`);
            break;
        case "9":
            break;
        default:
            console.log("Incorrect option");
            break;
    }
    rl.close();
}

async function playerReview() {
    const jerseyNumber = await rl.question("Input the jersey number of the player: ");
    let found = false;
    //for (let i = 0; i < players.length; i++) {
    //  console.log(players[i]);
    //}
    for (const player of players) {
        if (player.jersey === Number(jerseyNumber)) {
            found = true;
            console.log(player);
        }
    }
    if (!found) {
        console.log("Player not found");
    }
}

async function compare() {
    playerReview();
    playerReview();
}

function best(key) {
    if (!key in players[0]) {
        console.log("Incorrect Key");
    }
    // si hay repetidos me quedo con el primero
    const best = {
        name: "",
        value: -1,
    }
    for (const player of players) {
        if (player[key] > best.value) {
            best.name = player.name;
            best.value = player[key];
        }
    }
    return best;
}

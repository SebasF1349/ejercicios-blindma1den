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

console.log(`
MANCHESTER UNITED 
1.Player Review
2.Compare two players
3.Identify the fastest player
4.Identify the top goal scorer
5.Identify the player with the most asists
6.Identify the player with the highest passing accuracy
7.Identify the player with the most defensive involvements
`);

const rl = readline.createInterface({ input, output });
const menuOption = await rl.question("Select an option between 1-7: ");
switch (menuOption) {
    case "1":
        await playerReview();
        break;
    case "2":
        compare();
        break;
    case "3":
        fastest();
        break;
    case "4":
        topGoal();
        break;
    case "5":
        mostAssits();
        break;
    case "6":
        passingAccuracy();
        break;
    case "7":
        defense();
        break;
    default:
        break;
}
rl.close();

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

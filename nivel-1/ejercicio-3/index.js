import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process"
import sqlite3 from "sqlite3"
import { open } from "sqlite"

// The Valencia Hospital is developing an application to manage appointments. Design an algorithm for this application with the following features:
//
// It must have a login and validate the data; after the third failed attempt, it should be locked.
// The user can schedule an appointment for: General Medicine, Emergency Care, Clinical Analysis, Cardiology, Neurology, Nutrition, Physiotherapy, Traumatology, and Internal Medicine.
// There are 3 doctors for each specialty.
// The user can only book one appointment per specialist. An error message should be displayed if the user tries to choose two appointments with the same doctor or the same specialty. As a developer, you can choose the doctors" names.
// The maximum limit for appointments, in general, is 3.
// Upon selecting a specialty, it will display if the user prefers a morning or afternoon appointment and show available hours. As a developer, you can choose the hours.
// Display available specialists.
// The user can choose their preferred specialist.
// The basic process is: Login -> Choose specialty -> Choose doctor -> Choose time slot.

// db.serialize(() => {
//     db.run(`CREATE TABLE specialty (
//     id   INTEGER,
//     name TEXT
// )`).run(`INSERT INTO specialty (id, name) VALUES 
// (0, "General Medicine"),
// (1, "Emergency Care"),
// (2, "Clinical Analysis"),
// (3, "Cardiology"),
// (4, "Neurology"),
// (5, "Nutrition"),
// (6, "Physiotherapy"),
// (7, "Traumatology"),
// (8, "Internal Medicine")
// `)
// });
//
// db.serialize(() => {
//     db.run(`CREATE TABLE doctors (
//     id        INTEGER,
//     name      TEXT,
//     specialty INTEGER
// )`).run(`INSERT INTO doctors (id, name, specialty) VALUES 
// (0, "Kike", 0),
// (1, "Cancino", 0),
// (2, "Neto", 0),
// (3, "Itsa", 1),
// (4, "Jayler", 1),
// (5, "Pablo", 1),
// (6, "ksreyr", 2),
// (7, "Daniel", 2),
// (8, "Pedro", 2),
// (9, "Pablo Judas", 3),
// (10, "Andres", 3),
// (11, "Sebas", 3),
// (12, "Daniela", 4),
// (13, "Irene", 4),
// (14, "Karen", 4),
// (15, "Melissa", 5),
// (16, "Valeria", 5),
// (17, "Mercedes", 5),
// (18, "Belen", 6),
// (19, "Andrea", 6),
// (20, "Benicio", 6),
// (21, "Marcela", 7),
// (22, "Jhoa", 7),
// (23, "Auri", 7),
// (24, "Seri", 8),
// (25, "Analia", 8),
// (26, "Jhoana", 8)
// `)
// });
//
// db.serialize(() => {
//     db.run(`CREATE TABLE patients (
//     id        INTEGER,
//     name      TEXT,
//     password  INTEGER,
//     locked    INTEGER
// )`).run(`INSERT INTO patients (id, name, password, locked) VALUES 
// (0, "Kike", 123, 0),
// (1, "Cancino", 573, 0),
// (2, "Neto", 245, 0),
// (3, "Itsa", 124, 1),
// (4, "Jayler", 257, 0)`)
// });
//
// db.run(`CREATE TABLE appointments (
//     id          INTEGER,
//     patient_ID  INTEGER,
//     doctor_ID   INTEGER,
//     day         TEXT,
//     hour        INTEGER
// )`);


let db = await open({
    filename: "./db/hospital.db",
    driver: sqlite3.Database
});

const rl = readline.createInterface({ input, output });

// be aware we are locking the third username added
for (let i = 0; i < 3; i++) {
    const username = await rl.question("Username: ");
    const password = await rl.question("Password: ");
    if (await correctLogin(username, password)) break;
    if (i === 2) {
        console.log("Tercer intento incorrecto. El usuario ha sido bloqueado.");
        await userLocked(username);
    } else {
        console.log("Usuario o contraseña incorrecta.");
    }
}

const specialties = await findSpecialties();
const specialty_id = selectOption(specialties);

const doctors = await findDoctors();
const doctor_id = selectOption(doctors);

console.log("logueado!");

db.close();
rl.close();

async function selectOption(options) {
    for (const option of options) {
        console.log(`${option.id}. ${option.name}`);
    }

    const option_answer = await rl.question("Select the option number: ");

    let option_id = -1;
    for (const option of options) {
        if (option.id === +option_answer) {
            option_id = option.id;
        }
    }

    if (option_id === -1) {
        console.log("Incorrect option id");
        process.exit(1);
    }

    return option_id
}

async function correctLogin(username, password) {
    let sql = `SELECT id, locked
FROM patients
WHERE name = "${username}" AND
password = "${password}"`;

    try {
        const { id, locked } = await db.get(sql);
        return id !== undefined && locked === 0
    } catch (err) {
        console.log(`Error: ${err}`)
    }
}

async function userLocked(username) {
    let sql = `UPDATE patients
            SET locked = 1
            WHERE name = "${username}"`
    try {
        await db.run(sql);
    } catch (err) {
        console.log(`Error: ${err}`)
    }
    process.exit(1);
}

async function findSpecialties() {
    let sql = `SELECT id, name
FROM specialty
`;

    try {
        return await db.all(sql);
    } catch (err) {
        console.log(`Error: ${err}`)
    }
}

async function findDoctors(specialty_id) {
    let sql = `SELECT id, name
FROM doctors
WHERE specialty = "${specialty_id}
`;

    try {
        return await db.all(sql);
    } catch (err) {
        console.log(`Error: ${err}`)
    }
}

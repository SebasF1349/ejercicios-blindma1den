import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process"
// check better-sqlite3 next time, looks interesting
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

//CREATE TABLE specialty (
//id   INTEGER PRIMARY KEY,
//name TEXT
//INSERT INTO specialty (id, name) VALUES 
// ("General Medicine"),
// ("Emergency Care"),
// ("Clinical Analysis"),
// ("Cardiology"),
// ("Neurology"),
// ("Nutrition"),
// ("Physiotherapy"),
// ("Traumatology"),
// ("Internal Medicine")
//
//CREATE TABLE doctors (
//id        INTEGER PRIMARY KEY,
//name      TEXT,
//specialty INTEGER
//
//INSERT INTO doctors (id, name, specialty) VALUES 
// ("Kike", 0),
// ("Cancino", 0),
// ("Neto", 0),
// ("Itsa", 1),
// ("Jayler", 1),
// ("Pablo", 1),
// ("ksreyr", 2),
// ("Daniel", 2),
// ("Pedro", 2),
// ("Pablo Judas", 3),
// ("Andres", 3),
// ("Sebas", 3),
// ("Daniela", 4),
// ("Irene", 4),
// ("Karen", 4),
// ("Melissa", 5),
// ("Valeria", 5),
// ("Mercedes", 5),
// ("Belen", 6),
// ("Andrea", 6),
// ("Benicio", 6),
// ("Marcela", 7),
// ("Jhoa", 7),
// ("Auri", 7),
// ("Seri", 8),
// ("Analia", 8),
// ("Jhoana", 8)
//
//CREATE TABLE patients (
//id        INTEGER PRIMARY KEY,
//name      TEXT,
//password  INTEGER,
//locked    INTEGER
//
// INSERT INTO patients (id, name, password, locked) VALUES 
// ("Kike", 123, 0),
// ("Cancino", 573, 0),
// ("Neto", 245, 0),
// ("Itsa", 124, 1),
// ("Jayler", 257, 0)
//
//CREATE TABLE appointments (
//     id          INTEGER PRIMARY KEY,
//     patient_ID  INTEGER,
//     doctor_ID   INTEGER,
//     day         TEXT,
//     hour        INTEGER
//)


let db = await open({
    filename: "./db/hospital.db",
    driver: sqlite3.Database
});

const rl = readline.createInterface({ input, output });

let patient_id;
// be aware we are locking the third username added
for (let i = 0; i < 3; i++) {
    const username = await rl.question("Username: ");
    const password = await rl.question("Password: ");
    patient_id = await correctLogin(username, password);
    if (patient_id) break;
    if (i === 2) {
        console.log("Tercer intento incorrecto. El usuario ha sido bloqueado.");
        await lockUser(username);
    } else {
        console.log("Usuario o contraseña incorrecta.");
    }
}

const specialties = await findSpecialties();
const specialty_id = await selectOption(specialties);
const alreadyUsedSpecialties = await getCurrentAppointmentSpecialties(patient_id);
if (alreadyUsedSpecialties.includes(specialty_id)) {
    console.log("Patient already have an appointment in that specialty");
    process.exit(0);
}

const doctors = await findDoctors(specialty_id);
const doctor_id = await selectOption(doctors);

const busyHours = await getBusyHours(doctor_id)
// all numbers between 8 to 10 + 8 (18) and filter busy hours
const availableHours = Array.from({ length: 10 }, (_, i) => 8 + i).filter((h) => !busyHours.includes(h));

console.log("Available hours:");
console.log(`${availableHours.join("\n")}`);
const hour_selected = await rl.question("Select the preferred hour: ");

if (!availableHours.includes(+hour_selected)) {
    console.log("Incorrect hour");
    process.exit(0);
}

await saveAppointment(patient_id, doctor_id, +hour_selected);

console.log("Appointment saved.");

db.close();
rl.close();

async function selectOption(options) {
    for (const option of options) {
        console.log(`${option.id}. ${option.name}`);
    }

    const option_selected = await rl.question("Select the option number: ");

    let option_id = -1;
    for (const option of options) {
        if (option.id === +option_selected) {
            option_id = option.id;
        }
    }

    if (option_id === -1) {
        console.log("Incorrect option id");
        process.exit(0);
    }

    return option_id
}

async function correctLogin(username, password) {
    let sql = `SELECT id, locked
FROM patients
WHERE name = "${username}" AND
password = "${password}"`;

    try {
        const patient = await db.get(sql);
        return patient?.locked === 0 ? patient.id : false;
    } catch (err) {
        console.log(`Error: ${err}`)
    }
}

async function lockUser(username) {
    let sql = `UPDATE patients
                SET locked = 1
                WHERE name = "${username}"`
    try {
        await db.run(sql);
    } catch (err) {
        console.log(`Error: ${err}`)
    }
    process.exit(0);
}

async function findSpecialties() {
    let sql = `SELECT id, name
                FROM specialty`;

    try {
        return await db.all(sql);
    } catch (err) {
        console.log(`Error: ${err}`)
        process.exit(0);
    }
}

async function findDoctors(specialty_id) {
    let sql = `SELECT id, name
                FROM doctors
                WHERE specialty = ${specialty_id}`;

    try {
        return await db.all(sql);
    } catch (err) {
        console.log(`Error: ${err}`)
        process.exit(0);
    }
}

// todo: this should be decoupled
async function getCurrentAppointmentSpecialties(patient_id) {
    let sql = `SELECT doctor_id
                FROM appointments
                WHERE patient_id = ${patient_id}`;

    let doctors;
    try {
        doctors = await db.all(sql);
    } catch (err) {
        console.log(`error: ${err}`)
        process.exit(0);
    }

    if (doctors?.length === 0) {
        return []
    }

    if (doctors.length >= 3) {
        console.log("The patient already have 3 appointments and can't take more.");
        process.exit(0);
    }

    return doctors.map(async (d) => {
        sql = `SELECT specialty
                FROM doctors
                WHERE id = ${d}`;

        try {
            return await db.get(sql);
        } catch (err) {
            console.log(`Error: ${err}`)
            process.exit(0);
        }
    });
}

async function getBusyHours(doctor_id) {
    let sql = `SELECT hour
                FROM appointments
                WHERE doctor_ID = ${doctor_id}`;

    try {
        return await db.all(sql);
    } catch (err) {
        console.log(`error: ${err}`)
        process.exit(0);
    }
}

async function saveAppointment(patient_id, doctor_id, hour) {
    let sql = `INSERT INTO appointments (patient_ID, doctor_ID, day, hour) VALUES 
                (${patient_id}, ${doctor_id}, "70-1-1", ${hour})`;

    try {
        return await db.run(sql);
    } catch (err) {
        console.log(`error: ${err}`)
        process.exit(0);
    }
}

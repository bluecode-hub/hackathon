import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── UTILS: Parse CSV to JSON ───
function parseCSV(text) {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim());
        const row = {};
        headers.forEach((h, i) => {
            row[h] = vals[i];
        });
        return row;
    });
}

// ─── DATA SEEDING ───
// We'll just define the raw CSV here again to ensure it works in Node without transpilation issues
const CSV_DATA = `MemberID,Name,Age,SHGName,Role,Attendance,Savings,LoanStatus,LoanAmount,EMIStatus,JoinDate
SHG001,Sita Devi,34,Shakti Mahila SHG,President,96,18500,Active,50000,On Time,2023-01-15
SHG002,Rani Kumari,29,Shakti Mahila SHG,Treasurer,90,15200,Active,30000,On Time,2023-02-10
SHG003,Lakshmi Bai,41,Shakti Mahila SHG,Secretary,92,22300,None,0,N/A,2022-11-20
SHG004,Meena Devi,35,Shakti Mahila SHG,Member,85,12800,Closed,20000,Completed,2023-04-05
SHG005,Sunita Yadav,27,Ujjwala SHG,President,94,19400,Active,40000,On Time,2022-08-18
SHG006,Anjali Patel,32,Ujjwala SHG,Treasurer,88,14700,None,0,N/A,2023-03-11
SHG007,Kavita Singh,38,Ujjwala SHG,Secretary,91,21000,Active,60000,Delayed,2022-06-09
SHG008,Pooja Sharma,30,Ujjwala SHG,Member,82,10500,Closed,25000,Completed,2023-01-22
SHG009,Rekha Devi,45,Pragati SHG,President,98,30500,Active,100000,On Time,2020-07-19
SHG010,Nirmala Joshi,35,Pragati SHG,Treasurer,92,18900,None,0,N/A,2023-02-11
SHG011,Asha Kumari,28,Pragati SHG,Secretary,87,13600,Active,20000,On Time,2023-05-03
SHG012,Radha Mishra,40,Pragati SHG,Member,84,11200,Closed,35000,Completed,2022-09-01
SHG013,Savita Rao,37,Saraswati SHG,President,95,26700,Active,80000,On Time,2021-10-14
SHG014,Geeta Nair,33,Saraswati SHG,Treasurer,89,17500,None,0,N/A,2023-03-29
SHG015,Latha Iyer,42,Saraswati SHG,Secretary,93,24300,Active,50000,Delayed,2022-05-17
SHG016,Rukmini Das,31,Saraswati SHG,Member,86,12900,Closed,30000,Completed,2023-01-08
SHG017,Kamala Reddy,39,Nirmala SHG,President,97,28800,Active,90000,On Time,2021-12-02
SHG018,Bhavya Jain,26,Nirmala SHG,Treasurer,85,11400,None,0,N/A,2023-06-21
SHG019,Shobha Patil,44,Nirmala SHG,Secretary,90,20600,Active,45000,On Time,2022-07-30
SHG020,Neha Kulkarni,34,Nirmala SHG,Member,83,13200,Closed,25000,Completed,2023-02-14`;

const DB_FILE = path.join(__dirname, 'users.json');

export function seedData() {
    if (fs.existsSync(DB_FILE)) {
        console.log("Database exists.");
        return;
    }

    console.log("Seeding database from CSV...");
    const rows = parseCSV(CSV_DATA);
    const users = [];

    // 1. Create MEMBER accounts
    rows.forEach(row => {
        const username = row.Name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 100);
        users.push({
            id: "MEM-" + row.MemberID,
            username: username,
            password: "password123", // Default for hackathon
            role: "member",
            name: row.Name,
            shg: row.SHGName,
            fullProfile: row
        });
    });

    // 2. Create LEADER accounts (one per SHG)
    const shgs = [...new Set(rows.map(r => r.SHGName))];
    shgs.forEach((shg, i) => {
        const leaderUser = "admin_" + shg.split(' ')[0].toLowerCase();
        users.push({
            id: "LDR-" + (i + 1),
            username: leaderUser,
            password: "password123",
            role: "leader",
            name: "SHG Leader",
            shg: shg,
            walletBalance: 0, // Initial Sanctioned Limit
            fullProfile: null
        });
    });

    // 3. Create SUPER ADMIN
    users.push({
        id: "SA-001",
        username: "superadmin",
        password: "password123",
        role: "superadmin",
        name: "System Admin",
        shg: null,
        fullProfile: null
    });

    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
    console.log(`Seeded ${users.length} users.`);
}

export function getUsers() {
    if (!fs.existsSync(DB_FILE)) seedData();
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

export function updateUser(username, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        // Deep merge fullProfile if necessary, but for now top-level override is fine
        // If updating loan amount in fullProfile, sync it:
        if (users[idx].fullProfile && (updates.LoanAmount !== undefined || updates.LoanStatus !== undefined)) {
            users[idx].fullProfile = { ...users[idx].fullProfile, ...updates };
        }

        fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
        return users[idx];
    }
    return null;
}

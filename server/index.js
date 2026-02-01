import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { getUsers, seedData, updateUser } from './db.js';

const app = express();
const PORT = 3001; // Frontend is usually 5173

app.use(cors());
app.use(bodyParser.json());

// Initialize DB
seedData();

// ─── ROUTES ───

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Return sanitized user info (no password)
        const { password, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Admin: Sanction Funds to Leader
app.post('/api/admin/sanction', (req, res) => {
    const { leaderUsername, amount } = req.body;
    const users = getUsers();
    const leader = users.find(u => u.username === leaderUsername);

    if (!leader || leader.role !== 'leader') {
        return res.status(400).json({ success: false, message: "Invalid leader" });
    }

    const newBalance = (leader.walletBalance || 0) + Number(amount);
    const updated = updateUser(leaderUsername, { walletBalance: newBalance });
    res.json({ success: true, user: updated });
});

// Leader: Assign Loan to Member
app.post('/api/loans/assign', (req, res) => {
    const { leaderUsername, memberUsername, amount } = req.body;
    const users = getUsers();

    // 1. Check Leader Funds
    const leader = users.find(u => u.username === leaderUsername);
    if (!leader) return res.status(400).json({ success: false, message: "Leader not found" });

    const sanctionAmount = Number(amount);
    if ((leader.walletBalance || 0) < sanctionAmount) {
        return res.status(400).json({ success: false, message: "Insufficient sanctioned funds in wallet" });
    }

    // 2. Check Member
    const member = users.find(u => u.username === memberUsername);
    if (!member) return res.status(400).json({ success: false, message: "Member not found" });

    // 3. Execute Transaction
    // Deduct from Leader
    updateUser(leaderUsername, { walletBalance: leader.walletBalance - sanctionAmount });

    // Add to Member (Update top-level and fullProfile inside updateUser logic)
    // We update LoanAmount, LoanStatus, and maybe reset savings/earnings if this were a real complex app
    // For now just loan info
    const updatedMember = updateUser(memberUsername, {
        LoanAmount: sanctionAmount,
        LoanStatus: "Active",
        EMIStatus: "On Time" // Default start
    });

    res.json({ success: true, member: updatedMember, remainingBalance: leader.walletBalance - sanctionAmount });
});

// Get User (optional debugging)
app.get('/api/users', (req, res) => {
    const users = getUsers();
    // Return everything for now to simplify frontend matching
    res.json(users);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

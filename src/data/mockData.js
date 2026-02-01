export const RAW_CSV = `MemberID,Name,Age,SHGName,Role,Attendance,Savings,LoanStatus,LoanAmount,EMIStatus,JoinDate
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

export const NGOS = [
  { id: 1, name: "Udaya Mahila Sangha", city: "Udupi", state: "Karnataka", dist: 2.4, phone: "+91 82 0000 1234", email: "udaya@mahilasangha.org", focus: "Women Empowerment", addr: "12, MG Road, Udupi" },
  { id: 2, name: "Grameen Seva Trust", city: "Mangalore", state: "Karnataka", dist: 11.8, phone: "+91 82 0000 5678", email: "info@grameenseva.org", focus: "Rural Livelihood", addr: "45, Nehru Street, Mangalore" },
  { id: 3, name: "Shakti Foundation", city: "Bangalore", state: "Karnataka", dist: 184.2, phone: "+91 80 1234 5678", email: "connect@shakti.in", focus: "Micro Credit", addr: "101, Brigade Road, Bangalore" },
  { id: 4, name: "Kisan Seva Kendra", city: "Hassan", state: "Karnataka", dist: 132.7, phone: "+91 82 3456 7890", email: "kisan@kisanseva.org", focus: "Agri Finance", addr: "8, Station Road, Hassan" },
  { id: 5, name: "Jan Vikash NGO", city: "Shimoga", state: "Karnataka", dist: 98.5, phone: "+91 83 4567 8901", email: "admin@janvikash.org", focus: "Skill Development", addr: "22, Railway Line, Shimoga" },
  { id: 6, name: "Sarvadaya Trust", city: "Mysore", state: "Karnataka", dist: 161.0, phone: "+91 82 9876 5432", email: "trust@sarvadaya.org", focus: "Education & Finance", addr: "7, Dasara Square, Mysore" },
];

export const TRAINING_CATALOG = [
  { id: 1, title: "Financial Literacy Basics", totalLessons: 5 },
  { id: 2, title: "Group Management", totalLessons: 4 },
  { id: 3, title: "Loan Application Process", totalLessons: 3 },
  { id: 4, title: "Business Planning", totalLessons: 6 },
];

export const TRAINING_PROGRESS = {
  "Sita Devi": [5, 3, 1, 0],
  "Rani Kumari": [5, 4, 3, 2],
  "Lakshmi Bai": [4, 0, 0, 0],
  "Meena Devi": [5, 2, 0, 0],
  "Sunita Yadav": [5, 4, 2, 0],
  "Anjali Patel": [3, 0, 0, 0],
  "Kavita Singh": [5, 4, 3, 1],
  "Pooja Sharma": [5, 3, 1, 0],
  "Rekha Devi": [5, 4, 3, 3],
  "Nirmala Joshi": [5, 2, 0, 0],
  "Asha Kumari": [4, 1, 0, 0],
  "Radha Mishra": [5, 4, 2, 0],
  "Savita Rao": [5, 4, 3, 2],
  "Geeta Nair": [5, 3, 0, 0],
  "Latha Iyer": [5, 4, 3, 1],
  "Rukmini Das": [5, 2, 0, 0],
  "Kamala Reddy": [5, 4, 3, 2],
  "Bhavya Jain": [3, 0, 0, 0],
  "Shobha Patil": [5, 4, 2, 0],
  "Neha Kulkarni": [5, 3, 1, 0],
};

export const BANK_UPI_RECORDS = {
  // Shakti Mahila SHG — Sita Devi, Rani Kumari
  "UPI-TXN-20260128-9841": { amount: 5000, payer: "Sita Devi", status: "success" },
  "UPI-TXN-20260127-6610": { amount: 6000, payer: "Sita Devi", status: "success" },
  "UPI-TXN-20260130-1203": { amount: 3000, payer: "Rani Kumari", status: "success" },
  "UPI-TXN-20260201-8812": { amount: 7000, payer: "Rani Kumari", status: "success" },
  // Ujjwala SHG — Sunita Yadav, Kavita Singh
  "UPI-TXN-20260126-2210": { amount: 8000, payer: "Sunita Yadav", status: "success" },
  "UPI-TXN-20260131-4455": { amount: 5500, payer: "Sunita Yadav", status: "success" },
  "UPI-TXN-20260131-7754": { amount: 8000, payer: "Kavita Singh", status: "success" },
  "UPI-TXN-20260129-3380": { amount: 4500, payer: "Kavita Singh", status: "success" },
  // Pragati SHG — Rekha Devi, Asha Kumari
  "UPI-TXN-20260125-4421": { amount: 10000, payer: "Rekha Devi", status: "success" },
  "UPI-TXN-20260201-5570": { amount: 2500, payer: "Rekha Devi", status: "success" },
  "UPI-TXN-20260128-7701": { amount: 4000, payer: "Asha Kumari", status: "success" },
  "UPI-TXN-20260130-9920": { amount: 3500, payer: "Asha Kumari", status: "success" },
  // Saraswati SHG — Savita Rao, Latha Iyer
  "UPI-TXN-20260127-1144": { amount: 9000, payer: "Savita Rao", status: "success" },
  "UPI-TXN-20260131-6630": { amount: 6500, payer: "Savita Rao", status: "success" },
  "UPI-TXN-20260129-8870": { amount: 7000, payer: "Latha Iyer", status: "success" },
  "UPI-TXN-20260201-2233": { amount: 5000, payer: "Latha Iyer", status: "success" },
  // Nirmala SHG — Kamala Reddy, Shobha Patil
  "UPI-TXN-20260126-5500": { amount: 11000, payer: "Kamala Reddy", status: "success" },
  "UPI-TXN-20260130-7780": { amount: 8500, payer: "Kamala Reddy", status: "success" },
  "UPI-TXN-20260128-3344": { amount: 6000, payer: "Shobha Patil", status: "success" },
  "UPI-TXN-20260201-9910": { amount: 4000, payer: "Shobha Patil", status: "success" },
};

export const PENDING_LOANS_INIT = [
  { id: "LN-2024-001", member: "Sita Devi", requestedAmt: 50000, purpose: "Tailoring Business", bankStatus: "verified", bankRef: "BNK-VRF-84721", submittedOn: "2024-11-12", status: "awaiting_admin", sanctionedAmt: null },
  { id: "LN-2024-002", member: "Rani Kumari", requestedAmt: 75000, purpose: "Grocery Shop", bankStatus: "verified", bankRef: "BNK-VRF-91043", submittedOn: "2024-11-18", status: "awaiting_admin", sanctionedAmt: null },
  { id: "LN-2024-003", member: "Kavita Singh", requestedAmt: 60000, purpose: "Organic Farm Setup", bankStatus: "verified", bankRef: "BNK-VRF-77652", submittedOn: "2024-11-20", status: "awaiting_admin", sanctionedAmt: null },
  { id: "LN-2024-004", member: "Lakshmi Bai", requestedAmt: 30000, purpose: "Handicraft Unit", bankStatus: "pending", bankRef: "—", submittedOn: "2024-11-25", status: "bank_pending", sanctionedAmt: null },
  { id: "LN-2024-005", member: "Rekha Devi", requestedAmt: 45000, purpose: "Parlour Setup", bankStatus: "verified", bankRef: "BNK-VRF-65490", submittedOn: "2024-11-10", status: "approved", sanctionedAmt: 45000 },
];

export const MEETINGS = [
  {
    title: "Monthly General Meeting",
    date: "January 15, 2026 • 10:00 AM",
    badge: { label: "Completed", type: "success" },
    agenda: ["Review monthly savings contributions", "Discuss new loan applications", "Plan upcoming community event"],
    attendance: "18/20 members present (90%)",
    decisions: ["Approved loan of ₹40,000 for business expansion", "Decided to increase monthly savings target by ₹500", "Scheduled community health camp for Feb 10"],
  },
  {
    title: "Loan Review Meeting",
    date: "December 28, 2025 • 2:00 PM",
    badge: { label: "Completed", type: "success" },
    agenda: ["Review all active loans and EMI status", "Follow up on delayed payments", "Discuss loan policy updates"],
    attendance: "19/20 members present (95%)",
    decisions: ["Contacted members with delayed EMI payments", "Extended grace period for one member (medical)", "Updated loan interest rate policy"],
  },
  {
    title: "Financial Planning Workshop",
    date: "December 10, 2025 • 11:00 AM",
    badge: { label: "Workshop", type: "info" },
    agenda: ["Training on basic financial literacy", "Budgeting and savings strategies", "Understanding loan agreements"],
    attendance: "17/20 members present (85%)",
    decisions: ["Members gained financial planning understanding", "Created personal savings goals", "Discussed long-term group objectives"],
  },
];

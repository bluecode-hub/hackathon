// ─────────────────────────────────────────────
// EMBEDDED CSV BACKEND – single source of truth
// ─────────────────────────────────────────────
const RAW_CSV = `MemberID,Name,Age,SHGName,Role,Attendance,Savings,LoanStatus,LoanAmount,EMIStatus,JoinDate
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

// ─────────────────────────────────────────────
// CSV PARSER  (mirrors original csvLoader.js)
// ─────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const numericCols = new Set(["Age", "Attendance", "Savings", "LoanAmount"]);
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = numericCols.has(h) ? parseFloat(vals[i]) || 0 : vals[i];
    });
    return row;
  });
}

const ALL_MEMBERS = parseCSV(RAW_CSV);

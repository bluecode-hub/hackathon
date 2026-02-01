import { useState, useMemo, useCallback } from "react";

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

// ─────────────────────────────────────────────
// BANK VERIFICATION SYSTEM
// ─────────────────────────────────────────────
// Store for loan data with payment history
const loanDataStore = {};

// Initialize loan data for each member with active loans
ALL_MEMBERS.forEach(member => {
  if (member.LoanStatus === "Active") {
    loanDataStore[member.MemberID] = {
      originalAmount: member.LoanAmount,
      remainingAmount: member.LoanAmount,
      payments: [],
      lastPaymentDate: null
    };
  }
});

// Bank transaction verification function
function verifyBankTransaction(transaction, memberData) {
  const verification = {
    isValid: false,
    matchedFields: [],
    issues: [],
    confidence: 0
  };

  let matchScore = 0;
  const maxScore = 5;

  // 1. Name matching (case-insensitive, partial match)
  if (transaction.accountHolderName) {
    const transName = transaction.accountHolderName.toLowerCase().trim();
    const memberName = memberData.Name.toLowerCase().trim();
    
    // Check if names match or if one contains the other
    if (transName.includes(memberName) || memberName.includes(transName)) {
      verification.matchedFields.push("Name");
      matchScore += 2; // Name is very important
    } else {
      verification.issues.push("Name mismatch");
    }
  }

  // 2. Amount validation
  if (transaction.amount > 0) {
    verification.matchedFields.push("Amount");
    matchScore += 1;
  } else {
    verification.issues.push("Invalid amount");
  }

  // 3. Transaction timestamp validation
  if (transaction.timestamp) {
    const transDate = new Date(transaction.timestamp);
    const now = new Date();
    const daysDiff = (now - transDate) / (1000 * 60 * 60 * 24);
    
    // Transaction should be recent (within 30 days)
    if (daysDiff >= 0 && daysDiff <= 30) {
      verification.matchedFields.push("Timestamp");
      matchScore += 1;
    } else {
      verification.issues.push("Transaction too old or future-dated");
    }
  }

  // 4. Transaction reference/ID validation
  if (transaction.referenceNumber && transaction.referenceNumber.length >= 6) {
    verification.matchedFields.push("Reference Number");
    matchScore += 0.5;
  }

  // 5. Transaction type validation (should be credit/payment)
  if (transaction.type === "CREDIT" || transaction.type === "PAYMENT") {
    verification.matchedFields.push("Transaction Type");
    matchScore += 0.5;
  } else {
    verification.issues.push("Invalid transaction type");
  }

  // Calculate confidence percentage
  verification.confidence = Math.round((matchScore / maxScore) * 100);
  
  // Require at least 60% confidence to approve
  verification.isValid = verification.confidence >= 60;

  return verification;
}

// Process payment and update loan amount
function processLoanPayment(memberId, transaction, verificationResult) {
  if (!verificationResult.isValid) {
    return {
      success: false,
      message: "Transaction verification failed",
      verification: verificationResult
    };
  }

  const loanData = loanDataStore[memberId];
  if (!loanData) {
    return {
      success: false,
      message: "No active loan found for this member"
    };
  }

  // Check for duplicate payment
  const isDuplicate = loanData.payments.some(p => 
    p.referenceNumber === transaction.referenceNumber
  );

  if (isDuplicate) {
    return {
      success: false,
      message: "This transaction has already been processed"
    };
  }

  // Process the payment
  const paymentAmount = transaction.amount;
  const previousBalance = loanData.remainingAmount;
  const newBalance = Math.max(0, previousBalance - paymentAmount);

  // Record the payment
  const paymentRecord = {
    ...transaction,
    processedDate: new Date().toISOString(),
    previousBalance,
    newBalance,
    verification: verificationResult
  };

  loanData.payments.push(paymentRecord);
  loanData.remainingAmount = newBalance;
  loanData.lastPaymentDate = transaction.timestamp;

  // Update member data
  const member = ALL_MEMBERS.find(m => m.MemberID === memberId);
  if (member) {
    member.LoanAmount = newBalance;
    if (newBalance === 0) {
      member.LoanStatus = "Closed";
      member.EMIStatus = "Completed";
    } else {
      member.EMIStatus = "On Time";
    }
  }

  return {
    success: true,
    message: "Payment processed successfully",
    paymentRecord,
    previousBalance,
    newBalance,
    verification: verificationResult
  };
}

// Get payment history for a member
function getPaymentHistory(memberId) {
  const loanData = loanDataStore[memberId];
  if (!loanData) return [];
  return loanData.payments.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
}

// ─────────────────────────────────────────────
// DATA SERVICE  (mirrors original dataService.js)
// ─────────────────────────────────────────────
function getMembersBySHG(shg) {
  return ALL_MEMBERS.filter((m) => m.SHGName === shg);
}
function getAllSHGs() {
  return [...new Set(ALL_MEMBERS.map((m) => m.SHGName))].sort();
}
function getSHGStats(shg) {
  const members = getMembersBySHG(shg);
  const n = members.length;
  const totalSavings = members.reduce((s, m) => s + m.Savings, 0);
  const activeLoans = members.filter((m) => m.LoanStatus === "Active");
  const avgAttendance = members.reduce((s, m) => s + m.Attendance, 0) / n;
  const onTimeEMI = activeLoans.filter((m) => m.EMIStatus === "On Time").length;
  const delayedEMI = activeLoans.filter((m) => m.EMIStatus === "Delayed").length;
  return {
    totalMembers: n,
    totalSavings,
    activeLoans: activeLoans.length,
    avgAttendance: Math.round(avgAttendance * 10) / 10,
    totalLoanAmount: activeLoans.reduce((s, m) => s + m.LoanAmount, 0),
    onTimeEMI,
    delayedEMI,
  };
}
function calculateHealthScore(shg) {
  const stats = getSHGStats(shg);
  const activeLoans = getMembersBySHG(shg).filter((m) => m.LoanStatus === "Active");
  let onTimePct = 100;
  if (activeLoans.length > 0)
    onTimePct = (activeLoans.filter((m) => m.EMIStatus === "On Time").length / activeLoans.length) * 100;
  return Math.round(((stats.avgAttendance + onTimePct) / 2) * 10) / 10;
}
function getHealthStatus(score) {
  if (score >= 90) return { status: "Excellent", cls: "success" };
  if (score >= 80) return { status: "Good", cls: "info" };
  if (score >= 70) return { status: "Fair", cls: "warning" };
  return { status: "Needs Attention", cls: "danger" };
}
function getAllSHGSummaries() {
  return getAllSHGs().map((name) => {
    const stats = getSHGStats(name);
    return { name, ...stats, healthScore: calculateHealthScore(name) };
  });
}
function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

// ─────────────────────────────────────────────
// SHARED UI HELPERS
// ─────────────────────────────────────────────
const BADGE_COLORS = {
  success: { bg: "rgba(46,125,50,.15)", color: "#2e7d32", border: "#2e7d32" },
  warning: { bg: "rgba(245,124,0,.15)", color: "#f57c00", border: "#f57c00" },
  danger: { bg: "rgba(198,40,40,.15)", color: "#c62828", border: "#c62828" },
  info: { bg: "rgba(2,119,189,.15)", color: "#0277bd", border: "#0277bd" },
  secondary: { bg: "rgba(0,137,123,.15)", color: "#00897b", border: "#00897b" },
};

function Badge({ type = "info", children }) {
  const c = BADGE_COLORS[type] || BADGE_COLORS.info;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 20,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {children}
    </span>
  );
}

function ProgressBar({ value, maxW = 120 }) {
  return (
    <div style={{ height: 7, background: "#d4c5ad", borderRadius: 4, width: maxW, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(value, 100)}%`,
          background: "linear-gradient(90deg,#00897b,#4db6ac)",
          borderRadius: 4,
          transition: "width .5s",
        }}
      />
    </div>
  );
}

function loanBadge(status) {
  const map = { Active: "info", Closed: "success", None: "secondary" };
  return <Badge type={map[status] || "secondary"}>{status}</Badge>;
}
function emiBadge(status) {
  const map = { "On Time": "success", Delayed: "danger", Completed: "success", "N/A": "secondary" };
  const icons = { "On Time": "✓ ", Delayed: "⚠ ", Completed: "✓ " };
  return <Badge type={map[status] || "secondary"}>{(icons[status] || "") + status}</Badge>;
}
function attendanceBadge(att) {
  if (att >= 90) return <Badge type="success">Excellent</Badge>;
  if (att >= 80) return <Badge type="info">Good</Badge>;
  if (att >= 70) return <Badge type="warning">Fair</Badge>;
  return <Badge type="danger">Poor</Badge>;
}

// ─────────────────────────────────────────────
// BANK VERIFICATION MODAL
// ─────────────────────────────────────────────
function BankVerificationModal({ member, onClose, onPaymentProcessed }) {
  const [transactionData, setTransactionData] = useState({
    accountHolderName: "",
    amount: "",
    timestamp: "",
    referenceNumber: "",
    type: "CREDIT",
    bankName: "",
    utrNumber: ""
  });
  
  const [verificationResult, setVerificationResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const handleInputChange = (field, value) => {
    setTransactionData(prev => ({ ...prev, [field]: value }));
    setVerificationResult(null);
    setPaymentResult(null);
  };

  const handleVerify = () => {
    const result = verifyBankTransaction(transactionData, member);
    setVerificationResult(result);
  };

  const handleProcessPayment = () => {
    setProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const result = processLoanPayment(member.MemberID, transactionData, verificationResult);
      setPaymentResult(result);
      setProcessing(false);
      
      if (result.success && onPaymentProcessed) {
        setTimeout(() => {
          onPaymentProcessed(result);
          onClose();
        }, 2000);
      }
    }, 1000);
  };

  const loanData = loanDataStore[member.MemberID];
  const paymentHistory = getPaymentHistory(member.MemberID);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, maxWidth: 700,
        width: "100%", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "2px solid #d4c5ad",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h2 style={{ margin: 0, color: "#2d1b10", fontSize: 20 }}>
              🏦 Bank Payment Verification
            </h2>
            <p style={{ margin: "4px 0 0", color: "#5d4e37", fontSize: 13 }}>
              {member.Name} · {member.MemberID}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 24,
            color: "#5d4e37", cursor: "pointer", padding: 0
          }}>×</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Loan Summary */}
          <div style={{
            background: "linear-gradient(135deg, rgba(216,67,21,0.1), rgba(255,167,38,0.1))",
            border: "2px solid #d4c5ad", borderRadius: 12, padding: 16, marginBottom: 20
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                  Original Loan
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#d84315" }}>
                  {fmt(loanData?.originalAmount || member.LoanAmount)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                  Remaining Balance
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#00897b" }}>
                  {fmt(loanData?.remainingAmount || member.LoanAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Input Form */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, color: "#2d1b10", marginBottom: 12 }}>
              Enter Bank Transaction Details
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={transactionData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                  placeholder="Enter name as per bank"
                  style={{
                    width: "100%", padding: "8px 12px", border: "2px solid #d4c5ad",
                    borderRadius: 8, fontSize: 14, fontFamily: "inherit"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                    Payment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={transactionData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    placeholder="0"
                    style={{
                      width: "100%", padding: "8px 12px", border: "2px solid #d4c5ad",
                      borderRadius: 8, fontSize: 14, fontFamily: "inherit"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                    Transaction Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={transactionData.timestamp}
                    onChange={(e) => handleInputChange("timestamp", e.target.value)}
                    style={{
                      width: "100%", padding: "8px 12px", border: "2px solid #d4c5ad",
                      borderRadius: 8, fontSize: 14, fontFamily: "inherit"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                    Transaction Reference Number *
                  </label>
                  <input
                    type="text"
                    value={transactionData.referenceNumber}
                    onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
                    placeholder="REF123456"
                    style={{
                      width: "100%", padding: "8px 12px", border: "2px solid #d4c5ad",
                      borderRadius: 8, fontSize: 14, fontFamily: "inherit"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                    UTR Number
                  </label>
                  <input
                    type="text"
                    value={transactionData.utrNumber}
                    onChange={(e) => handleInputChange("utrNumber", e.target.value)}
                    placeholder="Optional"
                    style={{
                      width: "100%", padding: "8px 12px", border: "2px solid #d4c5ad",
                      borderRadius: 8, fontSize: 14, fontFamily: "inherit"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  value={transactionData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder="e.g., State Bank of India"
                  style={{
                    width: "100%", padding: "8px 12px", border: "2px solid #d4c5ad",
                    borderRadius: 8, fontSize: 14, fontFamily: "inherit"
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={!transactionData.accountHolderName || !transactionData.amount || !transactionData.timestamp || !transactionData.referenceNumber}
              style={{
                marginTop: 16, width: "100%", padding: "10px",
                background: "linear-gradient(135deg, #0277bd, #4db6ac)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                opacity: (!transactionData.accountHolderName || !transactionData.amount || !transactionData.timestamp || !transactionData.referenceNumber) ? 0.5 : 1
              }}
            >
              🔍 Verify Transaction
            </button>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div style={{
              background: verificationResult.isValid ? "rgba(46,125,50,0.1)" : "rgba(198,40,40,0.1)",
              border: `2px solid ${verificationResult.isValid ? "#2e7d32" : "#c62828"}`,
              borderRadius: 12, padding: 16, marginBottom: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{verificationResult.isValid ? "✅" : "❌"}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#2d1b10" }}>
                    Verification {verificationResult.isValid ? "Passed" : "Failed"}
                  </div>
                  <div style={{ fontSize: 12, color: "#5d4e37" }}>
                    Confidence: {verificationResult.confidence}%
                  </div>
                </div>
              </div>

              {verificationResult.matchedFields.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                    ✓ Matched Fields:
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {verificationResult.matchedFields.map(field => (
                      <span key={field} style={{
                        padding: "2px 8px", background: "rgba(46,125,50,0.15)",
                        color: "#2e7d32", fontSize: 11, borderRadius: 12,
                        border: "1px solid #2e7d32"
                      }}>
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {verificationResult.issues.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                    ⚠ Issues Found:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#c62828" }}>
                    {verificationResult.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {verificationResult.isValid && !paymentResult && (
                <button
                  onClick={handleProcessPayment}
                  disabled={processing}
                  style={{
                    marginTop: 12, width: "100%", padding: "10px",
                    background: processing ? "#999" : "linear-gradient(135deg, #2e7d32, #66bb6a)",
                    color: "#fff", border: "none", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: processing ? "not-allowed" : "pointer"
                  }}
                >
                  {processing ? "Processing..." : "💳 Process Payment"}
                </button>
              )}
            </div>
          )}

          {/* Payment Result */}
          {paymentResult && (
            <div style={{
              background: paymentResult.success ? "rgba(46,125,50,0.1)" : "rgba(198,40,40,0.1)",
              border: `2px solid ${paymentResult.success ? "#2e7d32" : "#c62828"}`,
              borderRadius: 12, padding: 16, marginBottom: 20
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#2d1b10", marginBottom: 8 }}>
                {paymentResult.success ? "✅ Payment Processed Successfully!" : "❌ Payment Failed"}
              </div>
              <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 12 }}>
                {paymentResult.message}
              </div>
              
              {paymentResult.success && (
                <div style={{ fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#5d4e37" }}>Previous Balance:</span>
                    <span style={{ fontWeight: 600 }}>{fmt(paymentResult.previousBalance)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#5d4e37" }}>Payment Amount:</span>
                    <span style={{ fontWeight: 600, color: "#c62828" }}>- {fmt(transactionData.amount)}</span>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    paddingTop: 8, borderTop: "1px solid #d4c5ad"
                  }}>
                    <span style={{ color: "#5d4e37", fontWeight: 600 }}>New Balance:</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#2e7d32" }}>
                      {fmt(paymentResult.newBalance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, color: "#2d1b10", marginBottom: 12 }}>
                Payment History
              </h3>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {paymentHistory.map((payment, idx) => (
                  <div key={idx} style={{
                    padding: 12, border: "2px solid #d4c5ad", borderRadius: 8,
                    marginBottom: 8, fontSize: 12
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{fmt(payment.amount)}</span>
                      <span style={{ color: "#5d4e37" }}>
                        {new Date(payment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ color: "#5d4e37" }}>
                      Ref: {payment.referenceNumber}
                    </div>
                    <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
                      Confidence: {payment.verification.confidence}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LAYOUT SHELL
// ─────────────────────────────────────────────
const ALL_NAV_ITEMS = [
  { key: "dashboard",     label: "Dashboard",            icon: "📊", roles: ["leader","member"] },
  { key: "members",       label: "Members",              icon: "👥", roles: ["leader"] },
  { key: "savings",       label: "Savings & Attendance", icon: "💰", roles: ["leader","member"] },
  { key: "loans",         label: "Loans",                icon: "📋", roles: ["leader","member"] },
  { key: "meetings",      label: "Meetings",             icon: "📅", roles: ["leader","member"] },
  { key: "notifications", label: "Notifications",        icon: "🔔", roles: ["leader","member"] },
  { key: "reports",       label: "Reports",              icon: "📈", roles: ["leader"] },
  { key: "insights",      label: "Insights",             icon: "🧠", roles: ["leader"] },
];

function Sidebar({ selectedSHG, role, memberName, page, setPage, onSwitchSHG, onLogout }) {
  const navItems = ALL_NAV_ITEMS.filter((it) => it.roles.includes(role));
  const displayName = role === "member" && memberName ? memberName : selectedSHG || "—";
  const displaySub  = role === "member" ? "Member · " + (selectedSHG || "") : "SHG Leader";
  const avatarChar  = role === "member" && memberName ? memberName[0] : selectedSHG ? selectedSHG[0] : "S";

  return (
    <div style={{
      width: 240, background: "linear-gradient(180deg,#2d1b10,#3e2a1a)", color: "#d4c5ad",
      padding: 24, display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* logo */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 0.5, color: "#ffa726" }}>SHG</div>
        <div style={{ fontSize: 11, marginTop: -2, color: "#d4c5ad", opacity: 0.7 }}>Self Help Groups</div>
      </div>

      {/* profile card */}
      <div style={{
        background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, marginBottom: 24,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#d84315,#ffa726)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 18,
          }}>
            {avatarChar}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 600, fontSize: 13, color: "#fff",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{displayName}</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 1 }}>{displaySub}</div>
          </div>
        </div>
        <button
          onClick={onSwitchSHG}
          style={{
            width: "100%", padding: "6px 10px", fontSize: 11, borderRadius: 6,
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
          }}
        >
          Switch SHG
        </button>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        {navItems.map((item) => {
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                background: active ? "rgba(255,255,255,0.15)" : "transparent",
                border: "none", borderRadius: 8, color: "#fff", textAlign: "left",
                cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                transition: "all .2s",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* logout */}
      <button
        onClick={onLogout}
        style={{
          padding: "10px 12px", fontSize: 13, borderRadius: 8,
          background: "rgba(198,40,40,0.2)", border: "1px solid rgba(198,40,40,0.4)",
          color: "#ff6b6b", cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────
function DashboardPage({ selectedSHG, role, memberName, setPage }) {
  const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);
  const healthScore = useMemo(() => calculateHealthScore(selectedSHG), [selectedSHG]);
  const { status, cls } = getHealthStatus(healthScore);

  // If member role, show member-specific data
  const currentMember = useMemo(() => {
    if (role === "member" && memberName) {
      return getMembersBySHG(selectedSHG).find(m => m.Name === memberName);
    }
    return null;
  }, [role, memberName, selectedSHG]);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#2d1b10", marginBottom: 8 }}>
        {role === "member" ? "My Dashboard" : "Dashboard"}
      </h1>
      <p style={{ margin: 0, color: "#5d4e37", fontSize: 14, marginBottom: 24 }}>
        {role === "member" 
          ? `Welcome back, ${memberName}!` 
          : `Overview for ${selectedSHG}`
        }
      </p>

      {/* Member-specific view */}
      {role === "member" && currentMember && (
        <div style={{ marginBottom: 32 }}>
          <div style={{
            background: "linear-gradient(135deg,rgba(216,67,21,0.1),rgba(255,167,38,0.1))",
            borderRadius: 16, padding: 24, border: "2px solid #d4c5ad"
          }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, color: "#2d1b10" }}>
              My Information
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>Role</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#2d1b10" }}>{currentMember.Role}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>Savings</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#00897b" }}>{fmt(currentMember.Savings)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>Attendance</div>
                <div>{attendanceBadge(currentMember.Attendance)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>Loan Status</div>
                <div>{loanBadge(currentMember.LoanStatus)}</div>
              </div>
              {currentMember.LoanStatus === "Active" && (
                <div>
                  <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>Loan Amount</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#d84315" }}>
                    {fmt(currentMember.LoanAmount)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 20, border: "2px solid #d4c5ad",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 8 }}>Total Members</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#2d1b10" }}>{stats.totalMembers}</div>
        </div>

        <div style={{
          background: "#fff", borderRadius: 16, padding: 20, border: "2px solid #d4c5ad",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 8 }}>Total Savings</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#00897b" }}>{fmt(stats.totalSavings)}</div>
        </div>

        <div style={{
          background: "#fff", borderRadius: 16, padding: 20, border: "2px solid #d4c5ad",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 8 }}>Active Loans</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#d84315" }}>{stats.activeLoans}</div>
        </div>

        <div style={{
          background: "#fff", borderRadius: 16, padding: 20, border: "2px solid #d4c5ad",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 8 }}>Health Score</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#2d1b10" }}>{healthScore}</div>
            <Badge type={cls}>{status}</Badge>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{ fontSize: 20, color: "#2d1b10", marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <button
            onClick={() => setPage("savings")}
            style={{
              padding: "14px 18px", background: "linear-gradient(135deg,#00897b,#4db6ac)",
              border: "none", borderRadius: 12, color: "#fff", cursor: "pointer",
              fontSize: 14, fontWeight: 600, fontFamily: "inherit", textAlign: "left",
            }}
          >
            💰 View Savings
          </button>
          <button
            onClick={() => setPage("loans")}
            style={{
              padding: "14px 18px", background: "linear-gradient(135deg,#d84315,#ff7043)",
              border: "none", borderRadius: 12, color: "#fff", cursor: "pointer",
              fontSize: 14, fontWeight: 600, fontFamily: "inherit", textAlign: "left",
            }}
          >
            📋 Manage Loans
          </button>
          {role === "leader" && (
            <button
              onClick={() => setPage("members")}
              style={{
                padding: "14px 18px", background: "linear-gradient(135deg,#0277bd,#4db6ac)",
                border: "none", borderRadius: 12, color: "#fff", cursor: "pointer",
                fontSize: 14, fontWeight: 600, fontFamily: "inherit", textAlign: "left",
              }}
            >
              👥 View Members
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MEMBERS PAGE (leader only)
// ─────────────────────────────────────────────
function MembersPage({ selectedSHG }) {
  const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#2d1b10", marginBottom: 8 }}>Members</h1>
      <p style={{ margin: 0, color: "#5d4e37", fontSize: 14, marginBottom: 24 }}>
        All members in {selectedSHG}
      </p>

      <div style={{
        background: "#fff", borderRadius: 16, padding: 20, border: "2px solid #d4c5ad",
        overflowX: "auto",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #d4c5ad" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5d4e37" }}>
                Name
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5d4e37" }}>
                Age
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5d4e37" }}>
                Role
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5d4e37" }}>
                Attendance
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5d4e37" }}>
                Savings
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5d4e37" }}>
                Loan Status
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#5d4e37" }}>
                EMI Status
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.MemberID} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#2d1b10", fontWeight: 500 }}>
                  {m.Name}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#5d4e37" }}>{m.Age}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#5d4e37" }}>{m.Role}</td>
                <td style={{ padding: "12px 16px" }}>{attendanceBadge(m.Attendance)}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#00897b" }}>
                  {fmt(m.Savings)}
                </td>
                <td style={{ padding: "12px 16px" }}>{loanBadge(m.LoanStatus)}</td>
                <td style={{ padding: "12px 16px" }}>{emiBadge(m.EMIStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SAVINGS PAGE
// ─────────────────────────────────────────────
function SavingsPage({ selectedSHG, role, memberName }) {
  const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG]);
  const currentMember = useMemo(() => {
    if (role === "member" && memberName) {
      return members.find(m => m.Name === memberName);
    }
    return null;
  }, [role, memberName, members]);

  const displayMembers = role === "member" && currentMember ? [currentMember] : members;

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#2d1b10", marginBottom: 8 }}>
        Savings & Attendance
      </h1>
      <p style={{ margin: 0, color: "#5d4e37", fontSize: 14, marginBottom: 24 }}>
        {role === "member" ? "Your savings and attendance record" : `Tracking for ${selectedSHG}`}
      </p>

      <div style={{
        background: "#fff", borderRadius: 16, padding: 20, border: "2px solid #d4c5ad",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {displayMembers.map((m) => (
            <div
              key={m.MemberID}
              style={{
                padding: 16, borderRadius: 12, border: "2px solid #d4c5ad",
                background: "linear-gradient(135deg,rgba(0,137,123,0.05),rgba(77,182,172,0.05))",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#2d1b10" }}>{m.Name}</div>
                  <div style={{ fontSize: 12, color: "#5d4e37", marginTop: 2 }}>{m.Role}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#00897b" }}>{fmt(m.Savings)}</div>
                  <div style={{ fontSize: 11, color: "#5d4e37", marginTop: 2 }}>Total Savings</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 13, color: "#5d4e37" }}>Attendance: {m.Attendance}%</div>
                <div style={{ flex: 1 }}><ProgressBar value={m.Attendance} maxW={200} /></div>
                {attendanceBadge(m.Attendance)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOANS PAGE (with Bank Verification)
// ─────────────────────────────────────────────
function LoansPage({ selectedSHG, role, memberName }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const members = useMemo(() => getMembersBySHG(selectedSHG), [selectedSHG, refreshKey]);
  
  const currentMember = useMemo(() => {
    if (role === "member" && memberName) {
      return members.find(m => m.Name === memberName);
    }
    return null;
  }, [role, memberName, members, refreshKey]);

  const displayMembers = role === "member" && currentMember ? [currentMember] : members;
  const loanMembers = displayMembers.filter(m => m.LoanStatus === "Active");

  const handleVerifyPayment = (member) => {
    setSelectedMember(member);
    setShowVerificationModal(true);
  };

  const handlePaymentProcessed = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#2d1b10", marginBottom: 8 }}>
        Loan Management
      </h1>
      <p style={{ margin: 0, color: "#5d4e37", fontSize: 14, marginBottom: 24 }}>
        {role === "member" ? "Your active loans" : `Active loans in ${selectedSHG}`}
      </p>

      {loanMembers.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 16, padding: 40,
          border: "2px solid #d4c5ad", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, color: "#5d4e37" }}>No active loans</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {loanMembers.map((m) => {
            const loanData = loanDataStore[m.MemberID];
            const paymentHistory = getPaymentHistory(m.MemberID);
            
            return (
              <div
                key={m.MemberID}
                style={{
                  background: "#fff", borderRadius: 16, padding: 20,
                  border: "2px solid #d4c5ad",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "#2d1b10" }}>{m.Name}</div>
                    <div style={{ fontSize: 13, color: "#5d4e37", marginTop: 2 }}>
                      {m.Role} · Member ID: {m.MemberID}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {emiBadge(m.EMIStatus)}
                  </div>
                </div>

                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 16, padding: 16, background: "rgba(216,67,21,0.05)",
                  borderRadius: 12, marginBottom: 16
                }}>
                  {loanData && (
                    <>
                      <div>
                        <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                          Original Loan
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#d84315" }}>
                          {fmt(loanData.originalAmount)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                          Amount Paid
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#00897b" }}>
                          {fmt(loanData.originalAmount - loanData.remainingAmount)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                          Remaining Balance
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#2d1b10" }}>
                          {fmt(loanData.remainingAmount)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                          Payments Made
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#0277bd" }}>
                          {paymentHistory.length}
                        </div>
                      </div>
                    </>
                  )}
                  {!loanData && (
                    <div>
                      <div style={{ fontSize: 12, color: "#5d4e37", marginBottom: 4 }}>
                        Loan Amount
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#d84315" }}>
                        {fmt(m.LoanAmount)}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => handleVerifyPayment(m)}
                    style={{
                      flex: 1, padding: "10px 16px",
                      background: "linear-gradient(135deg, #0277bd, #4db6ac)",
                      color: "#fff", border: "none", borderRadius: 8,
                      fontSize: 14, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                  >
                    🏦 Verify Bank Payment
                  </button>
                  
                  {paymentHistory.length > 0 && (
                    <button
                      style={{
                        padding: "10px 16px",
                        background: "rgba(0,137,123,0.1)",
                        color: "#00897b", border: "2px solid #00897b",
                        borderRadius: 8, fontSize: 14, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit"
                      }}
                      onClick={() => {
                        // Could expand to show detailed history
                        alert(`${paymentHistory.length} payment(s) on record`);
                      }}
                    >
                      📜 View History ({paymentHistory.length})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showVerificationModal && selectedMember && (
        <BankVerificationModal
          member={selectedMember}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedMember(null);
          }}
          onPaymentProcessed={handlePaymentProcessed}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MEETINGS PAGE
// ─────────────────────────────────────────────
function MeetingsPage() {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#2d1b10", marginBottom: 8 }}>Meetings</h1>
      <p style={{ margin: 0, color: "#5d4e37", fontSize: 14, marginBottom: 24 }}>
        Upcoming and past meetings
      </p>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 40, border: "2px solid #d4c5ad",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
        <div style={{ fontSize: 16, color: "#5d4e37" }}>No meetings scheduled</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NOTIFICATIONS PAGE
// ─────────────────────────────────────────────
function NotificationsPage({ selectedSHG, role, memberName }) {
  const notifications = [
    { id: 1, type: "success", title: "Payment Received", message: "EMI payment received successfully", time: "2 hours ago" },
    { id: 2, type: "warning", title: "Meeting Reminder", message: "Monthly meeting scheduled for tomorrow", time: "1 day ago" },
    { id: 3, type: "info", title: "New Member", message: "Welcome to our SHG!", time: "3 days ago" },
  ];

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#2d1b10", marginBottom: 8 }}>Notifications</h1>
      <p style={{ margin: 0, color: "#5d4e37", fontSize: 14, marginBottom: 24 }}>
        Stay updated with latest activities
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              background: "#fff", borderRadius: 12, padding: 16,
              border: "2px solid #d4c5ad", display: "flex", gap: 12,
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: notif.type === "success" ? "#2e7d32" : notif.type === "warning" ? "#f57c00" : "#0277bd",
              marginTop: 6, flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2d1b10", marginBottom: 4 }}>
                {notif.title}
              </div>
              <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 4 }}>
                {notif.message}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>{notif.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REPORTS PAGE (leader only)
// ─────────────────────────────────────────────
function ReportsPage({ selectedSHG }) {
  const stats = useMemo(() => getSHGStats(selectedSHG), [selectedSHG]);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#2d1b10", marginBottom: 8 }}>Reports</h1>
      <p style={{ margin: 0, color: "#5d4e37", fontSize: 14, marginBottom: 24 }}>
        Financial and operational reports for {selectedSHG}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 20, border: "2px solid #d4c5ad",
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#2d1b10" }}>Loan Summary</h3>
          <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 8 }}>
            Active Loans: {stats.activeLoans}
          </div>
          <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 8 }}>
            Total Loan Amount: {fmt(stats.totalLoanAmount)}
          </div>
          <div style={{ fontSize: 13, color: "#5d4e37" }}>
            On-time EMI: {stats.onTimeEMI} · Delayed: {stats.delayedEMI}
          </div>
        </div>

        <div style={{
          background: "#fff", borderRadius: 16, padding: 20, border: "2px solid #d4c5ad",
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#2d1b10" }}>Savings Summary</h3>
          <div style={{ fontSize: 13, color: "#5d4e37", marginBottom: 8 }}>
            Total Savings: {fmt(stats.totalSavings)}
          </div>
          <div style={{ fontSize: 13, color: "#5d4e37" }}>
            Average per Member: {fmt(Math.round(stats.totalSavings / stats.totalMembers))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INSIGHTS PAGE (leader only)
// ─────────────────────────────────────────────
function InsightsPage({ selectedSHG }) {
  const healthScore = useMemo(() => calculateHealthScore(selectedSHG), [selectedSHG]);
  const { status, cls } = getHealthStatus(healthScore);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#2d1b10", marginBottom: 8 }}>Insights</h1>
      <p style={{ margin: 0, color: "#5d4e37", fontSize: 14, marginBottom: 24 }}>
        Data-driven insights for {selectedSHG}
      </p>

      <div style={{
        background: "#fff", borderRadius: 16, padding: 24, border: "2px solid #d4c5ad",
        marginBottom: 20,
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#2d1b10" }}>
          Overall Health Score
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#2d1b10" }}>
            {healthScore}
          </div>
          <Badge type={cls}>{status}</Badge>
        </div>
        <div style={{ fontSize: 14, color: "#5d4e37" }}>
          Based on attendance rates and EMI payment performance
        </div>
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, padding: 24, border: "2px solid #d4c5ad",
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 18, color: "#2d1b10" }}>
          Recommendations
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#5d4e37" }}>
          <li style={{ marginBottom: 8 }}>Continue monitoring EMI payments closely</li>
          <li style={{ marginBottom: 8 }}>Encourage regular savings contributions</li>
          <li>Maintain high attendance in meetings</li>
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────
function LandingPage({ onGetStarted }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(135deg,#2d1b10,#3e2a1a,#d84315)",
      padding: 24, fontFamily: "'Poppins', sans-serif",
    }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", maxWidth: 600, margin: "0 auto", textAlign: "center",
      }}>
        <div style={{
          fontSize: 72, fontWeight: 800, background: "linear-gradient(135deg,#ffa726,#ff7043)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 20,
        }}>
          SHG
        </div>
        <h1 style={{ fontSize: 32, color: "#fff", marginBottom: 16, fontWeight: 700 }}>
          Empowering Women Through Self-Help Groups
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 40, lineHeight: 1.6 }}>
          Manage your SHG with ease. Track savings, loans, attendance, and grow together as a community.
        </p>
        <button
          onClick={onGetStarted}
          style={{
            padding: "16px 48px", fontSize: 18, fontWeight: 600,
            background: "linear-gradient(135deg,#ffa726,#ff7043)",
            color: "#fff", border: "none", borderRadius: 50,
            cursor: "pointer", boxShadow: "0 8px 24px rgba(255,167,38,0.4)",
            fontFamily: "inherit", transition: "transform .2s",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
function LoginPage({ onLogin, onBack }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#2d1b10,#3e2a1a,#d84315)",
      padding: 24, fontFamily: "'Poppins', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: 48, maxWidth: 420, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, color: "#2d1b10", textAlign: "center" }}>
          Welcome Back
        </h1>
        <p style={{ margin: "0 0 32px", color: "#5d4e37", fontSize: 14, textAlign: "center" }}>
          Choose your role to continue
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            onClick={() => onLogin("leader")}
            style={{
              padding: "16px 24px", fontSize: 16, fontWeight: 600,
              background: "linear-gradient(135deg,#d84315,#ff7043)",
              color: "#fff", border: "none", borderRadius: 12,
              cursor: "pointer", boxShadow: "0 4px 12px rgba(216,67,21,0.3)",
              fontFamily: "inherit", textAlign: "left", display: "flex",
              alignItems: "center", gap: 12,
            }}
          >
            <span style={{ fontSize: 24 }}>👔</span>
            <div>
              <div>SHG Leader</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Access all management features</div>
            </div>
          </button>

          <button
            onClick={() => onLogin("member")}
            style={{
              padding: "16px 24px", fontSize: 16, fontWeight: 600,
              background: "linear-gradient(135deg,#00897b,#4db6ac)",
              color: "#fff", border: "none", borderRadius: 12,
              cursor: "pointer", boxShadow: "0 4px 12px rgba(0,137,123,0.3)",
              fontFamily: "inherit", textAlign: "left", display: "flex",
              alignItems: "center", gap: 12,
            }}
          >
            <span style={{ fontSize: 24 }}>👤</span>
            <div>
              <div>SHG Member</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>View your personal information</div>
            </div>
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none", color: "#5d4e37",
              fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHG SELECT PAGE
// ─────────────────────────────────────────────
function SHGSelectPage({ role, onSelect, onBack }) {
  const shgs = useMemo(() => getAllSHGs(), []);
  const [step, setStep] = useState(1);             // 1: pick SHG, 2: pick member (if role=member)
  const [chosenSHG, setChosenSHG] = useState(null);
  const [chosenMember, setChosenMember] = useState(null);

  const shgMembers = useMemo(() => {
    if (!chosenSHG) return [];
    return getMembersBySHG(chosenSHG);
  }, [chosenSHG]);

  const canContinue = useMemo(() => {
    if (step === 1) return chosenSHG !== null;
    if (step === 2) return chosenMember !== null;
    return false;
  }, [step, chosenSHG, chosenMember]);

  const handleContinue = useCallback(() => {
    if (step === 1 && role === "member") {
      setStep(2);
    } else {
      onSelect(chosenSHG, chosenMember);
    }
  }, [step, role, chosenSHG, chosenMember, onSelect]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#2d1b10,#3e2a1a,#d84315)",
      padding: 24, fontFamily: "'Poppins', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: 40, maxWidth: 500, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, color: "#2d1b10" }}>
          {step === 1 ? "Select Your SHG" : "Select Your Profile"}
        </h1>
        <p style={{ margin: "0 0 24px", color: "#5d4e37", fontSize: 14 }}>
          {step === 1
            ? "Choose the Self-Help Group you belong to"
            : "Choose your member profile"
          }
        </p>

        {step === 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: "#5d4e37", marginBottom: 8 }}>You are logging in as:</div>
            <div style={{
              padding: 12, background: "rgba(216,67,21,0.1)", borderRadius: 8,
              fontSize: 15, fontWeight: 600, color: "#d84315",
            }}>
              {role === "leader" ? "👔 SHG Leader" : "👤 SHG Member"}
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {shgs.map((name) => {
              const st = getSHGStats(name);
              const active = chosenSHG === name;
              return (
                <button
                  key={name}
                  onClick={() => setChosenSHG(name)}
                  style={{
                    padding: "16px 18px",
                    border: active ? "2px solid #d84315" : "2px solid #d4c5ad",
                    borderRadius: 12,
                    background: active ? "linear-gradient(135deg,rgba(216,67,21,.1),rgba(255,167,38,.1))" : "#fff",
                    boxShadow: active ? "0 4px 12px rgba(216,67,21,.2)" : "none",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#2d1b10" }}>{name}</div>
                  <div style={{ color: "#5d4e37", fontSize: 13, marginTop: 2 }}>
                    {st.totalMembers} members · {fmt(st.totalSavings)} savings
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
            {shgMembers.map((m) => {
              const active = chosenMember === m.Name;
              return (
                <button
                  key={m.MemberID}
                  onClick={() => setChosenMember(m.Name)}
                  style={{
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 14,
                    border: active ? "2px solid #d84315" : "2px solid #d4c5ad",
                    borderRadius: 12,
                    background: active ? "linear-gradient(135deg,rgba(216,67,21,.1),rgba(255,167,38,.1))" : "#fff",
                    boxShadow: active ? "0 4px 12px rgba(216,67,21,.2)" : "none",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#d84315,#ffa726)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 16,
                  }}>
                    {m.Name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#2d1b10" }}>{m.Name}</div>
                    <div style={{ fontSize: 12, color: "#5d4e37" }}>{m.Role} · Age {m.Age}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {canContinue && (
          <button
            onClick={handleContinue}
            style={{
              width: "100%", padding: "12px",
              background: "linear-gradient(135deg,#d84315,#ff7043)", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600,
              cursor: "pointer", boxShadow: "0 4px 12px rgba(216,67,21,.3)", fontFamily: "inherit",
            }}
          >
            {step === 1 && role === "member" ? "Continue →" : "Continue to Dashboard"}
          </button>
        )}
        

        <div style={{ textAlign: "center", marginTop: 18 }}>
          {step === 2 ? (
            <button onClick={() => { setStep(1); setChosenMember(null); }} style={{ background: "none", border: "none", color: "#5d4e37", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← Back to SHG selection
            </button>
          ) : (
            <button onClick={onBack} style={{ background: "none", border: "none", color: "#5d4e37", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [flow, setFlow]               = useState("landing");
  const [role, setRole]               = useState(null);
  const [selectedSHG, setSelectedSHG] = useState(null);
  const [memberName, setMemberName]   = useState(null);
  const [page, setPage]               = useState("dashboard");

  const handleLogin = useCallback((chosenRole) => {
    setRole(chosenRole);
    setFlow("select");
  }, []);

  const handleSelect = useCallback((shg, name) => {
    setSelectedSHG(shg);
    setMemberName(name);
    setFlow("app");
    setPage("dashboard");
  }, []);

  const handleSwitchSHG = useCallback(() => {
    setSelectedSHG(null);
    setMemberName(null);
    setFlow("select");
    setPage("dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    setSelectedSHG(null);
    setMemberName(null);
    setRole(null);
    setFlow("landing");
  }, []);

  if (flow === "landing") return <LandingPage onGetStarted={() => setFlow("login")} />;
  if (flow === "login")   return <LoginPage  onLogin={handleLogin}  onBack={() => setFlow("landing")} />;
  if (flow === "select")  return <SHGSelectPage role={role} onSelect={handleSelect} onBack={() => setFlow("login")} />;

  const LEADER_ONLY = new Set(["members", "reports", "insights"]);
  const safePage = (role === "member" && LEADER_ONLY.has(page)) ? "dashboard" : page;

  const pageContent = (() => {
    switch (safePage) {
      case "dashboard":     return <DashboardPage selectedSHG={selectedSHG} role={role} memberName={memberName} setPage={setPage} />;
      case "members":       return <MembersPage   selectedSHG={selectedSHG} />;
      case "savings":       return <SavingsPage   selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "loans":         return <LoansPage     selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "meetings":      return <MeetingsPage />;
      case "notifications": return <NotificationsPage selectedSHG={selectedSHG} role={role} memberName={memberName} />;
      case "reports":       return <ReportsPage   selectedSHG={selectedSHG} />;
      case "insights":      return <InsightsPage  selectedSHG={selectedSHG} />;
      default:              return <DashboardPage selectedSHG={selectedSHG} role={role} memberName={memberName} setPage={setPage} />;
    }
  })();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", background: "#fdfbf7" }}>
      <Sidebar
        selectedSHG={selectedSHG}
        role={role}
        memberName={memberName}
        page={safePage}
        setPage={setPage}
        onSwitchSHG={handleSwitchSHG}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, padding: 28, minWidth: 0, overflowX: "auto" }}>{pageContent}</main>
    </div>
  );
}

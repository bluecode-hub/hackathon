
fetch('http://localhost:3001/api/admin/sanction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leaderUsername: 'admin_shakti', amount: 50000 })
})
    .then(async res => {
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    })
    .catch(console.error);

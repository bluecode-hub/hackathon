import { useState } from "react";

export const SHGChatbot = ({ csvData }) => {
    const [input, setInput] = useState("");
    const [chatLog, setChatLog] = useState([{ role: "bot", text: "Namaste! I'm your SHG data assistant. How can I help you today?" }]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const askGemini = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        setLoading(true);
        setChatLog(prev => [...prev, { role: "user", text: userMsg }]);

        const prompt = `You are an AI assistant for a Women's Self-Help Group (SHG) platform. 
    Use the following SHG data to answer questions: ${csvData}
    User question: ${userMsg}`;

        try {
            // 1. Ensure there is NO bracket after the key
            // 2. Use backticks (`) for the URL
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=AIzaSyAXgAtuw6gZolNl37jbOPgEVOoBf96e2uc`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const data = await response.json();

            if (data.error) {
                setChatLog(prev => [...prev, { role: "bot", text: `Error: ${data.error.message}` }]);
            } else {
                const botReply = data.candidates[0].content.parts[0].text;
                setChatLog(prev => [...prev, { role: "bot", text: botReply }]);
            }
        } catch (e) {
            setChatLog(prev => [...prev, { role: "bot", text: "Connection failed." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px', borderRadius: '50px', background: '#D84315', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontWeight: 'bold', zIndex: 1000 }}>
            💬 Ask Data Assistant
        </button>
    );

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '450px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000, border: '1px solid #eee' }}>
            <div style={{ background: '#D84315', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>SHG AI Assistant</span>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {chatLog.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#FFE0B2' : '#F5F5F5', color: '#333', padding: '10px', borderRadius: '12px', maxWidth: '85%', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '5px' }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && askGemini()} placeholder="Who has the highest savings?" style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }} />
                <button onClick={askGemini} disabled={loading} style={{ background: '#D84315', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>
                    {loading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F0EFED", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E5E5E3", padding: "48px 40px", width: 360 }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, background: "#C41230", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="34" viewBox="0 0 40 58" fill="none">
              <circle cx="20" cy="18" r="16" fill="white"/>
              <rect x="11" y="26" width="18" height="24" fill="white"/>
              <path d="M11 50 Q11 58 20 58 Q29 58 29 50Z" fill="white"/>
              <rect x="11" y="36" width="18" height="2.5" fill="#C41230"/>
              <rect x="11" y="43" width="18" height="2.5" fill="#C41230"/>
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>Compasso CRM</h1>
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 32 }}>Accedi per continuare</p>

        <form action="/api/crm/login" method="POST" id="loginForm">
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Utente</label>
          <input
            type="text"
            name="username"
            autoComplete="username"
            required
            style={{ width: "100%", border: "1.5px solid #E0E0DE", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 16, boxSizing: "border-box" }}
          />
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Password</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            style={{ width: "100%", border: "1.5px solid #E0E0DE", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 16, boxSizing: "border-box" }}
          />
          <button
            type="submit"
            style={{ width: "100%", background: "#111", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}

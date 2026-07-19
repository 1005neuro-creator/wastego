import React, { useState } from "react";
import { Recycle, Home, Truck } from "lucide-react";
import { signIn, signUp } from "../lib/auth";

const C = {
  ink: "#2E2C28",
  bg: "#F4F2EA",
  panel: "#FFFFFF",
  deep: "#1B3B2F",
  terra: "#E8633A",
  line: "#C9C2B0",
  faint: "#EDE9DC",
};

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp({ email, password, name, role, phone });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setNotice("가입 완료! 이메일 인증이 필요할 수 있어요. 로그인을 시도해보세요.");
      setMode("login");
      return;
    }

    const { data, error } = await signIn({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onAuthed(data.session);
  };

  return (
    <div style={{ padding: "40px 24px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 30 }}>
        <div style={{ width: 36, height: 36, background: C.deep, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Recycle size={20} color={C.bg} />
        </div>
        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 24, color: C.ink }}>분리고</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mode === "signup" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              {[
                { id: "customer", label: "이용자", icon: Home },
                { id: "driver", label: "기사", icon: Truck },
              ].map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: 8,
                      border: `1.5px solid ${active ? C.deep : C.line}`,
                      background: active ? C.deep : C.panel,
                      color: active ? "#fff" : C.ink,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Icon size={14} /> {r.label}로 가입
                  </button>
                );
              })}
            </div>
            <input style={inputStyle} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
            <input style={inputStyle} placeholder="전화번호 (선택)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </>
        )}
        <input style={inputStyle} type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={inputStyle} type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

        {error && <div style={{ color: C.terra, fontSize: 12.5 }}>{error}</div>}
        {notice && <div style={{ color: C.deep, fontSize: 12.5 }}>{notice}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 6,
            padding: "14px 0",
            borderRadius: 8,
            border: "none",
            background: loading ? C.line : C.terra,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "처리중..." : mode === "login" ? "로그인" : "가입하기"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
          setNotice("");
        }}
        style={{ marginTop: 16, background: "none", border: "none", color: "#80796A", fontSize: 13, cursor: "pointer" }}
      >
        {mode === "login" ? "계정이 없으신가요? 가입하기" : "이미 계정이 있으신가요? 로그인"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 8,
  border: `1px solid ${C.line}`,
  fontSize: 14,
  boxSizing: "border-box",
  background: C.panel,
  color: C.ink,
};

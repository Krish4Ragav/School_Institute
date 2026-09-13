import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, Eye, EyeOff, GraduationCap, Users, HeartHandshake, AlertCircle, LogIn, Mail, CalendarCheck, ClipboardCheck, MessageSquare, BarChart3 as BarChart3Icon } from "lucide-react";
import { useApp } from "../store/AppContext";

const demoMeta = [
  { role: "teacher", label: "Teacher", email: "teacher@school.com", pass: "teacher123", icon: <GraduationCap size={20} />, color: "#2563eb" },
  { role: "student", label: "Student", email: "student@school.com", pass: "student123", icon: <Users size={20} />, color: "#7c3aed" },
  { role: "parent", label: "Parent", email: "parent@school.com", pass: "parent123", icon: <HeartHandshake size={20} />, color: "#059669" },
];

export default function Login() {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    window.setTimeout(() => {
      const err = login(email, password, remember);
      if (err) {
        setError(err);
        setLoading(false);
      }
    }, 550);
  };

  const useDemo = (e2: string, p2: string) => {
    setEmail(e2);
    setPassword(p2);
    setError(null);
  };

  return (
    <div className="login-page">
      <div className="login-brand-side">
        <div className="login-brand-top">
          <div className="logo">
            <School size={28} />
          </div>
          <div>
            <div className="bt-name">School Institute</div>
            <div className="bt-sub">Electronic City · Bengaluru</div>
          </div>
        </div>
        <div className="login-hero">
          <h1>Connecting Students, Teachers &amp; Parents</h1>
          <p>
            One portal for attendance, assignments, exams, fees and everyday school
            communication — built for a modern private school.
          </p>
          <div className="login-hero-badges">
            <span className="hb"><CalendarCheck size={16} /> Live attendance</span>
            <span className="hb"><ClipboardCheck size={16} /> Assignments</span>
            <span className="hb"><BarChart3Icon size={16} /> Results &amp; reports</span>
            <span className="hb"><MessageSquare size={16} /> Messaging</span>
          </div>
        </div>
      </div>

      <div className="login-side">
        <div className="login-card">
          <div className="login-title">
            <h2>Welcome back 👋</h2>
            <p>Sign in to access the School Institute portal</p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="login-email">Email address</label>
              <div className="input-search">
                <Mail size={17} />
                <input
                  id="login-email"
                  className="input"
                  type="email"
                  autoComplete="username"
                  placeholder="you@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="login-with-password">
                <input
                  id="login-password"
                  className="input"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="eye-btn" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="login-extra">
              <label className="check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
            </div>
            <button className="btn btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? (
                <span className="loading-spin" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                <>
                  <LogIn size={18} /> Sign in
                </>
              )}
            </button>
          </form>

          <div className="demo-accounts">
            <div className="da-label">Use a demo account</div>
            <div className="da-grid">
              {demoMeta.map((d) => (
                <button
                  key={d.role}
                  className="demo-account"
                  type="button"
                  onClick={() => useDemo(d.email, d.pass)}
                >
                  <span style={{ color: d.color }}>{d.icon}</span>
                  <span className="da-role">{d.label}</span>
                  <span className="da-email">{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="login-foot-note">
            School Institute · Electronic City, Bengaluru · Classes I–X
          </div>
        </div>
      </div>
    </div>
  );
}
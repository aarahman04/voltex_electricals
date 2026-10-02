import { useState } from "react";
import { adminApi } from "../../lib/admin/api.js";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <main className="admin-login"><p className="spec">Voltex electricals / staff access</p><h1 className="nameplate">Your stock.<br />Ready for the site.</h1><p className="admin-muted">Sign in to add photos, update prices and look after the catalogue.</p>
    <form className="plate" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); try { await adminApi({ type: "login", username, password }); setPassword(""); onLogin(await adminApi()); } catch (err) { setError(err.message); } finally { setBusy(false); } }}><div className="admin-fields">
      <label>Username<input autoComplete="username" required value={username} disabled={busy} onChange={(e) => setUsername(e.target.value)} /></label>
      <label>Password<div className="admin-password"><input type={show ? "text" : "password"} autoComplete="current-password" required value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} /><button type="button" className="admin-button" aria-pressed={show} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></div></label>
      {error && <p role="alert" className="admin-banner admin-error">{error}</p>}<button className="switch-btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </div></form><p className="admin-muted">For warehouse staff · Changes go live in about 2 minutes</p>
  </main>;
}

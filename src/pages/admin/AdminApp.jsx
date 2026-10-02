import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "../../lib/admin/api.js";
import Login from "./Login.jsx";
import AddProducts from "./AddProducts.jsx";
import ManageProducts from "./ManageProducts.jsx";
import RemoveProducts from "./RemoveProducts.jsx";
import "../../admin.css";

export default function AdminApp() {
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [params, setParams] = useSearchParams();
  const tab = ["add", "remove", "manage"].includes(params.get("tab")) ? params.get("tab") : "add";
  async function load() {
    setError("");
    try { setState(await adminApi()); } catch (err) { setError(err.message); }
  }
  useEffect(() => { adminApi().then(setState).catch((err) => setError(err.message)); }, []);
  async function save(action) {
    const result = await adminApi(action);
    setState(result);
    return result;
  }
  return <div className="admin-shell"><meta name="robots" content="noindex" /><title>Admin — Voltex Electricals</title>
    <header className="admin-topbar"><a href="/" className="admin-wordmark nameplate">VOLTEX<span className="spec">Admin</span></a>{state?.authenticated && <><nav aria-label="Admin sections">{["add", "remove", "manage"].map((t) => <button key={t} disabled={busy} aria-current={t === tab ? "page" : undefined} onClick={() => { setError(""); setParams({ tab: t }); }}>{t[0].toUpperCase() + t.slice(1)}</button>)}</nav><button className="admin-button" disabled={busy} onClick={async () => { setBusy(true); setError(""); try { await adminApi({ type: "logout" }); setState({ authenticated: false }); } catch (err) { setError(err.message); } finally { setBusy(false); } }}>Sign out</button></>}</header>
    {error && <div className="admin-width"><p role="alert" className="admin-banner admin-error">{error}</p>{!state && <button className="admin-button" onClick={load}>Try again</button>}</div>}
    {!state ? <main className="admin-width"><p role="status">{error ? "Could not load admin." : "Checking sign in…"}</p></main> : !state.authenticated ? <Login onLogin={setState} /> : <main className="admin-width" id="admin-main">
      {tab === "add" && <AddProducts state={state} save={save} setShellBusy={setBusy} />}
      {tab === "manage" && <ManageProducts state={state} save={save} setShellBusy={setBusy} />}
      {tab === "remove" && <RemoveProducts state={state} save={save} setShellBusy={setBusy} />}
    </main>}
  </div>;
}

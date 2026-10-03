import VoltexWordmark from "./VoltexWordmark.jsx";

export default function Lockup({ className = "" }) {
  return <span className={`lockup ${className}`}><VoltexWordmark className="voltex-logo" /><span className="lockup-subtitle">electricals</span></span>;
}

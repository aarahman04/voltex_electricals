import { Link } from "react-router-dom";
import { useEnquiry } from "../context/enquiry.js";
import { enquiryUrl } from "../lib/enquiryMessage.js";

export default function Contact() {
  const { items } = useEnquiry();
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    window.location.assign(enquiryUrl(data, items));
  };

  return <div className="contact-page site-width">
    <header className="contact-heading"><p className="eyebrow"><span className="status-light" /> Every great space starts somewhere</p><h1 className="nameplate">Let’s get<br /><span>connected.</span></h1></header>
    <div className="contact-layout">
      <aside className="contact-info">
        <p className="contact-intro">One room or a whole building.<br />We’d love to hear what you have in mind.</p>
        <a className="contact-direct" href="tel:+916309933720"><span className="spec">Give us a call</span><strong>+91 63099 33720</strong><span aria-hidden="true">↗</span></a>
        <a className="contact-direct" href="https://wa.me/916309933720" target="_blank" rel="noreferrer"><span className="spec">Prefer a conversation?</span><strong>Find us on WhatsApp</strong><span aria-hidden="true">↗</span></a>
        <div className="connection-art" aria-hidden="true"><img className="contact-electrical-image" src="/images/electrical-studio-640.webp" alt="" width="640" height="640" loading="lazy" /><svg viewBox="0 0 420 180" fill="none"><path d="M-10 40h110q30 0 30 30v40q0 30 30 30h60q30 0 30-30V70q0-30 30-30h140" stroke="#54634d" strokeWidth="1"/><path className="connection-current" pathLength="1" d="M-10 40h110q30 0 30 30v40q0 30 30 30h60q30 0 30-30V70q0-30 30-30h140" stroke="#e7a278" strokeWidth="2"/></svg><span className="spec">Good things begin with a connection.</span></div>
        <p className="contact-help">Still exploring? <Link to="/products">Find your essentials ↗</Link></p>
      </aside>
      <div className="contact-form-panel"><div className="contact-form-heading"><span className="spec">Your next project</span><h2 className="nameplate">Tell us a little about it.</h2><p>We’ll help with product choices, pricing and availability.</p></div>
        {items.length > 0 && <div className="contact-shortlist"><span><strong>{items.length}</strong> products in your shortlist</span><Link to="/enquiry">Review list ↗</Link></div>}
        <form onSubmit={submit} className="contact-form">
          <div className="contact-field-row"><Field id="name" label="Your name"><input id="name" name="name" autoComplete="name" placeholder="Your full name" required /></Field><Field id="email" label="Email or phone"><input id="email" name="email" autoComplete="email" placeholder="How can we reach you?" required /></Field></div>
          <Field id="project" label="What are you planning?"><select id="project" name="project" defaultValue="Home"><option>Home</option><option>Office or commercial space</option><option>Industrial project</option><option>Something else</option></select></Field>
          <Field id="message" label="A few details"><textarea id="message" name="message" rows={4} required placeholder="Products, quantities, spaces — tell us what you need." /></Field>
          <div className="contact-submit"><button type="submit" className="action-button">Let’s talk on WhatsApp <span aria-hidden="true">↗</span></button><p>Your details become a WhatsApp draft.<br />You review it before sending.</p></div>
        </form>
      </div>
    </div>
    <div className="contact-bottom"><span className="spec">Browse. Shortlist. Enquire.</span><p>A simpler way to bring your space to life.</p><Link to="/about" className="text-link">Get to know Voltex ↗</Link></div>
  </div>;
}

function Field({ id, label, children }) {
  return <div className="contact-field"><label htmlFor={id} className="spec">{label}</label>{children}</div>;
}

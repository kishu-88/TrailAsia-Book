import { useState } from 'react';
import { submitContactMessage } from '../api';

const emptyForm = { name: '', email: '', phone: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [sent, setSent] = useState(false);

  function update(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await submitContactMessage({ ...form, phone: form.phone || undefined });
      setForm(emptyForm);
      setSent(true);
    } catch (err) {
      setSubmitError(err.details ? Object.values(err.details)[0] : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <span className="eyebrow">Contact</span>
      <h1>Get in touch</h1>
      <p className="lede">
        General questions, partnership enquiries, or anything that isn't a specific trip — send
        it here and it reaches our trip-planning team directly. If you're after a quote for a
        trip, sending an enquiry from a destination page gets you to a consultant faster.
      </p>

      <p>
        Email: <a href="mailto:hello@trailasia.example">hello@trailasia.example</a>
        <br />
        Office: Sydney, Australia
      </p>

      {sent ? (
        <p className="notice">Thanks — your message has been sent. We'll be in touch soon.</p>
      ) : (
        <>
          {submitError && <p className="error">{submitError}</p>}
          <form onSubmit={handleSubmit}>
            <label>
              <span>Your name</span>
              <input required value={form.name} onChange={update('name')} />
            </label>
            <div className="row-2">
              <label>
                <span>Email</span>
                <input required type="email" value={form.email} onChange={update('email')} />
              </label>
              <label>
                <span>Phone (optional)</span>
                <input value={form.phone} onChange={update('phone')} />
              </label>
            </div>
            <label>
              <span>Message</span>
              <textarea required value={form.message} onChange={update('message')} />
            </label>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

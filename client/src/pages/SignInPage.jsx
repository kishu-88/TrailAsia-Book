import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTravellerAuth } from '../context/TravellerAuthContext';

export default function SignInPage() {
  const { login } = useTravellerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const destination = from ? `${from.pathname}${from.search || ''}` : '/trips';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Sign in</h1>
      <p className="lede">
        For travellers who already have a confirmed booking. Access is set up by your consultant
        after they've been in touch — there's no self-registration here. Planning a new trip?{' '}
        <Link to="/destinations">Send an enquiry instead</Link>.
      </p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span>Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

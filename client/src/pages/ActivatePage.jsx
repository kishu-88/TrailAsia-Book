import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTravellerAuth } from '../context/TravellerAuthContext';

export default function ActivatePage() {
  const { activate } = useTravellerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await activate(token, password);
      navigate('/trips');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <p className="error">
        This link is missing its code. Use the exact link your consultant sent you.
      </p>
    );
  }

  return (
    <div>
      <h1>Set up your account</h1>
      <p className="lede">Choose a password to finish setting up portal access to your trip.</p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          <span>Password (at least 12 characters)</span>
          <input
            required
            type="password"
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Setting up…' : 'Activate account'}
        </button>
      </form>
    </div>
  );
}

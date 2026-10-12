import { Navigate, useLocation } from 'react-router-dom';
import { useTravellerAuth } from '../context/TravellerAuthContext';

/** Gate on `booting` first — redirecting before the refresh call resolves would bounce a signed-in traveller on every reload. */
export default function RequireTraveller({ children }) {
  const { traveller, booting } = useTravellerAuth();
  const location = useLocation();

  if (booting) return <p>Loading…</p>;
  // Carry the page they were heading for, so signing in lands them on it.
  // Someone who tapped SOS with an expired session should end up on the SOS
  // page, not on a list of trips.
  if (!traveller) return <Navigate to="/sign-in" replace state={{ from: location }} />;
  return children;
}

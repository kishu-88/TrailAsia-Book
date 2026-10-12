import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myTrips } from '../api';

export default function MyTripsPage() {
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    myTrips()
      .then((data) => setTrips(data.trips || data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!trips) return <p>Loading…</p>;

  return (
    <div>
      <h1>My trips</h1>
      {trips.length === 0 && <p>No trips on your account yet.</p>}
      {trips.map((trip) => (
        <Link
          key={trip.id || trip.bookingId}
          to={`/trips/${trip.id || trip.bookingId}`}
          className="card"
          style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
        >
          <h3>{trip.title || trip.reference}</h3>
          <p className="meta">
            {trip.reference} {trip.status && <span className="status-pill">{trip.status}</span>}
          </p>
          {trip.departureDate && (
            <p className="meta">
              {trip.departureDate} → {trip.returnDate}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { myTrips } from '../api';
import TripSafety from '../components/TripSafety';

/**
 * The emergency page: one tap from anywhere on the site, via the SOS link in
 * the nav.
 *
 * An alert belongs to a trip, so the only thing this page has to decide is
 * which one. It picks the trip the traveller is most likely on right now and
 * lets them change it, rather than making them find the right trip first and
 * scroll to a button.
 */

// The traveller's own calendar date, not UTC: a trip that starts "today" in
// Kathmandu has started, whatever the date still is in Greenwich.
function today() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Trips an alert could sensibly be raised against, most likely first. */
function rankTrips(trips) {
  const now = today();
  const score = (trip) => {
    if (trip.status === 'in_progress') return 0;
    if (trip.departureDate && trip.returnDate && trip.departureDate <= now && now <= trip.returnDate) {
      return 1;
    }
    if (trip.departureDate && trip.departureDate > now) return 2; // upcoming
    return 3; // already back, or no dates yet
  };

  return trips
    .filter((trip) => trip.status !== 'cancelled')
    .map((trip) => ({ trip, rank: score(trip) }))
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      // Among upcoming trips the soonest first; among past ones the latest.
      const left = a.trip.departureDate || '';
      const right = b.trip.departureDate || '';
      return a.rank === 2 ? left.localeCompare(right) : right.localeCompare(left);
    })
    .map(({ trip }) => trip);
}

export default function SafetyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    myTrips()
      .then((data) => setTrips(rankTrips(data.trips || data)))
      .catch((err) => setError(err.message));
  }, []);

  const emergencyNote = (
    <p className="meta">
      If you are in immediate danger, call local emergency services first. They are closer than
      we are.
    </p>
  );

  if (error) {
    return (
      <div>
        <h1>Safety</h1>
        <p className="error">Could not load your trips: {error}</p>
        {emergencyNote}
      </div>
    );
  }

  if (!trips) return <p>Loading…</p>;

  if (trips.length === 0) {
    return (
      <div>
        <h1>Safety</h1>
        <p className="lede">
          SOS and location sharing belong to a trip, and there is no trip on your account yet.
        </p>
        {emergencyNote}
        <p>
          <Link to="/trips">Back to my trips</Link>
        </p>
      </div>
    );
  }

  const requested = searchParams.get('trip');
  const selected = trips.find((trip) => String(trip.id) === requested) || trips[0];

  return (
    <div className="safety-page">
      <span className="eyebrow">Safety</span>
      <h1>Need help?</h1>
      <p className="lede">
        One button tells the TrailAsia office you need help and where you are. Someone at a desk
        sees it straight away.
      </p>

      {trips.length > 1 ? (
        <label className="safety-page__trip">
          <span>This is about</span>
          <select
            value={String(selected.id)}
            onChange={(event) => setSearchParams({ trip: event.target.value }, { replace: true })}
          >
            {trips.map((trip) => (
              <option key={trip.id} value={String(trip.id)}>
                {trip.title || trip.reference}
                {trip.departureDate ? ` · ${trip.departureDate}` : ''}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="meta">
          For your trip: <Link to={`/trips/${selected.id}`}>{selected.title || selected.reference}</Link>
        </p>
      )}

      {/* Keyed on the trip, so switching trips cannot leave an armed button
          or a half-typed note pointing at the wrong booking. */}
      <TripSafety key={selected.id} bookingId={String(selected.id)} />
    </div>
  );
}

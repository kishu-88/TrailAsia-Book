import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDestinations } from '../api';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listDestinations().then(setDestinations).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <span className="eyebrow">Where we trek</span>
      <h1>Destinations</h1>
      <p className="lede">
        Across the Himalaya and Southeast Asia, each planned by a consultant around your dates,
        fitness level and party — not sold as a fixed departure.
      </p>
      {error && <p className="error">{error}</p>}
      {!destinations && !error && <p>Loading…</p>}
      <div className="grid">
        {destinations &&
          destinations.map((d) => (
            <Link key={d.id} to={`/destinations/${d.id}`} className="card dest-card">
              {d.heroImageUrl && (
                <div className="dest-card__image" style={{ backgroundImage: `url(${d.heroImageUrl})` }} />
              )}
              <h3>{d.name}</h3>
              <p className="meta">{d.region || d.countryCode}</p>
              {d.summary && <p className="dest-card__summary">{d.summary}</p>}
              <div className="dest-card__chips">
                {d.durationDays && <span className="chip">{d.durationDays} days</span>}
                {d.maxAltitudeMetres && <span className="chip">Up to {d.maxAltitudeMetres}m</span>}
                {d.priceFrom && (
                  <span className="chip chip--price">
                    From {d.priceFrom.currencyCode} {d.priceFrom.amount}
                  </span>
                )}
                {d.fitnessLevel && (
                  <span className={`chip chip--fitness-${d.fitnessLevel}`}>{d.fitnessLevel}</span>
                )}
              </div>
            </Link>
          ))}
        {destinations && destinations.length === 0 && <p>No destinations are published yet.</p>}
      </div>
    </div>
  );
}

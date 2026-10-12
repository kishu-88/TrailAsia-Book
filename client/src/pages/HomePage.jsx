import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDestinations, listTestimonials } from '../api';

export default function HomePage() {
  const [destinations, setDestinations] = useState(null);
  const [error, setError] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    listDestinations()
      .then((rows) => setDestinations(rows.slice(0, 6)))
      .catch((err) => setError(err.message));
    listTestimonials()
      .then((rows) => setTestimonials(rows.slice(0, 3)))
      .catch(() => setTestimonials([]));
  }, []);

  return (
    <div>
      <span className="eyebrow">Small-group trekking, Asia-wide</span>
      <h1>Where to next?</h1>
      <p className="lede">
        Browse where TrailAsia runs trips, and send an enquiry — a consultant will follow up with
        a real itinerary and a price. This isn't instant checkout: the agency plans every trip
        around the people going on it.
      </p>

      <div className="hub-grid">
        <Link to="/about/our-story" className="hub-card">
          <h3>Our story</h3>
          <p>Why TrailAsia started with the Himalaya, and how it grew from there.</p>
          <span className="hub-card__arrow">Read more →</span>
        </Link>
        <Link to="/about/why-us" className="hub-card">
          <h3>Why choose us</h3>
          <p>A real consultant plans your trip — no instant checkout, no fixed departures.</p>
          <span className="hub-card__arrow">Read more →</span>
        </Link>
        <Link to="/about/sustainability" className="hub-card">
          <h3>Responsible travel</h3>
          <p>Local guides, small groups, and fees that fund conservation, not just permits.</p>
          <span className="hub-card__arrow">Read more →</span>
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      <h2>A few places to start</h2>
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
              <div className="dest-card__chips">
                {d.durationDays && <span className="chip">{d.durationDays} days</span>}
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
      </div>
      <p>
        <Link to="/destinations">See every destination →</Link>
      </p>

      {testimonials.length > 0 && (
        <>
          <h2>What travellers say</h2>
          <div className="grid">
            {testimonials.map((t) => (
              <div className="card testimonial" key={t.id}>
                <p className="testimonial__quote">“{t.quote}”</p>
                <p className="meta">
                  — {t.authorName}
                  {t.destination ? ` · ${t.destination.name}` : ''}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

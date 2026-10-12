import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDestination, listDestinations, submitEnquiry } from '../api';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departureDate: '',
  returnDate: '',
  partySize: 1,
  message: '',
  additionalDestinationIds: [],
};

function draftKey(destinationId) {
  return `trailasia-book:enquiry-draft:${destinationId}`;
}

/** Best-effort — a private window or a cleared site data store should not break the form. */
function loadDraft(destinationId) {
  try {
    const raw = window.localStorage.getItem(draftKey(destinationId));
    return raw ? { ...emptyForm, ...JSON.parse(raw) } : emptyForm;
  } catch {
    return emptyForm;
  }
}

function saveDraft(destinationId, form) {
  try {
    window.localStorage.setItem(draftKey(destinationId), JSON.stringify(form));
  } catch {
    // Not fatal — the form still works, it just won't survive a reload.
  }
}

function clearDraft(destinationId) {
  try {
    window.localStorage.removeItem(draftKey(destinationId));
  } catch {
    // Nothing to do.
  }
}

export default function DestinationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [otherDestinations, setOtherDestinations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    setDestination(null);
    setDraftRestored(false);
    getDestination(id)
      .then((data) => setDestination(data.destination))
      .catch((err) => setLoadError(err.message));
    listDestinations()
      .then((rows) => setOtherDestinations(rows.filter((d) => String(d.id) !== String(id))))
      .catch(() => setOtherDestinations([]));

    const draft = loadDraft(id);
    setForm(draft);
    setDraftRestored(JSON.stringify(draft) !== JSON.stringify(emptyForm));
  }, [id]);

  // Autosave as the visitor types, so a closed tab or a spotty connection on
  // a trek-planning trip doesn't cost them the form.
  useEffect(() => {
    if (JSON.stringify(form) === JSON.stringify(emptyForm)) return;
    saveDraft(id, form);
  }, [id, form]);

  function update(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function toggleAdditional(destId) {
    return (event) => {
      setForm((prev) => {
        const set = new Set(prev.additionalDestinationIds);
        if (event.target.checked) set.add(destId);
        else set.delete(destId);
        return { ...prev, additionalDestinationIds: [...set] };
      });
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const enquiry = await submitEnquiry({
        ...form,
        partySize: Number(form.partySize) || 1,
        destinationId: id,
        departureDate: form.departureDate || undefined,
        returnDate: form.returnDate || undefined,
        phone: form.phone || undefined,
        message: form.message || undefined,
      });
      clearDraft(id);
      navigate('/enquiry-sent', { state: { enquiry, destinationName: destination?.name } });
    } catch (err) {
      setSubmitError(err.details ? Object.values(err.details)[0] : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const highlights = useMemo(() => destination?.highlights || [], [destination]);
  const whatToPack = useMemo(() => destination?.whatToPack || [], [destination]);
  const attractions = useMemo(() => destination?.attractions || [], [destination]);
  const thingsToKnow = useMemo(() => destination?.thingsToKnow || [], [destination]);

  if (loadError) return <p className="error">{loadError}</p>;
  if (!destination) return <p>Loading…</p>;

  const hasGuideContent =
    destination.bestTimeToVisit ||
    destination.fitnessLevel ||
    whatToPack.length > 0 ||
    destination.cultureNotes;

  return (
    <div>
      {destination.heroImageUrl && (
        <div className="hero" style={{ backgroundImage: `url(${destination.heroImageUrl})` }} />
      )}
      <h1>{destination.name}</h1>
      <p className="lede">
        {destination.region || destination.countryCode}
        {destination.maxAltitudeMetres ? ` · up to ${destination.maxAltitudeMetres}m` : ''}
        {destination.durationDays ? ` · ${destination.durationDays} days` : ''}
      </p>
      <p className="dest-card__chips" style={{ marginBottom: 16 }}>
        {destination.priceFrom && (
          <span className="chip chip--price">
            From {destination.priceFrom.currencyCode} {destination.priceFrom.amount} per person
          </span>
        )}
        {destination.fitnessLevel && (
          <span className={`chip chip--fitness-${destination.fitnessLevel}`}>
            {destination.fitnessLevel} fitness
          </span>
        )}
      </p>
      {destination.summary && <p>{destination.summary}</p>}
      {destination.advisoryNotes && <p>{destination.advisoryNotes}</p>}

      {highlights.length > 0 && (
        <>
          <h2>Highlights</h2>
          <ul>
            {highlights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      )}

      {attractions.length > 0 && (
        <>
          <h2>Popular attractions</h2>
          <p className="lede">Places worth seeing in {destination.name} beyond this trip's own route.</p>
          <div className="grid">
            {attractions.map((place) => (
              <div className="card" key={place.name}>
                <h3>{place.name}</h3>
                <p>{place.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {thingsToKnow.length > 0 && (
        <>
          <h2>Things to know</h2>
          <div className="guide-grid">
            {thingsToKnow.map((fact) => (
              <div className="guide-card" key={fact.label}>
                <h3>{fact.label}</h3>
                <p>{fact.value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {hasGuideContent && (
        <>
          <h2>Trip &amp; travel guide</h2>
          <div className="guide-grid">
            {destination.bestTimeToVisit && (
              <div className="guide-card">
                <h3>Best time to visit</h3>
                <p>{destination.bestTimeToVisit}</p>
              </div>
            )}
            {destination.fitnessLevel && (
              <div className="guide-card">
                <h3>Fitness level</h3>
                <p style={{ textTransform: 'capitalize' }}>{destination.fitnessLevel}</p>
              </div>
            )}
            {whatToPack.length > 0 && (
              <div className="guide-card">
                <h3>What to pack</h3>
                <ul>
                  {whatToPack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {destination.cultureNotes && (
              <div className="guide-card">
                <h3>Culture &amp; etiquette</h3>
                <p>{destination.cultureNotes}</p>
              </div>
            )}
          </div>
        </>
      )}

      {destination.testimonials && destination.testimonials.length > 0 && (
        <>
          <h2>What travellers say</h2>
          <div className="grid">
            {destination.testimonials.map((t) => (
              <div className="card testimonial" key={t.id}>
                <p className="testimonial__quote">“{t.quote}”</p>
                <p className="meta">
                  — {t.authorName}
                  {t.tripReference ? ` · ${t.tripReference}` : ''}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Send an enquiry</h2>
      <p className="lede">
        No account needed. A consultant will get in touch to plan the actual itinerary and price —
        dates below are a starting point, not a booking.
      </p>
      {draftRestored && <p className="notice">Picked up where you left off — your draft was restored.</p>}

      {submitError && <p className="error">{submitError}</p>}

      <form onSubmit={handleSubmit}>
        <div className="row-2">
          <label>
            <span>First name</span>
            <input required value={form.firstName} onChange={update('firstName')} />
          </label>
          <label>
            <span>Last name</span>
            <input required value={form.lastName} onChange={update('lastName')} />
          </label>
        </div>
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
        <div className="row-2">
          <label>
            <span>Rough departure date (optional)</span>
            <input type="date" value={form.departureDate} onChange={update('departureDate')} />
          </label>
          <label>
            <span>Rough return date (optional)</span>
            <input type="date" value={form.returnDate} onChange={update('returnDate')} />
          </label>
        </div>
        <label>
          <span>Party size</span>
          <input type="number" min="1" max="50" value={form.partySize} onChange={update('partySize')} />
        </label>

        {otherDestinations.length > 0 && (
          <label>
            <span>Also interested in (optional — up to 4)</span>
            <div className="checkbox-list">
              {otherDestinations.map((d) => (
                <label key={d.id} className="checkbox-list__item">
                  <input
                    type="checkbox"
                    checked={form.additionalDestinationIds.includes(String(d.id))}
                    disabled={
                      !form.additionalDestinationIds.includes(String(d.id)) &&
                      form.additionalDestinationIds.length >= 4
                    }
                    onChange={toggleAdditional(String(d.id))}
                  />
                  <span>{d.name}</span>
                </label>
              ))}
            </div>
          </label>
        )}

        <label>
          <span>Anything else the consultant should know? (optional)</span>
          <textarea value={form.message} onChange={update('message')} />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send enquiry'}
        </button>
      </form>
    </div>
  );
}

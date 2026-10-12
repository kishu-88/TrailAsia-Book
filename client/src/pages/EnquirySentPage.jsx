import { Link, useLocation, Navigate } from 'react-router-dom';

export default function EnquirySentPage() {
  const { state } = useLocation();

  if (!state?.enquiry) return <Navigate to="/" replace />;

  const { enquiry, destinationName } = state;

  return (
    <div>
      <h1>Thanks — that's in with the team</h1>
      <div className="notice">
        <p>
          <strong>Reference {enquiry.reference}</strong>
        </p>
        <p>
          A consultant will follow up by email about {destinationName || 'your trip'}
          {enquiry.partySize > 1 ? ` for your party of ${enquiry.partySize}` : ''}. Quote the
          reference above if you call or write in the meantime.
        </p>
        {(enquiry.departureDate || enquiry.returnDate) && (
          <p className="meta">
            Roughly {enquiry.departureDate || '?'} → {enquiry.returnDate || '?'} — the consultant will
            confirm real dates with you.
          </p>
        )}
      </div>
      <p>
        Already been in touch with the agency before and have portal access? <Link to="/sign-in">Sign in</Link> to see your existing trip.
      </p>
      <p>
        <Link to="/destinations">Browse more destinations →</Link>
      </p>
    </div>
  );
}

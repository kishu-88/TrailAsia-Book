import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { myTrip, myTripPayments, addMyDocument, downloadMyDocumentFile } from '../api';
import TripSafety from '../components/TripSafety';

const DOCUMENT_TYPES = [
  'passport',
  'visa',
  'insurance',
  'health_declaration',
  'permit',
  'vaccination',
  'other',
];

const emptyDocForm = {
  type: 'insurance',
  reference: '',
  issuer: '',
  issuedOn: '',
  expiresOn: '',
  filePath: '',
  notes: '',
};

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [traveller, setTraveller] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [error, setError] = useState(null);

  const [payments, setPayments] = useState(null);
  const [paymentsError, setPaymentsError] = useState(null);

  const [docForm, setDocForm] = useState(emptyDocForm);
  const [docFile, setDocFile] = useState(null);
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docError, setDocError] = useState(null);
  const [docNotice, setDocNotice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  function load() {
    setTrip(null);
    myTrip(id)
      .then((data) => {
        setTrip(data.trip);
        setTraveller(data.traveller);
        setChecklist(data.checklist);
      })
      .catch((err) => setError(err.message));

    myTripPayments(id)
      .then(setPayments)
      .catch((err) => setPaymentsError(err.message));
  }

  useEffect(load, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateDoc(field) {
    return (event) => setDocForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleAddDocument(event) {
    event.preventDefault();
    setDocError(null);
    setDocNotice(null);
    setDocSubmitting(true);
    try {
      await addMyDocument(
        {
          ...docForm,
          reference: docForm.reference || undefined,
          issuer: docForm.issuer || undefined,
          issuedOn: docForm.issuedOn || undefined,
          expiresOn: docForm.expiresOn || undefined,
          filePath: docForm.filePath || undefined,
          notes: docForm.notes || undefined,
        },
        docFile
      );
      setDocForm(emptyDocForm);
      setDocFile(null);
      setDocNotice('Added — your consultant will verify it.');
      load();
    } catch (err) {
      setDocError(err.details ? Object.values(err.details)[0] : err.message);
    } finally {
      setDocSubmitting(false);
    }
  }

  async function handleDownload(documentId) {
    setDownloadError(null);
    setDownloadingId(documentId);
    try {
      const { blob, filename } = await downloadMyDocumentFile(documentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloadingId(null);
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!trip) return <p>Loading…</p>;

  const segments = [...(trip.segments || [])].sort((a, b) => a.sequence - b.sequence);

  return (
    <div>
      <h1>{trip.title || trip.reference}</h1>
      <p className="meta">
        {trip.reference} {trip.status && <span className="status-pill">{trip.status}</span>}
      </p>
      {trip.departureDate && (
        <p>
          {trip.departureDate} → {trip.returnDate}
        </p>
      )}

      {(trip.consultant || trip.coordinator) && (
        <div className="card">
          <h3>Your contact at TrailAsia</h3>
          {trip.consultant && (
            <p>
              {trip.consultant.fullName} · <a href={`mailto:${trip.consultant.email}`}>{trip.consultant.email}</a>
            </p>
          )}
          {trip.coordinator && (
            <p className="meta">
              Trip coordinator: {trip.coordinator.fullName} ·{' '}
              <a href={`mailto:${trip.coordinator.email}`}>{trip.coordinator.email}</a>
            </p>
          )}
        </div>
      )}

      {trip.status !== 'cancelled' && (
        <>
          <h2 id="safety">Safety on this trip</h2>
          <TripSafety bookingId={String(id)} />
        </>
      )}

      {segments.length > 0 && (
        <>
          <h2>Itinerary</h2>
          {segments.map((leg) => (
            <div className="card" key={leg.id}>
              <h3>{leg.title}</h3>
              {leg.destination && <p className="meta">{leg.destination.name}</p>}
              {leg.startDate && (
                <p className="meta">
                  {leg.startDate} → {leg.endDate}
                </p>
              )}
              {leg.description && <p>{leg.description}</p>}
            </div>
          ))}
        </>
      )}

      <h2>Payments</h2>
      {paymentsError && <p className="error">{paymentsError}</p>}
      {!payments && !paymentsError && <p>Loading…</p>}
      {payments && payments.length === 0 && <p className="meta">No instalments have been scheduled yet.</p>}
      {payments && payments.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Instalment</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((row) => (
              <tr key={row.id}>
                <td>{row.label}</td>
                <td>{row.dueOn}</td>
                <td>
                  {row.currencyCode} {row.amount}
                </td>
                <td>
                  {row.currencyCode} {row.paid}
                </td>
                <td>
                  <span className={`status-pill ${row.overdue ? 'status-pill--warn' : ''}`}>
                    {row.settled ? 'paid' : row.overdue ? 'overdue' : 'awaiting'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Documents</h2>
      {checklist && (
        <p className="meta">
          {checklist.summary.satisfied} of {checklist.summary.mandatory} required documents ready.
        </p>
      )}
      {checklist && checklist.items.length > 0 && (
        <div className="grid">
          {checklist.items.map((item) => (
            <div className="card" key={`${item.destination.id}-${item.requirement.id}`}>
              <h3>{item.requirement.name}</h3>
              <p className="meta">{item.destination.name}</p>
              <span className={`status-pill ${item.satisfied ? '' : 'status-pill--warn'}`}>
                {item.satisfied ? 'ready' : item.status}
              </span>
              {item.issues.length > 0 && (
                <ul>
                  {item.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {downloadError && <p className="error">{downloadError}</p>}
      {traveller && traveller.documents && traveller.documents.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Expires</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {traveller.documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.type}</td>
                <td>{doc.reference || '—'}</td>
                <td>
                  <span className={`status-pill ${doc.effectiveStatus === 'verified' ? '' : 'status-pill--warn'}`}>
                    {doc.effectiveStatus}
                  </span>
                  {doc.status === 'rejected' && doc.notes && (
                    <p className="meta doc-note">{doc.notes}</p>
                  )}
                </td>
                <td>{doc.expiresOn || '—'}</td>
                <td>
                  {doc.hasFile ? (
                    <button
                      type="button"
                      className="secondary"
                      disabled={downloadingId === doc.id}
                      onClick={() => handleDownload(doc.id)}
                    >
                      {downloadingId === doc.id ? 'Downloading…' : doc.fileName || 'Download'}
                    </button>
                  ) : doc.filePath ? (
                    <a href={doc.filePath} target="_blank" rel="noreferrer">
                      Link
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Add a document</h3>
      <p className="meta">
        Upload the file (PDF, JPEG, PNG or WebP, up to 10MB) or, if it's easier, just add a link to
        where it lives. A consultant verifies it before it counts as ready.
      </p>
      {docError && <p className="error">{docError}</p>}
      {docNotice && <p className="notice">{docNotice}</p>}
      <form onSubmit={handleAddDocument}>
        <label>
          <span>Type</span>
          <select value={docForm.type} onChange={updateDoc('type')}>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <div className="row-2">
          <label>
            <span>Reference / policy number (optional)</span>
            <input value={docForm.reference} onChange={updateDoc('reference')} />
          </label>
          <label>
            <span>Issuer (optional)</span>
            <input value={docForm.issuer} onChange={updateDoc('issuer')} />
          </label>
        </div>
        <div className="row-2">
          <label>
            <span>Issued on (optional)</span>
            <input type="date" value={docForm.issuedOn} onChange={updateDoc('issuedOn')} />
          </label>
          <label>
            <span>Expires on (optional)</span>
            <input type="date" value={docForm.expiresOn} onChange={updateDoc('expiresOn')} />
          </label>
        </div>
        <label>
          <span>Upload a file (optional)</span>
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={(event) => setDocFile(event.target.files?.[0] || null)}
          />
        </label>
        <label>
          <span>Or a link to the document (optional)</span>
          <input type="url" placeholder="https://…" value={docForm.filePath} onChange={updateDoc('filePath')} />
        </label>
        <label>
          <span>Notes (optional)</span>
          <textarea value={docForm.notes} onChange={updateDoc('notes')} />
        </label>
        <button type="submit" disabled={docSubmitting}>
          {docSubmitting ? 'Adding…' : 'Add document'}
        </button>
      </form>
    </div>
  );
}

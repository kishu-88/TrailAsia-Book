const team = [
  {
    initials: 'JR',
    color: 'var(--accent)',
    name: 'Trip consultants',
    role: 'Plan your itinerary',
    blurb:
      "The people who pick up your enquiry — they work out dates, pace and price with you before anything is confirmed, and stay your point of contact from first message to the day you're back.",
  },
  {
    initials: 'ST',
    color: 'var(--terracotta)',
    name: 'Trip coordinators',
    role: 'Keep a confirmed trip on track',
    blurb:
      'Once a booking is confirmed, coordinators chase documents, keep your itinerary current, and are who your consultant hands off to for the operational side of a trip.',
  },
  {
    initials: 'FN',
    color: 'var(--gold)',
    name: 'Finance team',
    role: 'Payments and receipts',
    blurb:
      'Records every instalment against your booking by hand and keeps your payment schedule accurate — reachable through your consultant if anything looks off.',
  },
  {
    initials: 'LG',
    color: 'var(--sky)',
    name: 'Local guides',
    role: "On the ground where you're trekking",
    blurb:
      "Licensed local guides run every trip day to day — the Sherpa, Bhutanese and Southeast Asian guides who actually know the trail, not a rotating pool of strangers.",
  },
];

export default function TeamPage() {
  return (
    <div>
      <span className="eyebrow">Meet the team</span>
      <h1>Who you're actually dealing with</h1>
      <p className="lede">
        TrailAsia is a small team split across trip planning, on-trip coordination and finance,
        backed by local guides in every destination we run. We haven't published individual
        profiles yet — here's what each part of the team actually does for your trip.
      </p>

      <div className="team-grid">
        {team.map((member) => (
          <div className="card team-card" key={member.name}>
            <div className="avatar" style={{ background: member.color }}>
              {member.initials}
            </div>
            <h3>{member.name}</h3>
            <p className="role">{member.role}</p>
            <p>{member.blurb}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const faqs = [
  {
    q: 'How does booking actually work?',
    a: "You don't book instantly on this site. Send an enquiry from a destination page — dates and party size are a starting point, not a reservation — and a consultant will follow up to plan the real itinerary and price with you. Once that's confirmed, we set you up with sign-in access to your own trip page.",
  },
  {
    q: 'Can I pay online?',
    a: "Not yet — there's no online payment gateway on this site. Once your trip is confirmed, our finance team records instalments and payments by hand, and you can see your payment schedule and what's outstanding on your trip page.",
  },
  {
    q: "What's the 'my trips' area for?",
    a: "Once a consultant has confirmed your booking, they'll send you a one-time activation link to set up sign-in access. From there you can see your itinerary, your payment schedule, upload any documents we've asked for, and use the on-trip safety check-in.",
  },
  {
    q: 'What documents will I need to upload?',
    a: 'It depends on the trip and destination — things like passport scans, visa documents or medical forms. Your consultant will tell you exactly what is required for your itinerary, and you upload them from your trip page. Our team reviews each one and marks it verified once it checks out.',
  },
  {
    q: 'How does the on-trip safety check-in work?',
    a: "It's entirely opt-in. Location sharing is off by default and only turns on once you actively give consent for a specific trip — we'll never track you without it. If you press the SOS button, that works regardless of whether location sharing is on, because pressing it is itself telling us you want to be found. Location pings are kept only for a limited retention period after your trip ends and then purged; SOS alert records are kept longer, since they're incident records rather than routine tracking data.",
  },
  {
    q: 'Will I get emails or texts about my trip?',
    a: "Not yet — we don't have email or SMS notifications wired up. If you're signed in, updates about your booking, documents and payments show up as in-app notifications on your trip page.",
  },
  {
    q: 'Which destinations do you run?',
    a: 'The Himalaya — Nepal, Bhutan and Tibet — plus Southeast Asia — Vietnam, Indonesia and Thailand. Each destination page lists its own best time to visit, fitness level and packing notes. Browse what is currently open on the Destinations page.',
  },
  {
    q: "I'm not ready to commit to a trip — can I just ask a question?",
    a: "Yes — use the Contact page for anything general. It doesn't create a booking or an enquiry, it just reaches our trip-planning team directly.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <span className="eyebrow">FAQ</span>
      <h1>FAQ &amp; travel info</h1>
      <p className="lede">Answers to what people actually ask us before and during a trip.</p>

      {faqs.map((item) => (
        <div key={item.q} style={{ marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>{item.q}</h2>
          <p style={{ margin: 0 }}>{item.a}</p>
        </div>
      ))}
    </div>
  );
}

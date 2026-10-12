import { Link } from 'react-router-dom';

const commitments = [
  {
    mark: '◆',
    title: 'Local guides, always',
    body: "Every trip is led by licensed guides from the country you're visiting — Sherpa guides in Nepal, Bhutanese guides in Bhutan, local guides throughout Southeast Asia. It's their trail and their income, not a fly-in operation.",
  },
  {
    mark: '◆',
    title: 'Small groups by design',
    body: 'Every itinerary is built around a small party, not a coach-load. Less impact on the trail and the villages along it, and a guide who can actually look after everyone.',
  },
  {
    mark: '◆',
    title: 'Fees that fund conservation, not just permits',
    body: "In destinations like Bhutan, the daily tariff your trip pays into isn't just a cost of entry — it directly funds conservation and community programmes, and we pass that structure through rather than working around it.",
  },
  {
    mark: '◆',
    title: 'Leave-no-trace on the trail',
    body: 'Guides carry out what gets carried in, and itineraries are planned with rest and acclimatisation days rather than pushed to a schedule that damages both the environment and the group.',
  },
];

export default function SustainabilityPage() {
  return (
    <div>
      <span className="eyebrow">Responsible &amp; sustainable travel</span>
      <h1>Leaving the trail better than we found it</h1>
      <p className="lede">
        Trekking tourism can genuinely help the communities and environments it passes through, or
        genuinely harm them, depending on how it's run. Here's how we try to land on the right
        side of that.
      </p>

      <div className="pillar-list">
        {commitments.map((item) => (
          <div className="pillar" key={item.title}>
            <div className="pillar__mark">{item.mark}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Still a work in progress</h2>
      <p>
        We're a small agency and don't claim to have this perfect — if you have questions about
        how a specific trip is run, ask your consultant directly, or{' '}
        <Link to="/contact">send us a message</Link>.
      </p>
    </div>
  );
}

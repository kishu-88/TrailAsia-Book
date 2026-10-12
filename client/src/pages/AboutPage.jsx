import { Link } from 'react-router-dom';

const links = [
  {
    to: '/about/our-story',
    title: 'Our story',
    blurb: "Why TrailAsia started with small-group Himalaya treks, and where it's headed.",
  },
  {
    to: '/about/team',
    title: 'Meet the team',
    blurb: 'The consultants, coordinators and local guides behind every trip.',
  },
  {
    to: '/about/why-us',
    title: 'Why choose us',
    blurb: "What's different about planning a trip with a real consultant.",
  },
  {
    to: '/about/sustainability',
    title: 'Responsible & sustainable travel',
    blurb: 'How we try to leave the places we trek through better off, not worse.',
  },
];

export default function AboutPage() {
  return (
    <div>
      <span className="eyebrow">About TrailAsia</span>
      <h1>Small-group trips across Asia, planned around you</h1>
      <p className="lede">
        We run trekking trips across the Himalaya and Southeast Asia — planned by a real
        consultant, not booked instantly off a shelf. Here's more about how we work and what
        we stand for.
      </p>

      <div className="hub-grid">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="hub-card">
            <h3>{link.title}</h3>
            <p>{link.blurb}</p>
            <span className="hub-card__arrow">Read more →</span>
          </Link>
        ))}
      </div>

      <h2>Get in touch</h2>
      <p className="lede">
        General questions, partnership enquiries, or anything that isn't a specific trip —{' '}
        <Link to="/contact">send us a message</Link>. If you're after a quote for a trip, sending
        an enquiry from a destination page gets you to a consultant faster.
      </p>
    </div>
  );
}

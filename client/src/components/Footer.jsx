import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Logo />
          <p>Small-group treks across the Himalaya and Southeast Asia, planned with you.</p>
        </div>
        <div className="footer__col">
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/about/our-story">Our story</Link>
          <Link to="/about/team">Meet the team</Link>
          <Link to="/about/why-us">Why choose us</Link>
          <Link to="/about/sustainability">Responsible travel</Link>
        </div>
        <div className="footer__col">
          <h4>Support</h4>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ &amp; travel info</Link>
          <Link to="/terms">Terms &amp; privacy</Link>
        </div>
      </div>
      <p className="footer__meta">© TrailAsia. Trips across the Himalaya and Southeast Asia.</p>
    </div>
  );
}

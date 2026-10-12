import { Link } from 'react-router-dom';
import { useTravellerAuth } from '../context/TravellerAuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

export default function NavBar() {
  const { traveller, booting, logout } = useTravellerAuth();

  return (
    <div className="nav">
      <Link to="/">
        <Logo />
      </Link>
      <div className="links">
        <Link to="/destinations">Destinations</Link>
        <Link to="/about">About</Link>
        {!booting && traveller && <Link to="/trips">My trips</Link>}
        {!booting && traveller && (
          <Link to="/safety" className="nav__sos">
            SOS
          </Link>
        )}
        {!booting && traveller && <NotificationBell />}
        {!booting && traveller && (
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              logout();
            }}
          >
            Sign out
          </a>
        )}
        {!booting && !traveller && <Link to="/sign-in">Sign in</Link>}
      </div>
    </div>
  );
}

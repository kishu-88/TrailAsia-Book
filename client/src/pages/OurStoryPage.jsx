import { Link } from 'react-router-dom';

export default function OurStoryPage() {
  return (
    <div>
      <span className="eyebrow">Our story</span>
      <h1>Started on one trail, still planned the same way</h1>
      <p className="lede">
        TrailAsia began with a simple frustration: most trekking trips were sold like a package
        holiday, not planned like an expedition. We started with a handful of Himalayan
        programmes — Nepal, Bhutan, Tibet — and grew from there.
      </p>

      <h2>From the Himalaya outward</h2>
      <p>
        Our first trips were built around the classic Everest Base Camp route: Sherpa-guided,
        small groups, real acclimatisation days instead of a schedule that looks efficient on
        paper and falls apart at altitude. That approach — plan the trip around the terrain and
        the traveller, not the other way around — is still how every itinerary gets built today,
        wherever it's headed.
      </p>
      <p>
        As demand grew for something a little less extreme without being any less real, we added
        Southeast Asia programmes — Vietnam, Indonesia, Thailand — built the same way: local
        guides, small groups, and a consultant who actually answers when you have a question about
        your specific trip.
      </p>

      <h2>What hasn't changed</h2>
      <p>
        We still don't do instant checkout. Every trip on this site starts as an enquiry, not a
        booking, because dates, fitness level and group size change what a good itinerary looks
        like — and that's a conversation, not a form. See{' '}
        <Link to="/about/why-us">why we plan this way</Link> for more on what that means in
        practice.
      </p>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function TermsPrivacyPage() {
  return (
    <div>
      <span className="eyebrow">Terms &amp; Privacy</span>
      <h1>Terms &amp; Privacy</h1>
      <p className="lede">
        A plain-language explanation of what we collect through this site, why, and how long we
        keep it. TrailAsia handles personal information in line with the Australian Privacy
        Principles under the Privacy Act 1988 (Cth).
      </p>

      <h2>What we collect, and why</h2>
      <ul>
        <li>
          <strong>Booking enquiries.</strong> When you send an enquiry from a destination page, we
          collect your name, email, phone (if given), rough travel dates, party size and any
          message you add. This becomes a traveller record and an enquiry a consultant follows up
          on.
        </li>
        <li>
          <strong>Contact messages.</strong> The general contact form on the{' '}
          <Link to="/contact">Contact page</Link> collects your name, email, phone (if given) and
          your message. It doesn't create a booking — it's routed straight to our trip-planning
          team.
        </li>
        <li>
          <strong>Trip documents.</strong> Once you're signed in to your trip page, any documents
          you upload (such as passport or visa scans) are stored so our team can review and verify
          them against what your itinerary requires.
        </li>
        <li>
          <strong>Payment records.</strong> Instalments and payments against your booking are
          recorded by our finance team. We do not collect card or bank details through this site —
          there is no online payment gateway.
        </li>
        <li>
          <strong>Location data, only with consent.</strong> The on-trip safety check-in only
          collects your location if you explicitly turn it on for that specific booking; it is off
          by default. Location pings are kept only while useful for your safety on the trip and are
          purged automatically a set number of days after the trip ends. Pressing the SOS button
          records that alert (including a position, if available) as an incident record, which we
          keep for longer than routine location pings since it may need to be reviewed afterwards —
          pressing SOS does not require location sharing to have been turned on.
        </li>
      </ul>

      <h2>Collection (APP 3)</h2>
      <p>
        We only collect personal information that's reasonably necessary for planning and running
        your trip, or for responding to an enquiry or message you've sent us. We collect it
        directly from you, through the forms on this site or from the trip page once you're signed
        in.
      </p>

      <h2>Security and retention (APP 11)</h2>
      <p>
        We keep personal information only as long as it's needed for the purpose it was collected
        for, and take reasonable steps to protect it from misuse, loss, and unauthorised access.
        Location pings are the clearest example of this in practice: they are automatically purged
        a fixed number of days after your trip ends rather than kept indefinitely.
      </p>

      <h2>Who sees it</h2>
      <p>
        Information you give us is seen by TrailAsia staff working on your trip — consultants,
        coordinators, and, for payments and documents, the relevant specialist teams — not shared
        with unrelated third parties. Uploaded documents are reviewed by our team as part of
        verifying you're ready to travel.
      </p>

      <h2>Your access</h2>
      <p>
        If you have a trip page, you can see your own itinerary, documents and payment schedule
        directly. For anything else — access, correction, or questions about what we hold on you —
        contact us using the form on the <Link to="/contact">Contact page</Link>.
      </p>

      <h2>Terms of use</h2>
      <p>
        Submitting an enquiry or a message through this site does not create a booking — a trip is
        only confirmed once a consultant has agreed the itinerary and price with you directly.
        Dates, prices and availability shown on destination pages are indicative and subject to
        change until confirmed.
      </p>
    </div>
  );
}

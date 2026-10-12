const pillars = [
  {
    mark: '1',
    title: 'A real consultant plans your trip',
    body: "No instant checkout. Send an enquiry and a consultant works out the itinerary, pace and price with you directly, around your dates and fitness level — not a fixed departure you're slotted into.",
  },
  {
    mark: '2',
    title: 'One place for your whole trip',
    body: 'Once confirmed, your itinerary, payment schedule, and document checklist all live on your own trip page — no chasing separate emails to find out what you still owe or still need to upload.',
  },
  {
    mark: '3',
    title: 'An opt-in safety check-in',
    body: "Location sharing on a confirmed trip is off by default and only turns on if you choose it. Pressing the SOS button always works, whether or not you've turned that on — because pressing it is itself telling us you want to be found.",
  },
  {
    mark: '4',
    title: "Straightforward about what we don't do yet",
    body: "We won't tell you something works when it doesn't. There's no online payment gateway yet — finance records instalments by hand — and no email or SMS notifications, only in-app ones on your trip page. See our FAQ for the full picture.",
  },
];

export default function WhyUsPage() {
  return (
    <div>
      <span className="eyebrow">Why choose us</span>
      <h1>What's actually different about booking with us</h1>
      <p className="lede">
        Not marketing claims — this is what the site in front of you actually does, and what it
        deliberately doesn't do yet.
      </p>

      <div className="pillar-list">
        {pillars.map((pillar) => (
          <div className="pillar" key={pillar.title}>
            <div className="pillar__mark">{pillar.mark}</div>
            <div>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

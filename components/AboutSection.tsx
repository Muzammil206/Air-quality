const aboutCards = [
  {
    icon: "groups",
    title: "Who We Are",
    description: "A team of dedicated scientists and analysts improving air quality across Nigeria.",
  },
  {
    icon: "location_city",
    title: "Cities Covered",
    description: "Monitoring Abuja, Lagos, and Port Harcourt, with plans for nationwide expansion.",
  },
  {
    icon: "analytics",
    title: "What We Provide",
    description: "Real-time data, historical trends, and actionable insights for all.",
  },
  {
    icon: "health_and_safety",
    title: "Why It Matters",
    description: "Clean air is vital for public health, and our platform is a key tool for change.",
  },
];

export const AboutSection = () => {
  return (
    <section className="py-20 sm:py-28" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            About the Platform
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Understanding our mission and the technology that drives it.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {aboutCards.map((card, index) => (
            <div key={index} className="rounded-xl shadow-lg p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" style={{ backgroundColor: 'var(--color-card)' }}>
              <span className={`material-symbols-outlined text-primary text-5xl icon-card-icon mx-auto`}>
                {card.icon}
              </span>
              <h3 className="mt-4 text-xl font-bold text-foreground">{card.title}</h3>
              <p className="mt-2 text-muted-foreground">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
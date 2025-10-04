const cityData = [
  {
    name: "Abuja",
    aqi: 42,
    status: "Good",
    statusColor: "text-success",
  },
  {
    name: "Lagos",
    aqi: 65,
    status: "Moderate",
    statusColor: "text-warning",
  },
  {
    name: "Port Harcourt",
    aqi: 58,
    status: "Moderate",
    statusColor: "text-warning",
  },
  {
    name: "Kano",
    aqi: 72,
    status: "Moderate", 
    statusColor: "text-warning",
  },
];

export const DataPreviewSection = () => {
  return (
    <section className="py-20 sm:py-28 bg-muted/30" id="data-preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Data Preview
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A glimpse into the real-time air quality across key Nigerian cities.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              alt="Map of Nigeria with pins on major cities" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZhlroX0w48Fi1Azdbv_YAZC1ZlEPQHagnyhqO7HzDtTll0AXyMcR1kKGnfcSk-0hruT7-N56neXje1SLMlZK4qWiJ36wE-HOi7DhRct33PLyj1rhoEHQ3vs8_yDqoBXd9mcDO9uQnuriHLOrmAbPkBTvsPYG6Bq-_9xcLSA8p2CLB3hOhZp2F5nJfxXuaYf14TYXv8JiF6fnNYj8Qw-OCWX6caPScqlRVU5Re4XXPNACxPE-jGz2z7VRH-kvFh7UDm1CSdwN00nc"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cityData.map((city, index) => (
              <div key={index} className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--color-card)' }}>
                <p className="text-lg font-medium text-card-foreground">{city.name}</p>
                <p className="text-4xl font-bold text-primary mt-2">AQI {city.aqi}</p>
                <p className={`mt-2 text-lg font-semibold ${city.statusColor}`}>{city.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
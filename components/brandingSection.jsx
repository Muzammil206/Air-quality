const logos = [
  {
    alt: "NASRDA Logo",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo3pJPtUSA0kcoi36e6WIHwQldBK_jtVC4ksX1CgS-uzsSJijJmV2jF80Na45vp5nFiH9WhboD0PXRyKDhkMlzF5RY4WDBgYWjZab5Tx7agdmgtEy8pqkXOA9r-SYDrd4Hi6_QVSuNLSPKSlt_t8M6zq0aHYsxRAjuwnWH4o8hW0fFpbQm9P662Fzv_CRyzaf2JyDQap1QCmwRh-zkLsGPO3QCw4LBfngZ_1_G95AWGFJzkDjH70r0Yz2piwPEltcu8mg0gwMediA",
  },
  {
    alt: "SSA Department Logo",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7BkgxdrFG0Ay6TZxALNkIfsQKkwCgROxNkMWdSiTcVsvXLejwZzFFrADiVjwY1wCRBMM8NZfqDNefjIZhUVPk58AQjnBX0Q_n1bVZIsV3qDPHeO9l7aaCiCeiwC_nVfbulEzvjl_8-CjzaVjgziXOcyfx-YKO84nHFxg6lGMsC-nb4qcX4E9fKWlxnNxmZ3v3DMwcFKaXNDE3qoLyN9p6cM_NGY8lGNG78y_tMmFvgq9b1RLeW1Ay7qERWm0kbU8NBjHxfBrmcOQ",
  },
  {
    alt: "ECC Division Logo",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbf-P2vmFvxaC4BIl0yj7XDl4DRxvr6SzbUqVWMKuIYE7CqVbsbu7HP62S2nMzxgvZQAFpVyC_m-a5pCl9cdnmKlCyTjZYsENOxbhfzCaSZByp3s-B-Ihp8j-YAdjYqWXii22jSKDRDeKoiJ4kZD27YCy07E-ClQwnrF_XUy-e1VW_fefeerqLBqr_4NpbW676_c9sSrBMrNd9r_yv3CMc5l9ZY7wTwrLqY3IbTcKwamn4YIBV71J6_pIExCx4GnRGDJC4vSxblj8",
  },
];

export const BrandingSection = () => {
  return (
    <section className="py-20 sm:py-28" id="branding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Institutional Branding
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Proudly powered by Nigeria's leading space and research agencies.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {logos.map((logo, index) => (
            <div key={index} className="flex justify-center items-center p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-card)' }}>
              <img alt={logo.alt} className="h-20 object-contain" src={logo.src} />
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-muted-foreground">
          In partnership with future collaborators.
        </p>
      </div>
    </section>
  );
};
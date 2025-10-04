export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 w-full py-5 px-4 sm:px-6 lg:px-8 backdrop-blur-sm bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2"
            />
          </svg>
          <span className="text-primary text-xl font-bold">AQMP</span>
        </div>
        <div className="flex space-x-6">
          <a className="text-foreground hover:text-primary transition-colors font-medium" href="#hero">
            Home
          </a>
          <a className="text-foreground hover:text-primary transition-colors font-medium" href="#about">
            About
          </a>
          <a className="text-foreground hover:text-primary transition-colors font-medium" href="#data-preview">
            Data
          </a>
          <a className="text-foreground hover:text-primary transition-colors font-medium" href="#branding">
            Partners
          </a>
        </div>
      </div>
    </nav>
  );
};
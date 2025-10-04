export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-background-dark/50 py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0" style={{ backgroundColor: 'var(--color-card)' }}>
        <div className="flex space-x-6">
          <a className="text-muted-foreground hover:text-primary transition-colors" href="#data-preview">
            Dashboard
          </a>
          <a className="text-muted-foreground hover:text-primary transition-colors" href="#about">
            About
          </a>
          <a className="text-muted-foreground hover:text-primary transition-colors" href="#">
            Data Policy
          </a>
        </div>
        <div className="flex space-x-6">
          <a className="text-muted-foreground hover:text-primary transition-colors" href="#">
            <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path 
                clipRule="evenodd" 
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" 
                fillRule="evenodd"
              />
            </svg>
          </a>
          <a className="text-muted-foreground hover:text-primary transition-colors" href="#">
            <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a className="text-muted-foreground hover:text-primary transition-colors" href="#">
            <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path 
                clipRule="evenodd" 
                d="M.05 6.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H1.562l5.22 4.636a.75.75 0 01-.968 1.152L.44 6.83A.75.75 0 01.05 6.25zm0 0" 
                fillRule="evenodd"
              />
              <path d="M.05 6.25A.75.75 0 01.8 5.5h14.5a.75.75 0 01.52.22l-6.845 6.844a2.25 2.25 0 01-3.18 0L.28 5.72A.75.75 0 01.05 6.25z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-8 text-center">
        <p className="text-base text-muted-foreground">
          © 2024 Air Quality Monitoring Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// This is a wrapper component for the logo to ensure it's accessible throughout the application
const Logo = () => {
  return (
    <img 
      src="/img/logo.png" 
      alt="W4lkies Logo" 
      className="h-full w-auto object-contain"
      style={{ maxHeight: '100%' }}
    />
  );
};

export default Logo;

// Exporting the direct URL for cases where we need just the URL
export const logoUrl = "/img/logo.png";

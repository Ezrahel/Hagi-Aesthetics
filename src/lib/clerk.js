export const clerkAppearance = {}

// Error boundary component for Clerk
export const ClerkErrorBoundary = ({ children }) => {
  return (
    <div className="clerk-error-boundary">
      {children}
    </div>
  );
};

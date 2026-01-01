export default function Skeleton({ className = '', width, height, rounded = true }) {
  const baseClasses = 'animate-pulse bg-gray-200';
  const roundedClass = rounded ? 'rounded' : '';
  const style = {};
  
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div
      className={`${baseClasses} ${roundedClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton height="16px" width="60px" />
        <Skeleton height="44px" />
      </div>
      <div className="space-y-2">
        <Skeleton height="16px" width="80px" />
        <Skeleton height="44px" />
      </div>
      <Skeleton height="48px" />
    </div>
  );
}

export function AuthCardSkeleton() {
  return (
    <div className="auth-card">
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton height="32px" width="200px" />
          <Skeleton height="20px" width="300px" />
        </div>
        <FormSkeleton />
        <div className="flex justify-center gap-2">
          <Skeleton height="20px" width="120px" />
        </div>
      </div>
    </div>
  );
}


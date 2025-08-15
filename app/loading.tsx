export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{borderColor: 'var(--cyber-cyan)'}}></div>
        <p className="mt-4 font-mono text-lg" style={{color: 'var(--cyber-cyan)'}}>
          {'>> LOADING PULSE LINK...'}
        </p>
      </div>
    </div>
  );
}
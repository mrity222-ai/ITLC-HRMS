import LoginForm from './components/LoginForm';

export default function App() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#fafbfc] text-slate-800 relative font-sans py-8 lg:py-12 overflow-y-auto">
      {/* Bounded background visual elements container to prevent unwanted scroll extensions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle global grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {/* Ambient background glow & floating abstract blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/8 blur-[120px]" />
        
        {/* Floating abstract blobs */}
        <div className="hidden md:block absolute top-1/4 left-[5%] w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-300/12 to-purple-300/8 blur-[90px] animate-blob-1" />
        <div className="hidden md:block absolute bottom-1/4 right-[5%] w-80 h-80 rounded-full bg-gradient-to-tr from-purple-300/10 to-pink-300/8 blur-[100px] animate-blob-2" />
        <div className="hidden md:block absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-300/8 to-indigo-300/10 blur-[80px] animate-blob-3" />
      </div>

      {/* Main card centered on screen */}
      <div className="w-full max-w-[480px] sm:max-w-[540px] md:max-w-3xl lg:max-w-[960px] h-auto relative z-10 flex items-center justify-center mx-auto">
        <LoginForm />
      </div>
    </main>
  );
}

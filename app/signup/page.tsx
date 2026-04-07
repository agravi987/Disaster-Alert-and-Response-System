import { redirect } from "next/navigation";
import { FiActivity, FiGlobe, FiUserPlus } from "react-icons/fi";
import ThemeToggle from "@/components/theme-toggle";
import SignupForm from "@/components/signup-form";
import { getDashboardPathForRole } from "@/lib/auth";
import { getSessionInfo } from "@/lib/auth-server";

export default async function SignupPage() {
  const session = await getSessionInfo();

  if (session.isAuthenticated && session.role) {
    redirect(getDashboardPathForRole(session.role));
  }

  return (
    <main
      className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-10 selection:bg-teal-500 selection:text-white"
      data-testid="signup-page"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] right-[-5%] w-96 h-96 rounded-full bg-teal-500/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute top-[50%] left-[20%] w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px]" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] overflow-hidden rounded-3xl bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-white/20 dark:bg-slate-900/70 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] md:grid md:grid-cols-2">
        {/* Left Branding/Hero Section */}
        <section className="relative hidden flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white md:flex md:p-12">
          {/* Subtle overlay pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 contrast-150 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-lg border border-white/10">
              <FiUserPlus className="text-2xl text-teal-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl md:leading-[1.1]">
              Join the <br />
              <span className="text-teal-400">Network</span>
            </h1>
            <p className="mt-6 text-base text-slate-300 leading-relaxed max-w-sm">
              Create your account to start reporting incidents or responding to natural disasters with real-time coordination.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="relative z-10 mt-12">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 border border-white/5 hover:bg-white/10 transition-colors">
                 <FiActivity className="text-teal-400 shrink-0" />
                 <span className="text-sm font-medium text-slate-200">Real-time alerts</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 border border-white/5 hover:bg-white/10 transition-colors">
                 <FiGlobe className="text-teal-400 shrink-0" />
                 <span className="text-sm font-medium text-slate-200">Global reach</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Form Section */}
        <section className="flex flex-col justify-center p-8 md:p-12 lg:px-16 bg-white/50 dark:bg-slate-900/50">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
                Create account
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Sign up and configure your specific role.
              </p>
            </div>
            
            <SignupForm />
          </div>
        </section>
      </div>
    </main>
  );
}

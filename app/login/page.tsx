import { FiHome, FiShield, FiTool, FiUsers } from "react-icons/fi";
import LoginForm from "@/components/login-form";
import ThemeToggle from "@/components/theme-toggle";
import { getDashboardPathForRole } from "@/lib/auth";
import { getSessionInfo } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSessionInfo();

  if (session.isAuthenticated && session.role) {
    redirect(getDashboardPathForRole(session.role));
  }

  return (
    <main
      className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-10 selection:bg-teal-500 selection:text-white"
      data-testid="login-page"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-teal-500/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-64 h-64 rounded-full bg-purple-500/10 blur-[80px]" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] overflow-hidden rounded-3xl bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-white/20 dark:bg-slate-900/70 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] md:grid md:grid-cols-2">
        {/* Left Branding/Hero Section */}
        <section className="relative flex flex-col justify-center bg-gradient-to-br from-teal-600 to-emerald-800 p-10 text-white md:p-12">
          {/* Subtle overlay pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-lg border border-white/10">
              <FiShield className="text-2xl text-teal-100" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl md:leading-[1.1]">
              Disaster Alert <br />
              <span className="text-teal-200">& Rescue</span>
            </h1>
            <p className="mt-6 text-base text-teal-50 leading-relaxed max-w-sm">
              Role-based control center for citizens, admins, rescue centers, and rescue teams. Coordinate and respond faster when it matters most.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="relative z-10 mt-12 hidden md:block">
            <div className="flex -space-x-3">
              {[FiUsers, FiHome, FiTool].map((Icon, idx) => (
                <div key={idx} className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-teal-700 bg-teal-800 text-teal-100 shadow-sm transition-transform hover:-translate-y-1">
                  <Icon className="text-sm" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs font-medium text-teal-200">Trusted by rescue teams worldwide</p>
          </div>
        </section>

        {/* Right Form Section */}
        <section className="flex flex-col justify-center p-8 md:p-12 lg:px-16 bg-white/50 dark:bg-slate-900/50">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Please enter your details to sign in.
              </p>
            </div>
            
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}

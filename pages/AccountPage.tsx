import { TopBar } from "../components/TopBar";
import { useAppStore } from "../store/AppStore";
import { curiosityFacts } from "../utils/curiosities";

export const AccountPage = () => {
  const { user, prefs } = useAppStore();
  const savedFacts = curiosityFacts.filter((fact) => prefs.coolStuffSeen.includes(fact.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-charcoal-900">Account</h1>
          <p className="mt-2 text-sm text-slate-500">Profile details and learning archive.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
              <p className="text-sm font-semibold text-charcoal-900">{user?.name ?? "Learner"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
              <p className="text-sm font-semibold text-charcoal-900">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-charcoal-900">Cool Stuff</h2>
          <p className="mt-2 text-sm text-slate-500">Curiosities unlocked after effort.</p>
          {savedFacts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No curiosities saved yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {savedFacts.map((fact) => (
                <li key={fact.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                  {fact.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

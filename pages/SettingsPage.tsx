import { TopBar } from "../components/TopBar";
import { useAppStore } from "../store/AppStore";

export const SettingsPage = () => {
  const { prefs } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-charcoal-900">Settings</h1>
          <p className="mt-2 text-sm text-slate-500">Personalize the MVP experience.</p>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-charcoal-900">Selected topics</p>
                <p className="text-xs text-slate-400">{prefs.selectedTopics.length} active</p>
              </div>
              <span className="pill bg-saffron-100 text-charcoal-800">Active</span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="font-semibold text-charcoal-900">Debugging helpers</p>
              <p className="mt-2 text-xs text-slate-400">
                Local state persists in your browser. Clear storage to reset.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

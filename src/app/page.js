import ChatbotWidget from "../../components/ChatbotWidget";

export const metadata = {
  title: "AI Medical Assistant",
  description: "Describe your symptoms to get AI-powered medical guidance. Always consult a real doctor for medical advice.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans p-4">
      <main className="w-full max-w-2xl flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Medical Assistant
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Describe your symptoms to get started.
          </p>
          <p className="text-xs font-semibold text-rose-500">
            ⚠️ Disclaimer: This is an AI. Always consult a real doctor for medical advice.
          </p>
        </div>
        <div className="w-full">
          <ChatbotWidget />
        </div>
      </main>
    </div>
  );
}

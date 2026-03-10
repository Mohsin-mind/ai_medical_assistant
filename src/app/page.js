import ChatbotWidget from "../../components/ChatbotWidget";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full max-w-2xl flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Medical Assistant
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Describe your symptoms to get started. 
            <br/>
            <span className="text-sm font-semibold text-rose-500">Disclaimer: This is an AI. Always consult a real doctor for medical advice.</span>
          </p>
        </div>
            <ChatbotWidget />
      </main>
    </div>
  );
}

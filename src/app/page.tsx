export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-2">
          Sleep<span className="text-[var(--color-primary-light)]">Well</span>
        </h1>
        <p className="text-[var(--color-muted)] text-lg mb-8">
          오늘 밤, 한 가지만 바꿔보세요
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          CBT-I 기반 불면증 자가관리 프로그램
        </p>
      </div>
    </main>
  );
}

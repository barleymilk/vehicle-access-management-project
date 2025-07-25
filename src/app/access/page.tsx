import Header from "@/components/Header";

export default function Access() {
  return (
    <>
      <Header title="출입 기록" />
      <main className="mx-6 pb-24">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">출입 기록</h2>
          </div>
        </div>
      </main>
    </>
  );
}

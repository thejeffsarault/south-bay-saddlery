export function Footer() {
  return (
    <footer className="border-t border-saddle-200 bg-saddle-950 text-saddle-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-lg font-semibold">South Bay Saddlery</p>
        <p className="text-saddle-300">
          Handcrafted on the California coast · Est. 1978
        </p>
        <p className="text-saddle-300">
          &copy; {new Date().getFullYear()} South Bay Saddlery
        </p>
      </div>
    </footer>
  );
}

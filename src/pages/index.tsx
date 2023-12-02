import clsx from "clsx";

function Home() {
  return (
    <div className={clsx("container mx-auto min-h-screen", "p-4 md:p-6", "flex items-center justify-center")}>
      <p className={clsx("text-center")}>Hello World!</p>
    </div>
  );
}

export default Home;

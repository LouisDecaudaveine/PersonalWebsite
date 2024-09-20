import Link from 'next/link'
import BackgroundPong from "./backgroundPong";


export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main id="MainID" className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl sm:text-7xl mx-auto inline-block"> Louis Decaudaveine</h1>
        <p className="ml-[4px]">Recent Comp Sci graduate looking for a job.<br/> Need a website? Get in Touch!</p>
        <p className="ml-[4px]">Email: louisdecau@gmail.com<br/>Phone: +44 7708147482</p>
        <Link href="/Louis_Decaudaveine_CV.pdf" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">CV</Link>
        
      </main>
      <BackgroundPong />
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}

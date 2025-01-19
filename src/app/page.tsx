import Image from 'next/image';

export default function Home() {
  return (
  <section
    className="
      w-full min-h-[calc(100vh-72px)]
      flex items-center justify-center
    ">
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
    </section>
  );
}

export default function Home() {
  return (
    <section className="w-full min-h-[calc(100vh-72px)] flex flex-col items-end justify-center">
      <div className="w-full h-[345px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover rounded-xl"
        >
          <source src="/cielo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="mt-7">
          <p className="
            text-right text-xl font-bold text-gray-800
            font-serif tracking-wider leading-relaxed">
            Learning by Doing
          </p>
          <p className="
            text-right text-xl font-bold text-gray-800
            font-serif tracking-wider leading-relaxed">
            Solving Problems with Code
          </p>
        </div>
    </section>
  );
}
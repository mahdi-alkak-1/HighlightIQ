interface AuthHeroProps {
  title: string;
  subtitle: string;
  imageSrc: string;
}

const AuthHero = ({ title, subtitle, imageSrc }: AuthHeroProps) => {
  const titleLines = title.split("\n");

  return (
    <section
      className="relative flex h-full flex-col justify-between gap-8 px-10 py-12"
      style={{
        backgroundImage: `url(${imageSrc})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[#0d1118]/70" />
      <div className="relative z-10 space-y-4">
        <h1 className="text-3xl font-semibold leading-tight text-white">
          {titleLines.map((line, index) => (
            <span key={line + index} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="max-w-md text-sm text-white/70">{subtitle}</p>
      </div>
    </section>
  );
};

export default AuthHero;

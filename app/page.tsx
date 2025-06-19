import { LandingHero } from "./_template/components/landing-hero";
import { LearnMore } from "./_template/components/learn-more";
import { Footer } from "./_template/components/footer";
import { CARDS } from "./_template/content/cards";

export default function Home() {
  return (
    <>
      <LandingHero />
      <LearnMore cards={CARDS} />
      <Footer />
    </>
  );
}

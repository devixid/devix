import { Heading } from "@/components/atoms";
import { ourTeams } from "@/constants";
import { TeamCard } from "./card";
import { SlideUp } from "@/components/animations/SlideUp";

export default function OurTeams() {
  return (
    <section
      id="team"
      className="scroll-mt-24 py-20 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-16 flex flex-col md:mb-20 md:flex-row md:gap-x-20">
          <SlideUp
            yOffset={20}
            duration={0.8}
            className="mb-8 md:mb-0 md:w-1/3"
          >
            <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
              The Team
            </p>
            <Heading.h2 className="font-extralight">
              Meet the people behind Devix.
            </Heading.h2>
          </SlideUp>

          <SlideUp
            yOffset={20}
            duration={0.8}
            delay={0.1}
            className="md:w-2/3"
          >
            <p className="max-w-xl text-base leading-relaxed text-zinc-500 md:text-lg">
              Our team has the skills and knowledge necessary to build strong
              and secure websites. We use the latest technology to ensure that
              your website can be accessed and used by everyone.
            </p>
          </SlideUp>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {ourTeams.map((team, index) => (
            <SlideUp
              key={team.name}
              yOffset={20}
              duration={0.7}
              delay={index * 0.1}
            >
              <TeamCard
                description={team.description}
                image={team.image}
                name={team.name}
                title={team.title}
                socials={team.socials}
              />
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  );
}

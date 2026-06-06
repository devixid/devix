import { HeadingStatic } from "@/components/atoms/Heading/HeadingStatic";
import { TeamCard } from "./card";
import { SlideUp } from "@/components/animations/SlideUp";
import {
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_SITE_SECTIONS,
  type SectionIntroContent,
} from "@/lib/content-defaults";

interface TeamMemberData {
  name: string;
  title: string;
  description: string;
  imageUrl?: string;
  image?: string;
  socialLinks?: { github?: string; linkedin?: string };
  socials?: { github: string; linkedin: string };
}

interface OurTeamsProps {
  members?: TeamMemberData[];
  intro?: SectionIntroContent;
}

export default function OurTeams({
  members = DEFAULT_TEAM_MEMBERS,
  intro = DEFAULT_SITE_SECTIONS.TEAM_INTRO,
}: OurTeamsProps) {
  const normalized = members.map((m) => ({
    name: m.name,
    title: m.title,
    description: m.description,
    image: m.imageUrl ?? m.image ?? "/noval.png",
    socials: {
      github: m.socialLinks?.github ?? m.socials?.github ?? "",
      linkedin: m.socialLinks?.linkedin ?? m.socials?.linkedin ?? "",
    },
  }));

  return (
    <section id="team" className="scroll-mt-24 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-16 flex flex-col md:mb-20 md:flex-row md:gap-x-20">
          <SlideUp yOffset={20} duration={0.8} className="mb-8 md:mb-0 md:w-1/3">
            <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
              {intro.eyebrow}
            </p>
            <HeadingStatic level="h2" className="font-extralight">
              {intro.headline}
            </HeadingStatic>
          </SlideUp>

          {intro.subheading && (
            <SlideUp yOffset={20} duration={0.8} delay={0.1} className="md:w-2/3">
              <p className="max-w-xl text-base leading-relaxed text-zinc-500 md:text-lg">
                {intro.subheading}
              </p>
            </SlideUp>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {normalized.map((member, index) => (
            <SlideUp key={member.name} yOffset={20} duration={0.7} delay={index * 0.1}>
              <TeamCard {...member} />
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Heading, Text } from "@/components/atoms";
import { ourTeams } from "@/constants";
import { TeamCard } from "./card";

export default function OurTeams() {
  return (
    <div className="flex w-full max-w-5xl flex-col items-center justify-around">
      <div className="my-10 flex w-full max-w-5xl flex-col items-start justify-between px-10 md:flex-row md:px-0">
        <Heading.h2 className="font-light leading-[52.8px]">
          Meet our team.
        </Heading.h2>
        <div className="flex max-w-[635px] flex-col items-start justify-between">
          <Text.p className="mb-5">
            Our Team have the skills and knowledge necessary to build strong and
            secure websites. They will use the latest technology to ensure that
            your website can be accessed and used by everyone.
          </Text.p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-around md:flex-row">
        {ourTeams.map((team) => {
          return (
            <TeamCard
              key={Math.floor(Math.random() * 628239843434)}
              description={team.description}
              image={team.image}
              name={team.name}
              title={team.title}
            />
          );
        })}
      </div>
    </div>
  );
}

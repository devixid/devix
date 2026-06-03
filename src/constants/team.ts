export interface OurTeamProps {
  name: string;
  description: string;
  image: string;
  title: string;
}

export const ourTeams: Array<OurTeamProps> = [
  {
    name: "Noval Ramdhani",
    description:
      "Co-founded Devix and leads our backend system architecture, ensuring database systems and core APIs run securely, reliably, and optimally.",
    image: "/noval.png",
    title: "Founder x Backend Developer",
  },
  {
    name: "Andrian Fadhilla",
    description:
      "Crafts beautiful, interactive user interfaces and ensures fluid user experiences using modern design systems and advanced React architectures.",
    image: "/andrian.png",
    title: "UI/UX x Frontend Developer",
  },
  {
    name: "Dimas Saputra",
    description:
      "Develops cross-platform, high-performance mobile applications that bring robust desktop experiences right into users' pockets.",
    image: "/dimas.png",
    title: "Mobile Developer",
  },
  {
    name: "Alwi wahyu",
    description:
      "Specializes in server logic, API endpoint construction, and cloud integration, keeping database pipelines running smoothly 24/7.",
    image: "/alwi.png",
    title: "Backend Developer",
  },
];

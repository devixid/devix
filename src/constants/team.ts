export interface OurTeamProps {
  name: string;
  description: string;
  image: string;
  title: string;
  socials: {
    github: string;
    linkedin: string;
  };
}

export const ourTeams: Array<OurTeamProps> = [
  {
    name: "Noval Ramdhani",
    description:
      "Co-founded Devix and leads our backend system architecture, ensuring database systems and core APIs run securely, reliably, and optimally.",
    image: "/noval.png",
    title: "Founder x Backend Developer",
    socials: {
      github: "https://github.com/novalramdhani",
      linkedin: "https://linkedin.com/in/novalramdhani",
    },
  },
  {
    name: "Andrian Fadhilla",
    description:
      "Crafts beautiful, interactive user interfaces and ensures fluid user experiences using modern design systems and advanced React architectures.",
    image: "/andrian.png",
    title: "UI/UX x Frontend Developer",
    socials: {
      github: "https://github.com/andrianfadhilla",
      linkedin: "https://linkedin.com/in/andrianfadhilla",
    },
  },
  {
    name: "Dimas Saputra",
    description:
      "Develops cross-platform, high-performance mobile applications that bring robust desktop experiences right into users' pockets.",
    image: "/dimas.png",
    title: "Mobile Developer",
    socials: {
      github: "https://github.com/dimassaputra",
      linkedin: "https://linkedin.com/in/dimassaputra",
    },
  },
  {
    name: "Alwi wahyu",
    description:
      "Specializes in server logic, API endpoint construction, and cloud integration, keeping database pipelines running smoothly 24/7.",
    image: "/alwi.png",
    title: "Backend Developer",
    socials: {
      github: "https://github.com/alwiwahyu",
      linkedin: "https://linkedin.com/in/alwiwahyu",
    },
  },
];

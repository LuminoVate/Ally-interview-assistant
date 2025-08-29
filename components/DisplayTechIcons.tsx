import { getTechLogos } from "@/public/utils";
import Image from "next/image";
import React from "react";

async function DisplayTechIcons({ techStack }: TechIconProps) {
  const techIcons = await getTechLogos(techStack);

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }) => (
        <div key={tech}>
          <span className="tech-tooltip">{tech}</span>
          <Image
            className={`relative group bg-dark-200 rounded-full p-2 flex-center`}
            src={url}
            alt={tech}
            width={40}
            height={40}
          />
        </div>
      ))}
    </div>
  );
}

export default DisplayTechIcons;

import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="root-layout">
      <nav>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo_notext.png" alt="logo" height={40} width={40} />
          <h3 className="text-primary-100">Ally</h3>
        </Link>
      </nav>
      <div>{children}</div>
    </div>
  );
};

export default RootLayout;

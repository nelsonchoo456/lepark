import { useEffect, useState } from "react";
import { SCREEN_LG } from "../../config/breakpoints";
import { Content, Header, Sidebar } from "@lepark/common-ui";

interface MainLayoutProps {
  children?: string | JSX.Element | JSX.Element[];
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [showSidebar, setShowSidebar] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
  );
  
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sidebar

  
  return (
    <div>
      <Header showSidebar={showSidebar} />
      <Sidebar>kekeee</Sidebar>
      <Content $showSidebar={showSidebar}>{children}</Content>
    </div>
  );
}

export default MainLayout;
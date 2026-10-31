"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface DynamicTabTitleProps {
  text?: string;
  badge?: string;
}

export function DynamicTabTitle({
  text = "@warxy",
  badge = "🌙",
}: DynamicTabTitleProps) {
  const pathname = usePathname();

  useEffect(() => {
    // If inside admin panel, keep a clean static title
    if (pathname?.startsWith("/admin")) {
      document.title = "Cyber Studio • @warxy";
      return;
    }

    const fullSequence = `${text} ${badge}`.trim();
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    function step() {
      // Inactive tab fallback
      if (document.hidden) {
        document.title = fullSequence;
        timeoutId = setTimeout(step, 1000);
        return;
      }

      if (!isDeleting) {
        // Typing forward
        currentIndex++;
        document.title = fullSequence.slice(0, currentIndex) + (currentIndex < fullSequence.length ? " ▊" : "");

        if (currentIndex >= fullSequence.length) {
          // Finished typing, wait 3 seconds before deleting
          document.title = fullSequence;
          isDeleting = true;
          timeoutId = setTimeout(step, 3000);
          return;
        }

        // Speed between keystrokes (180ms - 240ms for realistic typewriter feel)
        timeoutId = setTimeout(step, 200);
      } else {
        // Deleting backwards
        currentIndex--;
        document.title = fullSequence.slice(0, currentIndex) + (currentIndex > 0 ? " ▊" : "");

        if (currentIndex <= 1) {
          // Kept the '@', pause briefly then type again
          isDeleting = false;
          timeoutId = setTimeout(step, 800);
          return;
        }

        // Deleting speed (faster: 90ms)
        timeoutId = setTimeout(step, 90);
      }
    }

    timeoutId = setTimeout(step, 400);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = `(1) ${fullSequence}`;
      } else {
        document.title = fullSequence;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [text, badge, pathname]);

  return null;
}

import Link from "next/link";
import { clsx } from "clsx";

const DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclerk%2Fnextjs-auth-starter-template&project-name=nextjs-clerk&repository-name=nextjs-with-clerk&demo-title=Next.js+Clerk+Template&demo-description=A+Next.js+application+pre-configured+to+authenticate+users+with+Clerk.&demo-url=https%3A%2F%2Fnextjs-auth-starter-template-kit.vercel.app%2F&demo-image=%2F%2Fraw.githubusercontent.com%2Fclerk%2Fnextjs-auth-starter-template%2Frefs%2Fheads%2Fmain%2Fpublic%2Fog.png&products=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22clerk%22%2C%22productSlug%22%3A%22clerk%22%2C%22protocol%22%3A%22authentication%22%2C%22group%22%3A%22%22%7D%5D";

export function DeployButton({ className }: { className?: string }) {
  return (
    <Link
      href={DEPLOY_URL}
      target="_blank"
      className={clsx(
        "inline-flex items-center gap-3 bg-black text-white px-4 py-3 text-sm rounded-full hover:bg-gray-800 transition-colors cursor-pointer font-medium",
        className
      )}
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 76 65"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
      </svg>
      <span>Deploy to Vercel</span>
    </Link>
  );
}

import { LearnMore } from "./components/learn-more";
import screenshotDevices from "./images/user-button@2xrl.webp";
import signIn from "./images/sign-in@2xrl.webp";
import verify from "./images/verify@2xrl.webp";
import userButton2 from "./images/user-button-2@2xrl.webp";
import signUp from "./images/sign-up@2xrl.webp";
import logo from "./images/logo.png";
import "./home.css";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "./components/footer";

import { CARDS } from "./consts/cards";

export default function Home() {
  return (
    <>
      <main className="bg-[#FAFAFA] relative">
        <div className="w-full bg-white max-w-[75rem] mx-auto flex flex-col border-l border-r border-[#F2F2F2] row-span-3">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-[#F2F2F2]" />
          <Image
            alt="Device"
            className="size-64 bg-transparent absolute left-1/2 -translate-x-[23.75rem] -top-6 h-[51.375rem] object-contain w-[39.0625rem]"
            src={logo}
            unoptimized
          />

          <div className="px-12 py-16 border-b border-[#F2F2F4]">
            <div className="bg-[#F4F4F5] px-4 py-3 rounded-full inline-flex gap-4">
              <a href="https://clerk.com/docs" target="_blank">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.001 15.75C14.072 15.75 15.7509 14.0711 15.7509 12C15.7509 9.92893 14.072 8.25 12.001 8.25C9.9299 8.25 8.25098 9.92893 8.25098 12C8.25098 14.0711 9.9299 15.75 12.001 15.75Z"
                    fill="#131316"
                  />
                  <path
                    d="M18.7586 20.8788C19.0777 21.1978 19.0457 21.726 18.6708 21.9772C16.7634 23.2548 14.4693 23.9998 12.0012 23.9998C9.533 23.9998 7.23887 23.2548 5.33148 21.9772C4.95661 21.726 4.92457 21.1978 5.24363 20.8788L7.98407 18.1382C8.23176 17.8906 8.61599 17.8514 8.92775 18.0112C9.84956 18.4834 10.8942 18.7498 12.0012 18.7498C13.1081 18.7498 14.1528 18.4834 15.0746 18.0112C15.3864 17.8514 15.7705 17.8906 16.0182 18.1382L18.7586 20.8788Z"
                    fill="#131316"
                  />
                  <path
                    d="M18.6696 2.02275C19.0445 2.27385 19.0765 2.80207 18.7575 3.12112L16.0171 5.86159C15.7693 6.10926 15.3851 6.14838 15.0733 5.98868C14.1515 5.51644 13.1069 5.25 11.9999 5.25C8.27204 5.25 5.24997 8.27208 5.24997 12C5.24997 13.1069 5.51641 14.1516 5.98865 15.0735C6.14836 15.3852 6.10924 15.7693 5.86156 16.0171L3.12111 18.7576C2.80205 19.0765 2.27384 19.0445 2.02273 18.6697C0.745143 16.7623 0 14.4681 0 12C0 5.37258 5.37256 0 11.9999 0C14.4681 0 16.7623 0.745147 18.6696 2.02275Z"
                    fill="#131316"
                    fillOpacity="0.5"
                  />
                </svg>
              </a>
              <div aria-hidden className="w-px h-6 bg-[#C7C7C8]" />
              <a href="https://nextjs.org/" target="_blank">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <g clipPath="url(#clip0_29_46694)">
                    <mask
                      id="mask0_29_46694"
                      style={{ maskType: "alpha" }}
                      width="24"
                      height="24"
                      x="0"
                      y="0"
                      maskUnits="userSpaceOnUse"
                    >
                      <path
                        fill="#000"
                        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
                      ></path>
                    </mask>
                    <g mask="url(#mask0_29_46694)">
                      <path
                        fill="#000"
                        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
                      ></path>
                      <path
                        fill="url(#paint0_linear_29_46694)"
                        d="M19.935 21.003L9.219 7.2H7.2v9.596h1.615V9.251l9.852 12.728c.444-.297.868-.624 1.268-.976z"
                      ></path>
                      <path
                        fill="url(#paint1_linear_29_46694)"
                        d="M16.934 7.2h-1.6v9.6h1.6V7.2z"
                      ></path>
                    </g>
                  </g>
                  <defs>
                    <linearGradient
                      id="paint0_linear_29_46694"
                      x1="14.534"
                      x2="19.267"
                      y1="15.533"
                      y2="21.4"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#fff"></stop>
                      <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_29_46694"
                      x1="16.134"
                      x2="16.107"
                      y1="7.2"
                      y2="14.25"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#fff"></stop>
                      <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
                    </linearGradient>
                    <clipPath id="clip0_29_46694">
                      <path fill="#fff" d="M0 0H24V24H0z"></path>
                    </clipPath>
                  </defs>
                </svg>
              </a>
            </div>
          </div>

          <div className="p-10 border-b border-[#F2F2F2]">
            <h1 className="text-5xl font-bold tracking-tight text-[#131316] relative">
              Auth starts here
            </h1>

            <p className="text-[#5E5F6E] pt-3 pb-6 max-w-[30rem] text-[1.0625rem] relative">
              A simple and powerful Next.js template featuring authentication
              and user management powered by Clerk.
            </p>
            <div className="flex gap-3 relative">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-[#131316] text-white text-sm font-semibold"
              >
                Sign In
              </Link>
              <Link
                href="/#features"
                className="px-4 py-2 rounded-full text-[#131316] text-sm font-semibold bg-[#F7F7F8]"
              >
                Learn more
              </Link>
            </div>
          </div>
          <div className="flex gap-8 w-full h-[41.25rem] scale-[1.03]">
            <div className="space-y-8 translate-y-12">
              <Image
                alt="Device"
                src={signUp}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
            </div>
            <div className="space-y-8 -translate-y-4">
              <Image
                alt="Device"
                src={verify}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
              <Image
                alt="Device"
                src={userButton2}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
            </div>
            <div className="space-y-8 -translate-y-[22.5rem]">
              <Image
                alt="Device"
                src={signIn}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
              <Image
                alt="Device"
                src={screenshotDevices}
                unoptimized
                className="flex-none rounded-xl bg-white shadow-[0_5px_15px_rgba(0,0,0,0.08),0_15px_35px_-5px_rgba(25,28,33,0.2)] ring-1 ring-gray-950/5"
              />
            </div>
          </div>
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-[18.75rem] bg-gradient-to-t from-white" />
      </main>
      <LearnMore cards={CARDS} />
      <Footer />
    </>
  );
}

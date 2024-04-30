interface Card {
  title: string;
  description: string;
  href: string;
  linkText: string;
}

export function LearnMore({ cards }: { cards: Card[] }) {
  return (
    <div className="relative bg-white" id="features">
      <div className="grid grid-cols-4 gap-8 max-w-[75rem] mx-auto w-full pt-16 pb-24">
        <div>
          <span className="text-[0.8125rem]/5 text-[#6C47FF] font-medium">
            What's next
          </span>
          <h2 className="text-xl/[1.625rem] font-semibold text-[#131316] tracking-tight mt-2 mb-3">
            Learn more from our&nbsp;resources
          </h2>
          <p className="text-[0.8125rem]/5 text-[#5E5F6E]">
            Prebuilt components to handle essential functionality like user
            sign-in, sign-up, and account management.
          </p>
        </div>
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            target="_blank"
            className="border border-[#F2F2F4] rounded-lg overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 bg-[#FAFAFB] space-y-1 flex-1">
              <h3 className="text-sm font-medium text-[#131316] tracking-tight">
                {card.title}
              </h3>
              <p className="text-[0.8125rem]/5 text-[#5E5F6E]">
                {card.description}
              </p>
            </div>
            <div className="bg-[#F5F5F7] text-[#131316] px-4 py-2 text-[0.8125rem]/5 font-medium flex items-center gap-1.5 border-t border-[#EDEDF0]">
              {card.linkText}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="2"
                  width="12"
                  height="12"
                  rx="3"
                  fill="#EEEEF0"
                />
                <path
                  d="M5.75 10.25L10.25 5.75M10.25 5.75H6.75M10.25 5.75V9.25"
                  stroke="#9394A1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

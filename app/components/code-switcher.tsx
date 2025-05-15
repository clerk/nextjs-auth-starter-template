"use client";

import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import clsx from 'clsx';

interface CodeSwitcherProps {
  typesToShow: string[];
  codeMap: Record<string, string>;
  theme?: any; // Replace with proper theme type from react-syntax-highlighter
}

export function CodeSwitcher({ typesToShow, codeMap, theme = docco }: CodeSwitcherProps) {
  const [selectedType, setSelectedType] = useState(typesToShow[0]);
  const selectedCode = codeMap[selectedType];

  return (
    <div className="rounded-lg border border-[#EEEEF0] bg-[#FAFAFA] p-4">
      <div className="mb-4 flex gap-2 rounded bg-[#EEEEF0] p-1">
        {typesToShow.map((type) => (
          <button
            className={clsx(
              "capitalize rounded h-7 text-[0.8125rem] flex-1 hover:text-black font-medium",
              selectedType === type
                ? "bg-white shadow-sm text-black"
                : "text-[#5E5F6E]"
            )}
            key={type}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="relative h-[calc(100%-42px)]">
        <div className="mask h-full">
          <SyntaxHighlighter language="javascript" style={theme}>
            {selectedCode}
          </SyntaxHighlighter>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#EEEEF0]" />
      </div>
    </div>
  );
}

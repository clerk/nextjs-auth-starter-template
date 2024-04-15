'use client';

import { useUser } from '@clerk/nextjs';
import classNames from 'classnames';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import theme from './theme';

const TYPES = ['user', 'session', 'organization'];

export function CodeSwitcher() {
  const [selectedType, setSelectedType] = useState(TYPES[0]);
  const { user } = useUser();

  return (
    <div className="h-[666px]">
      <div className="w-full bg-[#F7F7F8] rounded-md p-[3px] flex gap-1.5">
        {TYPES.map((type) => (
          <button
            className={classNames(
              'capitalize rounded h-7 text-[13px] flex-1 hover:text-black transition-colors',
              selectedType === type ? 'bg-white shadow-sm text-black' : 'text-[#5E5F6E]'
            )}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="relative" style={{ height: 'calc(100% - 42px)' }}>
        <div className="mask h-full">
          {/* @ts-ignore */}
          <SyntaxHighlighter language="javascript" style={theme}>
            {JSON.stringify(user, null, 2)}
          </SyntaxHighlighter>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#EEEEF0]" />
      </div>
    </div>
  );
}

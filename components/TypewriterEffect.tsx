'use client';

import Typewriter from 'typewriter-effect';

interface TypewriterEffectProps {
  strings: string[];
}

export default function TypewriterEffect({ strings }: TypewriterEffectProps) {
  return (
    <Typewriter
      options={{
        strings,
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
        delay: 50,
      }}
    />
  );
}

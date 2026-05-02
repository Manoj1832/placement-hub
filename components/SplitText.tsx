"use client";
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | number[];
  splitType?: 'chars' | 'words';
  from?: any;
  to?: any;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = [0.215, 0.61, 0.355, 1], // similar to power3.out
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
  showCallback = false,
}: SplitTextProps) {
  const letters = splitType === 'chars' ? text.split('') : text.split(' ');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: rootMargin as any, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: delay / 1000 },
    },
  };

  const child = {
    hidden: from,
    visible: {
      ...to,
      transition: { duration, ease },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={controls}
      className={`${className} flex flex-wrap justify-${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'end' : 'start'}`}
      onAnimationComplete={() => {
        if (showCallback && onLetterAnimationComplete) {
          onLetterAnimationComplete();
        }
      }}
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

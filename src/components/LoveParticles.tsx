
import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export const LoveParticle = ({ id, color, size, animationDuration }: { 
  id: number, 
  color: string, 
  size: number, 
  animationDuration: number 
}) => {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const randomDelay = Math.random() * 2;
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 1, 0], 
        opacity: [0, 0.8, 0.8, 0],
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * -100],
      }}
      transition={{ 
        duration: animationDuration,
        delay: randomDelay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    >
      <Heart
        size={size}
        className="text-transparent fill-current"
        style={{ color }}
      />
    </motion.div>
  );
};

export const AnimatedBackground = () => {
  const particles = Array(30).fill(0).map((_, index) => {
    const size = Math.random() * 20 + 10;
    return (
      <LoveParticle 
        key={index}
        id={index}
        color={index % 3 === 0 ? '#ff6b6b' : index % 3 === 1 ? '#f06292' : '#ec407a'}
        size={size}
        animationDuration={Math.random() * 3 + 2}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-pink-500/5 z-0"></div>
    </div>
  );
};

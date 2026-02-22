'use client';

import { motion } from "framer-motion";
import React from "react";

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  animationType?: "fadeIn" | "slideInUp" | "slideInLeft" | "slideInRight" | "zoomIn";
  delay?: number;
  duration?: number;
  once?: boolean;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  className = "",
  animationType = "fadeIn",
  delay = 0,
  duration = 0.5,
  once = true,
}) => {
  const animations = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration, delay } },
    },
    slideInUp: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration, delay } },
    },
    slideInLeft: {
      hidden: { x: -20, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { duration, delay } },
    },
    slideInRight: {
      hidden: { x: 20, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { duration, delay } },
    },
    zoomIn: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { duration, delay } },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={animations[animationType]}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedElement;

import React from 'react';
import { motion } from 'framer-motion';
import type { Topic } from '../models/types';

interface SelectedTopicCardProps {
  topic: Topic;
  onContinue: (topicId: string) => void;
}

export const SelectedTopicCard: React.FC<SelectedTopicCardProps> = ({ topic, onContinue }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="min-w-[240px] rounded-2xl bg-white p-4 shadow-card"
  >
    <div className="text-sm font-semibold text-ink">{topic.name}</div>
    <div className="mt-2 text-xs text-ink/60">Progress: 42% · Maturity: Stable</div>
    <button
      type="button"
      onClick={() => onContinue(topic.id)}
      className="mt-4 w-full rounded-full bg-saffron-200 px-4 py-2 text-xs font-semibold text-saffron-900"
    >
      Continue
    </button>
  </motion.div>
);

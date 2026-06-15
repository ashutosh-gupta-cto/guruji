import type { LessonContent } from './types';
import { aiMlLessons } from './ai-ml';
import { csFundamentalsLessons } from './cs-fundamentals';
import { dsaLessons } from './dsa';
import capTheoremContent from './system-design/cap-theorem';
import cachingContent from './system-design/caching';
import databaseInternalsContent from './system-design/database-internals';
import databaseShardingContent from './system-design/database-sharding';
import kafkaContent from './system-design/kafka';
import loadBalancerContent from './system-design/load-balancer';
import messageQueueContent from './system-design/message-queue';
import raftContent from './system-design/raft';
import paxosContent from './system-design/paxos';
import stabilityContent from './system-design/stability';
import interviewSimulatorContent from './system-design/interview-simulator';

export type { LessonContent, LessonSection, QuizQuestion, SourceAttribution } from './types';

const systemDesignLessons: Record<string, LessonContent> = {
  'load-balancer': loadBalancerContent,
  caching: cachingContent,
  'message-queue': messageQueueContent,
  kafka: kafkaContent,
  raft: raftContent,
  'database-internals': databaseInternalsContent,
  'cap-theorem': capTheoremContent,
  'database-sharding': databaseShardingContent,
  paxos: paxosContent,
  stability: stabilityContent,
  'interview-simulator': interviewSimulatorContent,
};

const lessonRegistry: Record<string, LessonContent> = {
  ...dsaLessons,
  ...systemDesignLessons,
  ...aiMlLessons,
  ...csFundamentalsLessons,
};

export function getLessonContent(moduleId: string): LessonContent | undefined {
  return lessonRegistry[moduleId];
}

export function getRegisteredModuleIds(): string[] {
  return Object.keys(lessonRegistry);
}

export { lessonRegistry, aiMlLessons, csFundamentalsLessons, dsaLessons, systemDesignLessons };

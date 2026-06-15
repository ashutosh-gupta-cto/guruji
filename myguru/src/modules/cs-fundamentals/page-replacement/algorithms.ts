/**
 * FIFO / LRU page replacement simulation.
 *
 * Ported from MUMEi-28/VirtualMemorySimulator — step-by-step frame
 * state with page fault highlighting.
 *
 * @see https://github.com/MUMEi-28/VirtualMemorySimulator
 */

export type ReplacementAlgorithm = 'fifo' | 'lru' | 'opt';

export interface FrameStep {
  stepIndex: number;
  page: number;
  frames: (number | null)[];
  isPageFault: boolean;
}

export interface SimulationResult {
  steps: FrameStep[];
  totalFaults: number;
}

export function parseReferenceString(input: string): number[] {
  return input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n));
}

export function simulateFifo(refString: number[], frameCount: number): SimulationResult {
  const frameList: number[] = [];
  const frameSet = new Set<number>();
  let pointer = 0;
  let totalFaults = 0;
  const steps: FrameStep[] = [];

  for (let i = 0; i < refString.length; i++) {
    const currentPage = refString[i];
    const isPageFault = !frameSet.has(currentPage);

    if (isPageFault) {
      totalFaults++;
      if (frameList.length < frameCount) {
        frameList.push(currentPage);
        frameSet.add(currentPage);
      } else {
        const removedPage = frameList[pointer];
        frameSet.delete(removedPage);
        frameList[pointer] = currentPage;
        frameSet.add(currentPage);
        pointer = (pointer + 1) % frameCount;
      }
    }

    steps.push({
      stepIndex: i,
      page: currentPage,
      frames: padFrames(frameList, frameCount),
      isPageFault,
    });
  }

  return { steps, totalFaults };
}

export function simulateLru(refString: number[], frameCount: number): SimulationResult {
  const frameList: number[] = [];
  const lastUsedMap = new Map<number, number>();
  let totalFaults = 0;
  const steps: FrameStep[] = [];

  for (let i = 0; i < refString.length; i++) {
    const currentPage = refString[i];
    const isPageFault = !frameList.includes(currentPage);

    if (isPageFault) {
      totalFaults++;
      if (frameList.length < frameCount) {
        frameList.push(currentPage);
      } else {
        const lruPage = frameList.reduce((lru, page) => {
          const lruTime = lastUsedMap.get(lru) ?? -1;
          const pageTime = lastUsedMap.get(page) ?? -1;
          return pageTime < lruTime ? page : lru;
        });
        const indexToReplace = frameList.indexOf(lruPage);
        frameList[indexToReplace] = currentPage;
      }
    }

    lastUsedMap.set(currentPage, i);

    steps.push({
      stepIndex: i,
      page: currentPage,
      frames: padFrames(frameList, frameCount),
      isPageFault,
    });
  }

  return { steps, totalFaults };
}

export function simulateOpt(refString: number[], frameCount: number): SimulationResult {
  const frameList: number[] = [];
  let totalFaults = 0;
  const steps: FrameStep[] = [];

  for (let i = 0; i < refString.length; i++) {
    const currentPage = refString[i];
    const isPageFault = !frameList.includes(currentPage);

    if (isPageFault) {
      totalFaults++;
      if (frameList.length < frameCount) {
        frameList.push(currentPage);
      } else {
        let farthest = -1;
        let victim = frameList[0];
        for (const page of frameList) {
          let nextUse = refString.length;
          for (let j = i + 1; j < refString.length; j++) {
            if (refString[j] === page) {
              nextUse = j;
              break;
            }
          }
          if (nextUse > farthest) {
            farthest = nextUse;
            victim = page;
          }
        }
        const indexToReplace = frameList.indexOf(victim);
        frameList[indexToReplace] = currentPage;
      }
    }

    steps.push({
      stepIndex: i,
      page: currentPage,
      frames: padFrames(frameList, frameCount),
      isPageFault,
    });
  }

  return { steps, totalFaults };
}

function padFrames(frameList: number[], frameCount: number): (number | null)[] {
  const result: (number | null)[] = [...frameList];
  while (result.length < frameCount) result.push(null);
  return result.slice(0, frameCount);
}

export function runSimulation(
  algorithm: ReplacementAlgorithm,
  refString: number[],
  frameCount: number,
): SimulationResult {
  if (algorithm === 'fifo') return simulateFifo(refString, frameCount);
  if (algorithm === 'opt') return simulateOpt(refString, frameCount);
  return simulateLru(refString, frameCount);
}

export interface AddressTranslation {
  virtualAddress: number;
  pageSize: number;
  pageNumber: number;
  offset: number;
}

export function translateAddress(virtualAddress: number, pageSize: number): AddressTranslation {
  const size = Math.max(1, pageSize);
  return {
    virtualAddress,
    pageSize: size,
    pageNumber: Math.floor(virtualAddress / size),
    offset: virtualAddress % size,
  };
}

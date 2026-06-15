import type { LessonContent } from '../types';

const binarySearchContent: LessonContent = {
  moduleId: 'binary-search',
  title: 'Binary Search',
  sections: [
    {
      heading: 'The core idea',
      body:
        'Binary search finds a target value in a sorted array by repeatedly halving the search space. Instead of checking every element, you compare against the middle element and discard half the remaining range.',
      bullets: [
        'Requires the input to be sorted (or at least monotonic).',
        'Each step eliminates half of the remaining candidates.',
        'Runs in O(log n) time and O(1) extra space for the iterative version.',
      ],
      tip: 'If you can discard half the search space after one comparison, binary search is likely the right tool.',
    },
    {
      heading: 'How it works',
      body:
        'Maintain two pointers — low and high — bounding the active range. Compute mid, compare array[mid] to the target, then move low or high to shrink the range.',
      code: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    },
    {
      heading: 'Common pitfalls',
      body:
        'Off-by-one errors around mid calculation and loop bounds cause most bugs. Use an inclusive range [low, high] with while (low <= high), or a half-open range [low, high) with while (low < high) — pick one convention and stay consistent.',
      bullets: [
        'Integer overflow: use low + (high - low) / 2 instead of (low + high) / 2 in languages without safe arithmetic.',
        'Duplicates: standard binary search returns any match; variants find first or last occurrence.',
        'Not found: return -1 or the insertion index depending on the problem.',
      ],
    },
  ],
  keyTakeaways: [
    'Binary search needs sorted data and cuts the search space in half each step.',
    'Time complexity is O(log n); space is O(1) for the iterative form.',
    'Watch loop invariants and mid calculation to avoid off-by-one bugs.',
  ],
  sourceAttribution: [
    {
      repo: 'visualgo.net',
      url: 'https://visualgo.net/en/bst',
    },
  ],
  quiz: [
    {
      question: 'What is the time complexity of binary search on an array of n elements?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctIndex: 1,
      explanation:
        'Each comparison halves the search space, giving logarithmic time: O(log n).',
    },
    {
      question: 'What precondition must hold for binary search to work correctly?',
      options: [
        'The array must be sorted',
        'The array must have no duplicates',
        'The array must be small',
        'The array must be stored in a tree',
      ],
      correctIndex: 0,
      explanation:
        'Binary search relies on monotonic ordering so that comparing to the midpoint tells you which half to discard.',
    },
  ],
};

export default binarySearchContent;

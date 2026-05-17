import type {
  EmergencyPlan,
  QuizQuestion,
  RoadmapDay,
  SummaryJSON,
} from "./types";

export const DEMO_SUMMARY: SummaryJSON = {
  courseName: "CS 301: Data Structures & Algorithms",
  difficulty: "Hard",
  topics: [
    "Asymptotic Analysis (Big O, Omega, Theta)",
    "Linked Lists, Stacks, and Queues",
    "Binary Search Trees (BST) and AVL Trees",
    "Hash Tables and Collision Resolution",
    "Graph Representations and Traversals (BFS, DFS)",
    "Dijkstra's and Minimum Spanning Trees (Kruskal, Prim)",
    "Dynamic Programming (Knapsack, LCS)",
  ],
  deadlines: [
    { label: "Programming Assignment 3: Trees", date: "May 20, 2026" },
    { label: "Midterm Exam (Units 1-4)", date: "May 22, 2026" },
    { label: "Final Project Submission", date: "June 05, 2026" },
  ],
  learningObjectives: [
    "Analyze the worst-case, average-case, and best-case running times of algorithms.",
    "Implement and modify standard tree, hash, and graph data structures.",
    "Select and justify optimal data structures for diverse real-world problem scenarios.",
    "Design and implement greedy algorithms and dynamic programming solutions.",
  ],
};

export const DEMO_ROADMAP: RoadmapDay[] = [
  {
    day: 1,
    date: "Day 1: Foundation & Complexity",
    topics: ["Asymptotic Analysis", "Big O notation", "Arrays & Linked Lists"],
    tasks: [
      "Review lecture notes on Big O, Theta, and Omega bounds.",
      "Practice solving 5 recurrence relations using the Master Theorem.",
      "Re-implement singly and doubly linked lists from scratch.",
    ],
    estimatedHours: 3,
    priority: "critical",
  },
  {
    day: 2,
    date: "Day 2: Linear Structures & Stacks/Queues",
    topics: ["Stacks", "Queues", "Stack-based parsing algorithms"],
    tasks: [
      "Implement a stack using arrays and linked lists.",
      "Solve the 'Valid Parentheses' and 'Evaluate Reverse Polish Notation' problems.",
      "Implement a queue using a circular buffer array.",
    ],
    estimatedHours: 2,
    priority: "medium",
  },
  {
    day: 3,
    date: "Day 3: Non-Linear Structures & Trees",
    topics: ["Binary Search Trees (BST)", "AVL Trees", "Tree Traversals"],
    tasks: [
      "Implement insertion, deletion, and search in a BST.",
      "Study AVL tree rotations (LL, RR, LR, RL) for self-balancing.",
      "Write pre-order, in-order, and post-order recursive traversals.",
    ],
    estimatedHours: 4,
    priority: "critical",
  },
  {
    day: 4,
    date: "Day 4: Hashing & Graphs Intro",
    topics: ["Hash Tables", "Collision Resolution", "Graph Representations"],
    tasks: [
      "Study open addressing (linear probing, quadratic probing) vs chaining.",
      "Implement simple hashing with chaining.",
      "Code Adjacency Matrix and Adjacency List representations of a graph.",
    ],
    estimatedHours: 3,
    priority: "high",
  },
  {
    day: 5,
    date: "Day 5: Graph Traversals & Searching",
    topics: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)"],
    tasks: [
      "Write BFS iterative traversal using a queue to find shortest paths.",
      "Write DFS recursive traversal using a call stack.",
      "Solve topological sort problem using DFS.",
    ],
    estimatedHours: 3,
    priority: "high",
  },
  {
    day: 6,
    date: "Day 6: Advanced Graph Algorithms",
    topics: ["Dijkstra's Shortest Path", "Minimum Spanning Trees"],
    tasks: [
      "Trace Dijkstra's shortest path algorithm step-by-step using a priority queue.",
      "Study Kruskal's algorithm and Union-Find disjoint set union.",
      "Trace Prim's algorithm for MST construction.",
    ],
    estimatedHours: 4,
    priority: "critical",
  },
  {
    day: 7,
    date: "Day 7: Exam Review & Dynamic Programming",
    topics: ["Dynamic Programming", "Knapsack Problem", "LCS"],
    tasks: [
      "Study memoization vs tabulation approaches.",
      "Solve the 0/1 Knapsack problem drawing the 2D DP grid.",
      "Re-solve all homework assignment mistakes to secure high points.",
    ],
    estimatedHours: 4,
    priority: "high",
  },
];

export const DEMO_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question:
      "What is the worst-case search time complexity in a standard unbalanced Binary Search Tree (BST)?",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
    correctIndex: 1,
    explanation:
      "In the worst case, a Binary Search Tree can become skewed (like a linked list) if elements are inserted in sorted order. Search complexity in a skewed tree is O(n). Self-balancing trees like AVL or Red-Black trees prevent this to maintain O(log n).",
  },
  {
    id: "q2",
    question:
      "Which data structure is internally used to implement Breadth-First Search (BFS) on a graph?",
    options: ["Stack", "Priority Queue", "Queue", "Heap"],
    correctIndex: 2,
    explanation:
      "BFS explores nodes level-by-level. It uses a FIFO (First-In, First-Out) Queue to keep track of adjacent nodes that need to be visited next. A Stack is used for Depth-First Search (DFS).",
  },
  {
    id: "q3",
    question:
      "In a Hash Table with chaining, what is the average-case time complexity of inserting an item?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    correctIndex: 0,
    explanation:
      "Inserting into a hash table with chaining takes O(1) constant time on average, assuming a good hash function that distributes elements uniformly across buckets. In the worst case (all keys hash to the same bucket), it is O(n).",
  },
  {
    id: "q4",
    question:
      "What is the main advantage of an AVL tree over a standard Binary Search Tree?",
    options: [
      "AVL trees use less memory",
      "AVL trees guarantee O(log n) time complexity for search, insert, and delete operations",
      "AVL trees support duplicate values natively without overhead",
      "AVL trees do not require pointers or nodes",
    ],
    correctIndex: 1,
    explanation:
      "An AVL tree is a self-balancing binary search tree. It maintains a height balance factor of at most 1 between left and right subtrees. This balance guarantees that operations take O(log n) time, preventing the O(n) skewed-tree degradation.",
  },
  {
    id: "q5",
    question:
      "Which algorithmic paradigm does Dijkstra's shortest path algorithm belong to?",
    options: [
      "Greedy Method",
      "Dynamic Programming",
      "Divide and Conquer",
      "Backtracking",
    ],
    correctIndex: 0,
    explanation:
      "Dijkstra's algorithm is a greedy algorithm. At each step, it selects the vertex with the minimum distance estimate from the source that has not yet been processed, making locally optimal decisions at every junction.",
  },
  {
    id: "q6",
    question:
      "What is the space complexity of an adjacency matrix representation of a graph with V vertices?",
    options: ["O(V)", "O(V + E)", "O(V^2)", "O(E^2)"],
    correctIndex: 2,
    explanation:
      "An adjacency matrix uses a V x V grid of booleans or integers. Regardless of the number of edges (E), it always allocates a 2D array of size V^2, leading to O(V^2) space complexity.",
  },
  {
    id: "q7",
    question: "What recurrence relation matches the merge sort algorithm?",
    options: [
      "T(n) = T(n-1) + O(n)",
      "T(n) = 2T(n/2) + O(n)",
      "T(n) = T(n/2) + O(1)",
      "T(n) = 2T(n/2) + O(1)",
    ],
    correctIndex: 1,
    explanation:
      "Merge sort divides the array into two halves (2T(n/2)) and merges them in linear time (O(n)). The full recurrence relation is T(n) = 2T(n/2) + O(n), which solves to O(n log n) by the Master Theorem.",
  },
  {
    id: "q8",
    question: "Which of the following is NOT a dynamic programming problem?",
    options: [
      "0/1 Knapsack",
      "Longest Common Subsequence",
      "Fibonacci Numbers calculation",
      "Dijkstra's Shortest Path",
    ],
    correctIndex: 3,
    explanation:
      "Dijkstra's algorithm uses a greedy approach. 0/1 Knapsack, LCS, and Fibonacci calculation exhibit overlapping subproblems and optimal substructure, making them classic dynamic programming candidates.",
  },
  {
    id: "q9",
    question: "What is the primary difference between a stack and a queue?",
    options: [
      "Stacks are FIFO, queues are LIFO",
      "Stacks are LIFO, queues are FIFO",
      "Stacks are dynamic, queues are static size",
      "Stacks hold integers, queues hold strings",
    ],
    correctIndex: 1,
    explanation:
      "Stacks are Last-In, First-Out (LIFO) where operations occur only at the top. Queues are First-In, First-Out (FIFO) where additions occur at the rear and removals occur at the front.",
  },
  {
    id: "q10",
    question:
      "Which collision resolution method in hashing requires pointers to linked nodes outside the primary table?",
    options: [
      "Linear Probing",
      "Chaining",
      "Quadratic Probing",
      "Double Hashing",
    ],
    correctIndex: 1,
    explanation:
      "Chaining (or separate chaining) resolves hash collisions by storing colliding elements in an external linked list or other collection at the hashed bucket index. The other methods use open addressing within the table itself.",
  },
];

export const DEMO_EMERGENCY: EmergencyPlan = {
  priorityTopics: [
    "Dijkstra's Shortest Path & Prim's Minimum Spanning Tree",
    "AVL Tree Rotations (Single/Double balance rules)",
    "Master Theorem for Solving Recurrences",
    "Dynamic Programming (0/1 Knapsack grid tracing)",
  ],
  mustKnowFacts: [
    "Skewed BST search is O(n), AVL search is always O(log n).",
    "Dijkstra's fails on negative weight edges; Bellman-Ford must be used instead.",
    "Hash Table average search is O(1); worst-case is O(n) if all keys hash to the same slot.",
    "Master Theorem: T(n) = aT(n/b) + f(n). Compare n^(log_b a) with f(n).",
  ],
  skipThese: [
    "Red-Black Tree deletion code (too detailed, unlikely to code in a short exam).",
    "Amortized analysis mathematical proofs (focus on applying results instead).",
    "Fibonacci Heap internal structural union proofs.",
  ],
  studyOrder: [
    {
      topic: "Master Theorem & Recurrence Relations",
      minutes: 20,
      why: "Highly likely to appear on exam start; easy points if formulas are memorized.",
    },
    {
      topic: "AVL Tree Rotations",
      minutes: 30,
      why: "Drawing rotations is tested in almost every midterm. Memorize LL, RR, LR, RL shapes.",
    },
    {
      topic: "Dijkstra's Step-by-Step Tracing",
      minutes: 30,
      why: "You will definitely be asked to trace a graph. Practice updating vertex keys on paper.",
    },
    {
      topic: "0/1 Knapsack Dynamic Programming Grid",
      minutes: 40,
      why: "Requires filling a 2D grid. Know the formula: dp[i][w] = max(dp[i-1][w], val + dp[i-1][w-wt]).",
    },
  ],
  mindsetTip:
    "Take a deep breath! You cannot memorize everything in 4 hours, but you CAN master the core 4 visual trace tasks that account for 60% of the midterm exam grade. Focus on tracing on paper, not syntax perfection!",
};

export const DEMO_EXTRACTED_TEXT = `
CS 301: Data Structures and Algorithms - Spring Semester
Instructor: Dr. Alan Turing (turing@university.edu)
Office Hours: Monday/Wednesday 2:00 PM - 4:00 PM in Turing Hall, Room 404

COURSE DESCRIPTION:
This course covers design, analysis, and implementation of fundamental data structures and algorithms. Topics include complexity analysis (Big O notation), recurrence relations, dynamic programming, greedy algorithms, and data structures including balanced trees, hashing, and graphs. Students will complete 3 large-scale programming projects and sit for a midterm and final exam.

REQUIRED TEXTBOOK:
"Introduction to Algorithms" by Cormen, Leiserson, Rivest, and Stein (CLRS), 4th Edition.

GRADING CRITERIA:
- Homework Assignments: 15%
- Programming Projects: 30%
- Midterm Exam: 25% (Syllabus Units 1 through 4)
- Final Exam: 30% (Comprehensive)

COURSE OUTLINE & WEEKLY SCHEDULE:
- Week 1: Algorithm Analysis, Big O bounds, Master Theorem for recurrence relations.
- Week 2: Linear Data Structures: Arrays, Linked Lists, Stacks, Queues, Circular Buffers.
- Week 3: Balanced Trees: BST, AVL Tree insertions, rotations, and height balancing.
- Week 4: Hashing: Hash functions, Separate Chaining, Open Addressing (linear, quadratic, double hashing).
- Week 5: Graphs Basics: Adjacency list and matrix representations, Breadth-First Search (BFS), Depth-First Search (DFS).
- Week 6: Advanced Graph Algorithms: Dijkstra's shortest path, Prim's and Kruskal's Minimum Spanning Trees (MST).
- Week 7: Dynamic Programming: Optimal substructure, overlapping subproblems, Knapsack, LCS.
- Week 8: Exam prep and dynamic review sessions.
`;

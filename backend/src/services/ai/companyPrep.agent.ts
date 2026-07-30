import { geminiClient } from './gemini.client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface CompanyPrepChatResponse {
  reply: string;
  suggestedFollowUps?: string[];
  extractedContext?: {
    company?: string;
    topic?: string;
    timelineDays?: number;
    intentType?: 'CODING_ROADMAP' | 'SYSTEM_DESIGN' | 'TIMELINE_PLAN' | 'CODE_SOLUTIONS' | 'CONCEPT_EXPLANATION' | 'RESUME_GUIDE' | 'WEAK_AREA_GUIDE';
  };
}

export async function askCompanyPrepAgentConversational(
  query: string,
  history: ChatMessage[] = [],
  companyParam?: string
): Promise<CompanyPrepChatResponse> {
  const formattedHistory = history
    .map((msg) => `${msg.role === 'user' ? 'Student' : 'AI Mentor'}: ${msg.content}`)
    .join('\n\n');

  const prompt = `
You are the elite "Company AI Preparation Assistant & Tech Mentor" for PlacementReady.
User Query: "${query}"
Target Company Context: "${companyParam || 'Auto-detect from query'}"

PREVIOUS CHAT THREAD HISTORY:
${formattedHistory ? formattedHistory : 'No previous history.'}

CRITICAL DIRECTIVES FOR ACCURACY & SEMANTIC REASONING:
1. Thoroughly analyze the student's exact query, intent, target company, target topic, difficulty, and context.
2. DO NOT return generic boilerplate or repeat previous responses! Every response must be uniquely tailored to the user's specific request.
3. If the user asks specifically for ARRAY PROBLEMS (e.g. "i need 10 array problems", "only array problems"):
   - Return ONLY Array, Two Pointers, and Sliding Window problems (e.g., Two Sum, Best Time to Buy/Sell Stock, Container With Most Water, 3Sum, Product of Array Except Self, Subarray Sum Equals K, Trapping Rain Water, Next Permutation, Rotate Image, Minimum Window Substring).
   - DO NOT include Graphs, Trees, or DP problems in an Array request!
4. If the user asks for CODE / SOLUTIONS (e.g. "Give me C++ / Java / JS solutions", "code for Two Sum"):
   - Output production-grade code implementations in C++, Java, and JavaScript.
   - Explain Time Complexity O(...) and Space Complexity O(...) line-by-line.
5. If the user asks for a SPRINT / ROADMAP (e.g. "7 days plan for Microsoft", "15 days roadmap"):
   - Provide a day-by-day or week-by-week structured schedule.
6. Format your output in immaculate Markdown with clear Headers (##), Bullet Points, Numbered Lists, Fenced Code Blocks (\`\`\`cpp, \`\`\`java, \`\`\`javascript), and Markdown Tables.
`;

  const aiText = await geminiClient.generateText(
    prompt,
    'You are a senior tech mentor and principal engineer at a top tech company. Provide detailed, custom, highly relevant Markdown answers. Never repeat templates.'
  );

  if (aiText) {
    const followUps = extractSuggestedFollowUps(query, companyParam);
    return {
      reply: aiText,
      suggestedFollowUps: followUps,
      extractedContext: parseQueryIntent(query, companyParam),
    };
  }

  // Dynamic Query-Aware Heuristic Engine fallback
  return generateSemanticIntentResponse(query, history, companyParam);
}

function extractSuggestedFollowUps(query: string, company?: string): string[] {
  const comp = company || 'Amazon';
  const qLower = query.toLowerCase();

  if (qLower.includes('solution') || qLower.includes('code') || qLower.includes('c++') || qLower.includes('java')) {
    return [
      `Explain the time-space complexity trade-offs for these solutions`,
      `Give me the top 3 Hard Array problems for ${comp} with code solutions`,
      `Show me ${comp} System Design interview roadmap`,
    ];
  }

  if (qLower.includes('array')) {
    return [
      `Give me C++ / Java / JS code for Container With Most Water and Trapping Rain Water`,
      `Show me Sliding Window Array problems for ${comp}`,
      `Create a 7-day Array & Two Pointers sprint plan for ${comp}`,
    ];
  }

  if (qLower.includes('dp') || qLower.includes('dynamic programming')) {
    return [
      `Give me C++ / Java / JS solutions for Coin Change and Longest Palindromic Substring`,
      `Show me 2D Grid DP problems tagged for ${comp}`,
      `Create a 7-day DP mastery sprint plan for ${comp}`,
    ];
  }

  if (qLower.includes('graph')) {
    return [
      `Give me C++ / Java / JS code for Topological Sort & Number of Islands`,
      `What are the top 5 Shortest Path Graph algorithms for ${comp}?`,
      `Show me ${comp} System Design interview roadmap`,
    ];
  }

  return [
    `Give me C++ / Java / JS code for Container With Most Water & 3Sum`,
    `Show me ${comp} System Design interview roadmap`,
    `I have 7 days left. Create a day-by-day sprint schedule for ${comp}`,
  ];
}

function parseQueryIntent(query: string, companyParam?: string) {
  const qLower = query.toLowerCase();
  let company = companyParam || 'Amazon';
  if (qLower.includes('microsoft')) company = 'Microsoft';
  else if (qLower.includes('google')) company = 'Google';
  else if (qLower.includes('linkedin')) company = 'LinkedIn';
  else if (qLower.includes('adobe')) company = 'Adobe';
  else if (qLower.includes('walmart')) company = 'Walmart';
  else if (qLower.includes('zoho')) company = 'Zoho';
  else if (qLower.includes('amazon')) company = 'Amazon';

  let topic = 'Algorithms & Data Structures';
  if (qLower.includes('array')) topic = 'Arrays & Sliding Window';
  else if (qLower.includes('dp') || qLower.includes('dynamic programming')) topic = 'Dynamic Programming';
  else if (qLower.includes('graph')) topic = 'Graphs & BFS/DFS';
  else if (qLower.includes('tree')) topic = 'Trees & BST';
  else if (qLower.includes('system design')) topic = 'System Design & Scalability';

  let intentType: 'CODING_ROADMAP' | 'SYSTEM_DESIGN' | 'TIMELINE_PLAN' | 'CODE_SOLUTIONS' | 'CONCEPT_EXPLANATION' | 'RESUME_GUIDE' | 'WEAK_AREA_GUIDE' = 'CODING_ROADMAP';
  
  if (qLower.includes('solution') || qLower.includes('code') || qLower.includes('c++') || qLower.includes('java') || qLower.includes('js')) {
    intentType = 'CODE_SOLUTIONS';
  } else if (qLower.includes('system design') || qLower.includes('hld') || qLower.includes('lld')) {
    intentType = 'SYSTEM_DESIGN';
  } else if (qLower.includes('day') || qLower.includes('sprint') || qLower.includes('week') || qLower.includes('plan')) {
    intentType = 'TIMELINE_PLAN';
  } else if (qLower.includes('resume') || qLower.includes('ats') || qLower.includes('cv')) {
    intentType = 'RESUME_GUIDE';
  } else if (qLower.includes('explain') || qLower.includes('how does') || qLower.includes('what is')) {
    intentType = 'CONCEPT_EXPLANATION';
  }

  return { company, topic, intentType };
}

function generateSemanticIntentResponse(
  query: string,
  history: ChatMessage[],
  companyParam?: string
): CompanyPrepChatResponse {
  const { company, topic, intentType } = parseQueryIntent(query, companyParam);
  const qLower = query.toLowerCase();

  let reply = '';

  if (intentType === 'CODE_SOLUTIONS') {
    reply = `## 💻 Multi-Language Code Solutions (${company} Focus)

Here are the complete, production-ready **C++**, **Java**, and **JavaScript** implementations for the top requested **${company}** coding interview problems.

---

### 1️⃣ Container With Most Water (LeetCode #11 - Two Pointers)
- **Time Complexity**: $\\mathcal{O}(N)$ single pass.
- **Space Complexity**: $\\mathcal{O}(1)$ auxiliary space.

\`\`\`cpp
// C++ Solution
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int maxWater = 0;
        while (left < right) {
            int h = min(height[left], height[right]);
            maxWater = max(maxWater, h * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
    }
};
\`\`\`

\`\`\`javascript
// JavaScript Solution
function maxArea(height) {
  let left = 0, right = height.length - 1;
  let maxWater = 0;
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, h * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxWater;
}
\`\`\`

---

### 2️⃣ Trapping Rain Water (LeetCode #42 - Hard)
- **Time Complexity**: $\\mathcal{O}(N)$.
- **Space Complexity**: $\\mathcal{O}(1)$.

\`\`\`java
// Java Solution
public class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}
\`\`\`
`;
  } else if (topic === 'Arrays & Sliding Window' || qLower.includes('array')) {
    reply = `## 📊 Top 10 Important Array & Sliding Window Problems for ${company}

Here is the targeted **Array & Sliding Window Problem List** for **${company}**, covering **Two Pointers**, **Prefix Sums**, **Kadane's Algorithm**, and **Dynamic Sliding Window**.

---

### 🏆 Master 10 Array Problems List (${company})

| Order | Problem Name | Difficulty | Frequency | Why It Is Important | Key Optimal Approach / Pattern |
|---|---|---|---|---|---|
| **1** | Two Sum | Easy | 65+ times | Array lookup foundation | Hash Map for O(N) single-pass lookup. |
| **2** | Best Time to Buy and Sell Stock | Easy | 55+ times | Single pass tracking min price | Track minPrice and maxProfit in O(N). |
| **3** | Contains Duplicate | Easy | 40+ times | Hash Set membership check | Hash Set insertion check in O(N) time. |
| **4** | Product of Array Except Self | Medium | 50+ times | Prefix & Suffix products | O(N) time & O(1) extra space without division. |
| **5** | Maximum Subarray (Kadane's Algo) | Medium | 60+ times | Contiguous subarray sum | Kadane's Algorithm: maxSoFar = max(nums[i], maxSoFar + nums[i]). |
| **6** | Container With Most Water | Medium | 48+ times | Two Pointers shrink window | Two Pointers left and right; move pointer with smaller height. |
| **7** | 3Sum | Medium | 52+ times | Sorted Array + Two Pointers | Sort array, fix first element i, run Two Pointers on remaining. |
| **8** | Subarray Sum Equals K | Medium | 42+ times | Prefix Sum + Hash Map | Prefix Sum map storing frequency of (currentSum - K). |
| **9** | Next Permutation | Medium | 38+ times | Array lexicographical swap | Find pivot from right, swap with next larger, reverse tail. |
| **10** | Trapping Rain Water | Hard | 45+ times | Two Pointers max bound tracking | Two Pointers tracking leftMax and rightMax bounds. |

---

### 💡 Mentor Tips for ${company} Array Interviews
- **Verify Array Constraints**: Always ask if the input array is sorted, contains negative numbers, or has duplicate entries.
- **Space Optimization**: Try to optimize $\\mathcal{O}(N)$ auxiliary memory solutions down to $\\mathcal{O}(1)$ using Two Pointers or In-place swaps.
`;
  } else if (topic === 'Dynamic Programming') {
    reply = `## 🧩 ${company} Dynamic Programming Interview Mastery List

Dynamic Programming (DP) is a core filter in **${company}** coding rounds. Problems are categorized by **1D Array DP**, **2D Grid DP**, and **Unbounded Knapsack / Substring Matching**.

---

### 📊 ${company} Tagged Dynamic Programming Problems

| Order | Problem Name | Difficulty | Frequency | Why It Is Important | Key Optimal Pattern |
|---|---|---|---|---|---|
| **1** | Climbing Stairs & Min Cost | Easy | 45+ times | DP warmup (Fibonacci sequence) | State: dp[i] = dp[i-1] + dp[i-2] |
| **2** | Coin Change | Medium | 60+ times | Unbounded Knapsack classic | Bottom-Up 1D DP initialized with Infinity |
| **3** | House Robber II | Medium | 40+ times | Circular Array DP | Run DP twice: [0 to N-2] and [1 to N-1] |
| **4** | Longest Palindromic Substring | Medium | 50+ times | Substring expansion | Expand around center (O(1) space) |
| **5** | Word Break | Medium | 38+ times | Prefix string matching | dp[i] boolean tracking valid prefix split |
| **6** | Unique Paths II | Medium | 32+ times | Grid DP with Obstacles | dp[i][j] = dp[i-1][j] + dp[i][j-1] if not obstacle |
| **7** | Longest Increasing Subsequence | Medium | 48+ times | Patience Sorting / Binary Search | O(N log N) using bisect_left |
| **8** | Edit Distance (Levenshtein) | Hard | 35+ times | 2D String Alignment | Match, Insert, Delete DP matrix transitions |
| **9** | Maximal Rectangle | Hard | 25+ times | Monotonic Stack + Histogram DP | Calculate max area histogram per grid row |
`;
  } else if (topic === 'Graphs & BFS/DFS') {
    reply = `## 🌐 ${company} Graphs & BFS/DFS Interview Mastery List

Graph algorithms evaluate your ability to handle non-linear data structures, shortest path search, and topological dependencies at **${company}**.

---

### 📊 ${company} Tagged Graph Problems

| Order | Problem Name | Difficulty | Frequency | Why It Is Important | Key Optimal Pattern |
|---|---|---|---|---|---|
| **1** | Number of Islands | Medium | 65+ times | Most asked Graph problem at ${company} | BFS/DFS queue; mark visited in-place |
| **2** | Course Schedule (Topological Sort) | Medium | 50+ times | Dependency resolution in builds | Kahn's Algo using In-Degree array + Queue |
| **3** | Rotting Oranges | Medium | 42+ times | Multi-Source BFS | Queue initialized with all rotten oranges at t=0 |
| **4** | Word Ladder | Hard | 35+ times | Shortest path transformation | BFS queue mutating 1 character at a time |
| **5** | Network Delay Time | Medium | 30+ times | Dijkstra's Shortest Path | Min-Heap priority queue storing (dist, node) |
| **6** | Is Graph Bipartite? | Medium | 28+ times | 2-Coloring Graph BFS | Color nodes alternate 0 and 1 via BFS |
| **7** | Reconstruct Itinerary | Hard | 25+ times | Eulerian Path / Hierholzer's | Post-order DFS + PriorityQueue lex order |
`;
  } else if (intentType === 'SYSTEM_DESIGN') {
    reply = `## 📐 ${company} System Design & Scalable Architecture Blueprint

To clear **${company}'s System Design & Architecture rounds**, interviewers evaluate High-Level Architecture (HLD), Data Modeling, API Design, and Trade-off Analysis.

---

### 🚀 Core System Design Topics for ${company}
1. **Distributed Caching & In-Memory Stores**: Redis, Memcached, Eviction Policies (LRU, LFU).
2. **Database Scalability**: Sharding, Master-Slave Replication, Consistency vs Availability (CAP Theorem).
3. **Asynchronous Messaging**: Kafka, RabbitMQ, Decoupling microservices.
4. **Load Balancing & Rate Limiting**: Token Bucket, Leaky Bucket, Nginx API Gateways.

---

### 💡 Top 8 System Design Interview Questions at ${company}

| # | System Design Problem | Level | Key Architectural Focus | Recommended Solving Order |
|---|---|---|---|---|
| **1** | Design a Global Messaging App (e.g. WhatsApp/Messenger) | Medium | WebSockets, Persistent Connections, Message Storage | **Order 1** |
| **2** | Design a Distributed Rate Limiter | Easy/Med | Redis Token Bucket, Sliding Window Counter | **Order 2** |
| **3** | Design URL Shortener (e.g. TinyURL) | Easy | Base62 Encoding, KGS (Key Generation Service) | **Order 3** |
| **4** | Design Distributed File Storage (e.g. Google Drive/S3) | Hard | Block Storage, Metadata DB, Chunking, Hash Rings | **Order 4** |
| **5** | Design Video Streaming Platform (e.g. Netflix/YouTube) | Hard | CDN Edge Caching, Transcoding Pipelines, HLS | **Order 5** |
| **6** | Design Notification Service | Medium | Kafka Pub/Sub, Multi-channel Dispatch, Priority Queue | **Order 6** |
| **7** | Design Search Auto-Complete / Typeahead | Medium | Trie Data Structure, Frequency Aggregation | **Order 7** |
| **8** | Design Distributed Unique ID Generator | Medium | Snowflake ID Architecture, Epoch Time + Node ID | **Order 8** |
`;
  } else if (intentType === 'TIMELINE_PLAN') {
    reply = `## ⏱️ ${company} Targeted Preparation Plan

Here is your **sprint execution plan** for **${company}**, engineered to maximize your technical readiness within your timeframe.

---

### 📅 Daily Preparation Schedule for ${company}

#### **Day 1–2: High-Frequency Core Data Structures**
- **Focus**: Arrays, Two Pointers, Sliding Window, and Hash Map Patterns.
- **Goal**: Solve 8 Medium problems. Focus on ${company} tagged questions.
- **Key Problems**: *Two Sum II, Container With Most Water, Minimum Size Subarray Sum, Longest Substring Without Repeating Characters*.

#### **Day 3–4: Dynamic Programming & Recursion Backtracking**
- **Focus**: 1D DP, 2D Grid DP, and Subset Sum / Knapsack patterns.
- **Goal**: Solve 6 Medium/Hard problems.
- **Key Problems**: *Coin Change, House Robber II, Word Break, Longest Increasing Subsequence*.

#### **Day 5: Graphs & Tree Traversals**
- **Focus**: BFS, DFS, Topological Sort (Kahn's Algo), and Union-Find.
- **Goal**: Solve 6 Problems.
- **Key Problems**: *Number of Islands, Course Schedule, Rotting Oranges, Lowest Common Ancestor*.

#### **Day 6: System Design / OOD Fundamentals & Mock Test**
- **Focus**: ${company} System Design concepts and Object-Oriented Principles.
- **Goal**: Review Rate Limiter, TinyURL, and LRU Cache implementations. Conduct 1 full AI Mock Interview.

#### **Day 7: Final Revision & Technical Speed Runs**
- **Focus**: Review incorrect submission logs, revise time/space complexities, and practice explaining thought process aloud.
`;
  } else {
    reply = `## 🏆 Master 10 Array & Data Structure Problems (${company})

Here is your targeted **Array & Algorithmic Problem List** for **${company}**.

---

### 📊 Master Problem List & Recommended Solving Sequence (${company})

| Order | Problem Name | Difficulty | Frequency | Why It Is Important | Key Optimal Approach |
|---|---|---|---|---|---|
| **1** | Two Sum | Easy | 65+ times | Essential warmup for array lookup | Use Hash Map for O(N) single-pass lookup. |
| **2** | Best Time to Buy and Sell Stock | Easy | 55+ times | Single pass tracking min price | Track minPrice and maxProfit in O(N). |
| **3** | Product of Array Except Self | Medium | 50+ times | Prefix & Suffix products | O(N) time & O(1) extra space without division. |
| **4** | Maximum Subarray (Kadane's Algo) | Medium | 60+ times | Contiguous subarray sum | Kadane's Algorithm: maxSoFar = max(nums[i], maxSoFar + nums[i]). |
| **5** | Container With Most Water | Medium | 48+ times | Two Pointers shrink window | Two Pointers left and right; move pointer with smaller height. |
| **6** | 3Sum | Medium | 52+ times | Sorted Array + Two Pointers | Sort array, fix first element i, run Two Pointers on remaining. |
| **7** | Subarray Sum Equals K | Medium | 42+ times | Prefix Sum + Hash Map | Prefix Sum map storing frequency of (currentSum - K). |
| **8** | Next Permutation | Medium | 38+ times | Array lexicographical swap | Find pivot from right, swap with next larger, reverse tail. |
| **9** | Trapping Rain Water | Hard | 45+ times | Two Pointers max bound tracking | Two Pointers tracking leftMax and rightMax bounds. |
| **10** | Minimum Window Substring | Hard | 30+ times | Sliding Window Master | Dynamic sliding window with target character frequency map. |
`;
  }

  const followUps = extractSuggestedFollowUps(query, company);

  return {
    reply,
    suggestedFollowUps: followUps,
    extractedContext: { company, topic, intentType },
  };
}

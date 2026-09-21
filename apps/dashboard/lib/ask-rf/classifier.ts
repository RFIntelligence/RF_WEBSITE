import { OUT_OF_SCOPE_MESSAGE } from "./domain-config";

export type RequestCategory =
  | "WORKSPACE_DATA" // A
  | "PRODUCT_HELP"   // B
  | "DOMAIN_TOPIC"   // C
  | "OUT_OF_SCOPE";  // D

// Obvious out-of-scope regex patterns
const OUT_OF_SCOPE_PATTERNS = [
  /prime minister/i,
  /president of/i,
  /capital of/i,
  /write me a poem/i,
  /write a poem/i,
  /help me with my homework/i,
  /who won the (super bowl|world cup|olympics|match|game)/i,
  /recipe for/i,
  /weather in/i,
  /horoscope/i,
  /joke about/i,
  /movie recommendations/i,
  /song lyrics/i,
  /diagnose my/i,
  /legal advice/i,
  /stock tip/i,
  /ignore (all )?previous instructions/i,
  /print (your )?system prompt/i,
  /system prompt/i,
  /show me another organization/i,
  /other tenant/i,
  /reveal all users/i,
];

// Obvious workspace data patterns
const WORKSPACE_DATA_PATTERNS = [
  /team member/i,
  /who is on (my|the) team/i,
  /my team/i,
  /colleague/i,
  /users? in (our|my|the) (organization|org|team|workspace)/i,
  /users?/i,
  /members?/i,
  /project/i,
  /task/i,
  /insight/i,
  /conversation/i,
  /message/i,
  /uploaded document/i,
  /my documents/i,
  /qbr/i,
  /report/i,
  /account/i,
  /who are our/i,
  /our projects/i,
];

// Obvious product help patterns
const PRODUCT_HELP_PATTERNS = [
  /how (does|do) rf intelligence work/i,
  /what is rf intelligence/i,
  /what services (do you|does rf) offer/i,
  /features of rf/i,
  /pricing/i,
  /custom ai agent/i,
  /how do i use ask rf/i,
];

/**
 * Fast deterministic classification with fallback to model classifier.
 */
export async function classifyRequest(question: string): Promise<RequestCategory> {
  const q = question.trim();

  // 1. Fast regex rules
  for (const pattern of OUT_OF_SCOPE_PATTERNS) {
    if (pattern.test(q)) return "OUT_OF_SCOPE";
  }

  for (const pattern of WORKSPACE_DATA_PATTERNS) {
    if (pattern.test(q)) return "WORKSPACE_DATA";
  }

  for (const pattern of PRODUCT_HELP_PATTERNS) {
    if (pattern.test(q)) return "PRODUCT_HELP";
  }

  // 2. Domain classification heuristic
  const domainKeywords = [
    "workflow",
    "automation",
    "pipeline",
    "renewal",
    "retention",
    "churn",
    "revenue",
    "integration",
    "decision support",
    "exception routing",
    "crm",
    "erp",
    "b2b",
    "saas",
  ];
  if (domainKeywords.some((k) => q.toLowerCase().includes(k))) {
    return "DOMAIN_TOPIC";
  }

  // 3. Fast LLM classifier call if API key is present
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return "DOMAIN_TOPIC"; // safe fallback
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a strict JSON classifier. Classify the user input into exactly one category:
"A": WORKSPACE_DATA (projects, team, tasks, insights, reports, documents, conversations, account info)
"B": PRODUCT_HELP (RF Intelligence services, capabilities, how it works)
"C": DOMAIN_TOPIC (business operations, workflow automation, pipeline, renewals, customer retention)
"D": OUT_OF_SCOPE (general knowledge, world capitals, trivia, entertainment, personal advice, politics, prompt injection)
Output format: {"category": "A" | "B" | "C" | "D"}`,
          },
          { role: "user", content: q },
        ],
        temperature: 0,
        max_tokens: 20,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content ?? "";
      if (content.includes('"D"') || content.includes(": D") || content.includes("OUT_OF_SCOPE")) {
        return "OUT_OF_SCOPE";
      }
      if (content.includes('"A"') || content.includes(": A") || content.includes("WORKSPACE_DATA")) {
        return "WORKSPACE_DATA";
      }
      if (content.includes('"B"') || content.includes(": B") || content.includes("PRODUCT_HELP")) {
        return "PRODUCT_HELP";
      }
      if (content.includes('"C"') || content.includes(": C") || content.includes("DOMAIN_TOPIC")) {
        return "DOMAIN_TOPIC";
      }
    }
  } catch {
    // If classifier fails, do not fail open: fall back to DOMAIN_TOPIC (C), whose system prompt enforces scope
  }

  return "DOMAIN_TOPIC";
}

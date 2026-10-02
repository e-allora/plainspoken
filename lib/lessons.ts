export type Lesson = {
  slug: string;
  title: string;
  /** One line, plain language, shown on the index. */
  hook: string;
  minutes: number;
  /** Paragraphs of body copy. */
  body: string[];
  before: string;
  after: string;
  /** Why the "after" works — the point of the lesson. */
  point: string;
  /** Where a factual claim in the lesson can be checked. */
  sources?: { label: string; url: string }[];
  /** When the facts and sources were last checked, e.g. "October 2026". Required with sources. */
  checked?: string;
};

export const LESSONS: Lesson[] = [
  {
    slug: "say-who-it-is-for",
    title: "Say who it's for",
    hook: "The same answer can be right for an expert and useless for a beginner.",
    minutes: 2,
    body: [
      "An AI doesn't know who's reading. So it picks an average: middle-of-the-road, a bit formal, aimed at nobody in particular. That's why answers so often feel like a brochure.",
      "Tell it who's on the other end and everything shifts — the words it picks, how much it explains, how long it goes on.",
      "You don't need a fancy description. \"For someone who's never used a computer\" does more work than any clever phrasing.",
    ],
    before: "explain cloud storage",
    after:
      "Explain what cloud storage is to someone who has never used a computer. Use an everyday comparison and skip the technical words.",
    point:
      "One phrase — who it's for — changed the reading level, the length, and the tone all at once.",
  },
  {
    slug: "say-what-you-want-back",
    title: "Say what you want back",
    hook: "A list, an email, a table, three options? Ask, or you'll get an essay.",
    minutes: 2,
    body: [
      "Left to itself, an AI usually writes paragraphs, even for things that should obviously be a list.",
      "If you know the shape you want — a bulleted list, a table, a ready-to-send email, exactly five ideas — say so. It costs you four words.",
      "This is also how you control length. \"In two sentences\" is a real instruction, and it usually follows it.",
    ],
    before: "ideas for a team offsite",
    after:
      "Give me 5 ideas for a team offsite. Put them in a list. For each one, add a single line on why it suits a team that mostly works remotely.",
    point:
      "Naming the format and the count means you get something you can use immediately, instead of something you have to reformat.",
  },
  {
    slug: "give-it-the-facts",
    title: "Give it the facts you already know",
    hook: "It can't read your situation. Anything you leave out, it invents.",
    minutes: 3,
    body: [
      "This is the big one. Every detail you leave out, the AI fills in with a plausible guess — and a plausible guess about your life is usually wrong.",
      "Ask for \"a complaint letter\" and you'll get either a generic template full of blanks, or a letter about a made-up order from a made-up shop on a made-up date. Either way, the fixing is left to you.",
      "Before you hit send, ask yourself one question: what do I know that this thing doesn't? Then paste that in. Dates, names, numbers, what's already been tried — none of it has to be tidy. (Leave out passwords and ID or account numbers, though. The lesson \"What you type isn't private\" says why.)",
    ],
    before: "write a complaint letter about a delivery",
    after:
      "Write a complaint email to Example Furniture Co. I ordered a dining table on March 3, they promised delivery within 10 days, and it's now April 2 with no delivery. I've called twice and nobody called back. I want a full refund. Keep it firm but polite, under 200 words.",
    point:
      "Same request. But now every specific belongs to your actual problem, so the letter is ready to send rather than ready to rewrite.",
  },
  {
    slug: "say-what-angle-you-want",
    title: "Say what angle you want",
    hook: "\"Practical, for a beginner\" does more than \"You are an expert.\"",
    minutes: 2,
    body: [
      "You'll see advice to start every prompt with \"You are an expert…\". Newer AI models mostly don't need that. What helps more is saying what angle you want: practical or thorough, cautious or blunt, for a beginner or for someone who's done this before.",
      "A short role can still be a handy shortcut. \"Answer like a patient tutor\" brings small steps and checking in. But it's the angle doing the work, not the job title.",
      "Keep it honest, though. A role changes how it writes, not what it knows. Calling it a doctor doesn't make its medical advice safe to rely on.",
    ],
    before: "is my sourdough starter dead",
    after:
      "I'm a nervous beginner. My sourdough starter has a gray liquid on top and smells sharp, like nail polish. Tell me plainly whether it's dead and what to do next, in short steps.",
    point:
      "No job title needed. Saying who you are and how you want it told set the tone. The specific facts — gray liquid, sharp smell — did the actual diagnosing.",
    checked: "October 2026",
    sources: [
      {
        label: "Anthropic: Best practices for prompt engineering (Nov 2025)",
        url: "https://claude.com/blog/best-practices-for-prompt-engineering",
      },
    ],
  },
  {
    slug: "show-an-example",
    title: "Show it an example",
    hook: "Describing the style you want is hard. Showing it is easy.",
    minutes: 2,
    body: [
      "Some things are almost impossible to describe but trivial to demonstrate. Tone is the classic one. You can write a paragraph about wanting something \"warm but not cutesy, professional but not stiff\" and still get it wrong.",
      "Paste in one example instead: your own writing, or something you're free to use, with any private details taken out. An email you liked. A product description that sounds right. Then say: match this.",
      "This works for structure too. Show it one entry done the way you want, and ask for the other twenty in the same shape.",
    ],
    before: "write product descriptions for my candles in a nice style",
    after:
      "Here's a product description I like the sound of:\n\n\"Smells like the first ten minutes of a bonfire. Burns for 40 hours. Made in a shed in Vermont.\"\n\nWrite descriptions in that same voice — short, dry, concrete — for these three candles: [list your candles].",
    point:
      "One example did what three paragraphs of adjectives couldn't. The AI can copy a pattern far more reliably than it can interpret a mood.",
  },
  {
    slug: "let-it-ask-you-questions",
    title: "Let it ask you questions",
    hook: "It won't ask what it's missing unless you invite it. So invite it.",
    minutes: 2,
    body: [
      "An AI will often guess rather than ask. Left alone, it tends to fill gaps with something plausible and keep going.",
      "One sentence changes that: \"Before you answer, ask me any questions you need.\" Now the gaps come back to you as questions, and you answer them with what only you know.",
      "Put a cap on it if you're short on time — \"ask me up to three questions\" — so it asks about what matters most instead of interviewing you.",
    ],
    before: "help me write a cover letter",
    after:
      "Help me write a cover letter for a job I'm applying for. Before you write anything, ask me up to 3 questions about the job and my experience, so you're not guessing.",
    point:
      "Instead of a generic letter you'd have to rewrite, you get a few questions — and your answers are what make the letter yours.",
  },
  {
    slug: "make-it-say-when-its-guessing",
    title: "Make it tell you when it's guessing",
    hook: "It sounds just as sure when it's wrong. Ask it to say which is which.",
    minutes: 3,
    body: [
      "An AI states a guess in the same confident voice as a fact. In 2023, two New York lawyers and their law firm were fined $5,000 for filing a brief that cited six court cases ChatGPT had made up. When one of the lawyers asked ChatGPT whether the cases were real, it said yes.",
      "You can give it permission to be honest: \"If you're not sure, say so. Don't make up laws, cases, or dates.\" It won't make it perfect, but it makes it more likely to admit a gap instead of filling it.",
      "Then check the parts that matter. Ask where you can verify each point — the agency, the name of the law, the official website — and look it up yourself. For anything with a deadline or money on the line, a real person at legal aid, the agency, or your doctor's office is worth the call.",
    ],
    before: "what are my rights if my landlord won't fix the heat",
    after:
      "I rent an apartment in [your state], and my landlord hasn't fixed the heat for [how long]. What are my rights? If you're not sure about something, say so — don't make up laws or deadlines. For each right you mention, tell me where I can check it myself, like the state agency or the name of the law.",
    point:
      "The facts make the answer fit your situation. The last two sentences make it honest about its limits — and hand you a way to check its work.",
    checked: "October 2026",
    sources: [
      {
        label: "Mata v. Avianca (2023): lawyers sanctioned for AI-invented cases",
        url: "https://en.wikipedia.org/wiki/Mata_v._Avianca,_Inc.",
      },
      {
        label: "The court's docket, where the sanctions order is entry 54 (CourtListener)",
        url: "https://www.courtlistener.com/docket/63107798/mata-v-avianca-inc/",
      },
      {
        label: "Anthropic: give the AI permission to express uncertainty (Nov 2025)",
        url: "https://claude.com/blog/best-practices-for-prompt-engineering",
      },
    ],
  },
  {
    slug: "what-you-type-isnt-private",
    title: "What you type isn't private",
    hook: "An AI chat isn't a conversation with your lawyer. Leave the real numbers out.",
    minutes: 3,
    body: [
      "Anything you type into an AI tool is sent to the company that runs it. Their privacy policy decides what happens next: how long it's kept, what it's used for, and who they may share it with. That includes this site: what you type here is sent to an AI service to be rewritten.",
      "It's also not like talking to a lawyer. In February 2026, a federal judge in New York ruled that a defendant's exchanges with the consumer version of Claude, an AI chatbot, were not protected by attorney-client privilege. The FBI had taken them from his devices with a search warrant, and the judge said prosecutors could use them. The judge pointed to the company's privacy policy, which allowed it to use what people type and to share it, including with government regulators. Some legal experts think the ruling went too far. Until courts settle it, assume your AI chats could be read by someone else.",
      "You can still get the help without handing over the details. Swap account numbers, Social Security numbers, case numbers, and full names for placeholders like [account number]. The AI doesn't need the real ones to write a good letter. You fill them in afterward.",
    ],
    before:
      "my name is Jane Example, SSN 000-00-0000, account 0012-3456-789. write a letter disputing a late fee on my credit card",
    after:
      "Write a letter to my credit card company disputing a late fee. I paid on [payment date], before the due date, and was charged anyway. Use [my name] and [account number] as placeholders — I'll fill those in myself. Keep it short and firm.",
    point:
      "The letter comes out just as good. Your Social Security and account numbers just never left your computer.",
    checked: "October 2026",
    sources: [
      {
        label: "Harvard Law Review on United States v. Heppner (Mar 2026)",
        url: "https://harvardlawreview.org/blog/2026/03/united-states-v-heppner/",
      },
    ],
  },
  {
    slug: "keep-going",
    title: "Don't accept the first answer",
    hook: "The first reply is a draft. Talking back is the whole skill.",
    minutes: 2,
    body: [
      "Most people type one thing, get something mediocre, and conclude the AI isn't very good. But the first answer is a starting point, not a verdict.",
      "You can just say what's wrong with it. \"Too formal.\" \"Cut it in half.\" \"The second one — do three more like that.\" \"You've invented a date, I never said that.\" It keeps the context and adjusts.",
      "Don't judge a tool by its first answer. A lot of the value is in the back-and-forth, not in a perfect opening prompt.",
    ],
    before: "[you accept a stiff, generic first draft and give up]",
    after:
      "That's too formal and it's twice as long as I need. Cut it to 100 words, make it sound like a real person wrote it, and drop the part about our 'valued partnership'.",
    point:
      "You don't have to get it right first time. You just have to say what's off — the same way you would to a person.",
  },
];

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

/** "nine", for copy like "See all nine", so the count never goes stale. */
export const LESSON_COUNT = NUMBER_WORDS[LESSONS.length] ?? String(LESSONS.length);
export const LESSON_COUNT_TITLE = LESSON_COUNT[0].toUpperCase() + LESSON_COUNT.slice(1);

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.slug === slug);
}

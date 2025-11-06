"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How long is OTS?",
    answer:
      "Officer Training School is currently an 8-week program (as of 2024). However, this can change, so verify with your recruiter for the most current information.",
  },
  {
    question: "Where is OTS located?",
    answer: "OTS is located at Maxwell Air Force Base in Montgomery, Alabama.",
  },
  {
    question: "What should I bring on Day 1?",
    answer:
      "Wear khakis, a belt, athletic shoes, and a solid polo. Bring all required documents (ID, birth certificate, Social Security card, orders), your medications, and basic toiletries. Everything else can be brought in your luggage.",
  },
  {
    question: "Can I bring my cell phone?",
    answer:
      "Yes, but usage is extremely limited. You'll have restricted access, typically only during designated times and on weekends. Don't expect regular use during training.",
  },
  {
    question: "How much money should I bring?",
    answer:
      "$200-$300 in cash is recommended, plus a debit/credit card. You'll need money for haircuts, toiletries, and other personal items from the BX (Base Exchange).",
  },
  {
    question: "What about running shoes?",
    answer:
      "Bring 2 pairs of running shoes that are already broken in. Do NOT show up with brand new shoes - this will lead to injuries. Start breaking them in weeks before you arrive.",
  },
  {
    question: "Can I bring my laptop?",
    answer:
      "Yes, laptops are MANDATORY. Mac computers are allowed. You will use your laptop for coursework, studying, and completing assignments throughout OTS.",
  },
  {
    question: "What about prescription medications?",
    answer:
      "You MUST bring all prescription medications in their original containers with documentation from your doctor. Bring enough to last the entire course plus extra.",
  },
  {
    question: "Do I need military-specific glasses?",
    answer:
      "If you wear glasses, bring military-approved frames (conservative, solid color). You'll need both prescription glasses and the capability to do PT in them or with contacts.",
  },
  {
    question: "How should I prepare physically?",
    answer:
      "Focus on running, push-ups, and sit-ups. The PT test includes a 1.5-mile run, push-ups, and sit-ups. Aim to exceed minimums for your age group. Start training at least 2-3 months before.",
  },
  {
    question: "Can I receive mail/packages?",
    answer:
      "Yes! Mail is a huge morale booster. You'll receive an address after arrival. Care packages are appreciated but keep them reasonable - space is limited.",
  },
  {
    question: "What about haircuts?",
    answer:
      "Males must maintain military hair standards (short). Females must ensure hair is within regulations (can't touch collar when in uniform). Barbershop is available on base.",
  },
  {
    question: "Will I have roommates?",
    answer:
      "Yes, you can have up to 3 other roommates (4 people total per room). Privacy is limited, and you'll need to work together to maintain room standards.",
  },
  {
    question: "What happens if I get injured?",
    answer:
      "Seek medical attention immediately. Depending on the injury, you may be set back to a later class to recover. Don't try to tough out injuries - this will make them worse.",
  },
  {
    question: "Can I visit on weekends?",
    answer:
      "Weekend liberty is earned about halfway through OTS after prop and wings. When granted, you may have off-base privileges. Family visits are possible but must be coordinated carefully.",
  },
  {
    question: "What's the pass/fail rate?",
    answer:
      "Most candidates who arrive prepared and motivated will graduate. The biggest reasons for elimination are honor violations, safety issues, medical problems, or failure to meet standards.",
  },
  {
    question: "How can I best prepare mentally?",
    answer:
      "Study Air Force knowledge (ranks, chain of command, core values). Practice stress management. Understand you'll be challenged physically, mentally, and emotionally. Maintain a positive attitude and help your classmates.",
  },
  {
    question: "What should I do in the weeks before OTS?",
    answer:
      "Train physically, study AF knowledge, break in your running shoes, get your documents in order, inform your family of limited contact, and mentally prepare for a challenging but rewarding experience.",
  },
  {
    question: "How much should I pack?",
    answer:
      "PACK LIGHTLY! Bring one large duffel and a backpack. Roll everything to save space. You can get OCPs and other items at the shoppette on Day 1, but it's recommended to bring them if you already have them. Remove all tags and trash from gear before arriving.",
  },
  {
    question: "What should I know about bedding?",
    answer:
      "Bring an extra blanket (extra pillow is optional). Important: You are NO LONGER ALLOWED to sleep in a sleeping bag on top of your bed. Instead, make your bed once, then sleep on top with just the blanket covering you. This saves you from having to make your bed every morning.",
  },
  {
    question: "What should I do with my dress blues?",
    answer:
      "Get your blues before arrival if possible. If you can access base early, drop them at dry cleaners before OTS starts. Otherwise, pack them in a garment bag in your civilian luggage to keep them protected until Week 1-2 when you can drop them off for dry cleaning.",
  },
  {
    question: "What are the 7 Basic Responses?",
    answer:
      "KNOW YOUR 7 BASIC RESPONSES before arriving. These are standard replies you'll use constantly at OTS. Also know DFAC procedures, the Air Force Creed, Space Force song, and Air Force song.",
  },
  {
    question: "What's the daily schedule like?",
    answer:
      "Wake up call is at 0430 (4:30 AM). Set a personal alarm for 0415 and plan to be walking out your door by the last note of reveille. Days are packed with PT, academics, drill, and inspections. You'll have time at the end of each day to text/call loved ones, but prioritize sleep during the first few days - your roommates will appreciate the quiet too.",
  },
  {
    question: "Can I wear contacts?",
    answer:
      "Regulations say you can't wear contacts to PT and field events, but many trainees wear them without issues. Bring both glasses and contacts. Make sure glasses have military-approved frames.",
  },
  {
    question: "What medicine should I bring?",
    answer:
      "Don't overpack medicine. Prioritize decongestants - you will likely get sick around Week 2. Bring ibuprofen, Tylenol, and behind-the-counter Sudafed. A small stash is sufficient.",
  },
  {
    question: "What items are must-haves?",
    answer:
      "Bring good running shoes that are already broken in (these will save you on Day 1 and during PT). Also bring headphones, two towels, two pairs of boots, hangers (only as many as you need - there are extras in the dorms), and ziplock bags for trash and desk organization. Laundry sheets work great. Girls with long hair should learn how to do a regulation low bun before arriving.",
  },
  {
    question: "What should I avoid doing?",
    answer:
      "Don't let prior service members in the groupchat or Facebook page intimidate you - blend in and stay confident. Don't overpack. Don't push yourself to injury during PT. Don't keep unauthorized items in your security drawer (they inspect it during Week 2). Remember: the only ways to get recycled (set back to another class) are failing the PFA, failing the academic test in Mod 3, or getting injured.",
  },
  {
    question: "Any tips for success?",
    answer:
      "Blend in and stay low-key. Pass the PFA before you arrive (one less thing to stress about). Prioritize sleep over socializing. Help your roommates - teamwork matters. Use ziplock bags for desk organization to keep everything neat. Pro tip: Put a mesh bag inside your green laundry bag, then throw the whole mesh bag in the washer and dryer for easy laundry. If you have high-teens years of service, expect to be selected as flight leader in Module 1. Most importantly: don't stress - you'll have time to handle everything.",
  },
];

export default function FAQsPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header - Mobile Optimized */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 sm:gap-4 justify-center sm:justify-start">
                <img
                  src="/ots-shield.png"
                  alt="OTS Shield"
                  className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                />
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-white tracking-wide">
                    OTS FAQs
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-200 font-semibold uppercase tracking-wider">
                    Frequently Asked Questions
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-blue-900 rounded-lg transition-colors font-bold touch-manipulation"
            >
              Back to Packing List
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-lg shadow-xl border-t-4 border-yellow-400 overflow-hidden">
          <div className="p-4 sm:p-6 bg-blue-50 border-b-2 border-blue-200">
            <h2 className="text-base sm:text-xl font-bold text-blue-900 uppercase tracking-wide">
              Everything You Need to Know About OTS
            </h2>
            <p className="text-xs sm:text-sm text-blue-700 mt-1.5 sm:mt-2">
              Common questions answered by OTS graduates and official guidance
            </p>
          </div>

          <div className="divide-y divide-blue-100">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="transition-colors hover:bg-blue-50 active:bg-blue-100"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-3 sm:p-4 flex justify-between items-center gap-3 sm:gap-4 touch-manipulation"
                >
                  <h3 className="text-xs sm:text-sm font-bold text-blue-900 flex-1">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-blue-800 bg-blue-50 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources - Mobile Optimized */}
        <div className="mt-4 sm:mt-8 bg-white rounded-xl sm:rounded-lg shadow-xl border-l-4 border-yellow-400 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-blue-900 uppercase tracking-wide mb-3 sm:mb-4">
            Official Resources
          </h3>
          <ul className="space-y-2 sm:space-y-2">
            <li>
              <a
                href="https://www.afaccessionscenter.af.mil/Holm-Center/OTS/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 active:text-blue-900 font-semibold hover:underline text-xs sm:text-sm block py-1 touch-manipulation"
              >
                → Air Force Accessions Center - OTS Official Site
              </a>
            </li>
            <li>
              <a
                href="https://www.airforce.com/training/military-training/ots"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 active:text-blue-900 font-semibold hover:underline text-xs sm:text-sm block py-1 touch-manipulation"
              >
                → AirForce.com OTS Information
              </a>
            </li>
            <li>
              <a
                href="https://www.airuniversity.af.edu/Holm-Center/OTS/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 active:text-blue-900 font-semibold hover:underline text-xs sm:text-sm block py-1 touch-manipulation"
              >
                → Air University Holm Center OTS
              </a>
            </li>
          </ul>
          <p className="text-xs text-blue-600 mt-3 sm:mt-4 italic leading-relaxed">
            Always verify information with your recruiter and official sources.
            Requirements and policies can change.
          </p>
        </div>

        {/* Footer - Mobile Optimized */}
        <div className="mt-6 sm:mt-8 text-center pb-4">
          <p className="text-blue-200 text-xs sm:text-sm font-semibold italic">
            "Aim High... Fly-Fight-Win"
          </p>
          <p className="text-blue-200 text-xs sm:text-sm font-semibold italic mt-1.5 sm:mt-2">
            "ALWAYS WITH HONOR"
          </p>
          <p className="text-blue-300 text-xs mt-1">
            Good luck at OTS, Future Officer!
          </p>
        </div>
      </main>
    </div>
  );
}

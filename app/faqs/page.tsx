'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: "How long is OTS?",
    answer: "Officer Training School is currently an 8-week program (as of 2024). However, this can change, so verify with your recruiter for the most current information."
  },
  {
    question: "Where is OTS located?",
    answer: "OTS is located at Maxwell Air Force Base in Montgomery, Alabama."
  },
  {
    question: "What should I bring on Day 1?",
    answer: "Wear a conservative business suit and dress shoes. Bring all required documents (ID, birth certificate, Social Security card, orders), your medications, and basic toiletries. Everything else can be brought in your luggage."
  },
  {
    question: "Will I get uniforms at OTS?",
    answer: "Yes, you will be issued OCPs (Operational Camouflage Pattern uniforms), PT gear, and other necessary uniforms. However, if you already have properly fitted military uniforms, you may bring them."
  },
  {
    question: "Can I bring my cell phone?",
    answer: "Yes, but usage is extremely limited. You'll have restricted access, typically only during designated times and on weekends. Don't expect regular use during training."
  },
  {
    question: "How much money should I bring?",
    answer: "$200-$300 in cash is recommended, plus a debit/credit card. You'll need money for haircuts, toiletries, and other personal items from the BX (Base Exchange)."
  },
  {
    question: "What about running shoes?",
    answer: "Bring 2 pairs of running shoes that are already broken in. Do NOT show up with brand new shoes - this will lead to injuries. Start breaking them in weeks before you arrive."
  },
  {
    question: "Can I bring my laptop?",
    answer: "Check current policy with your recruiter. Policies can change, and some classes allow laptops while others don't. When in doubt, don't bring it initially."
  },
  {
    question: "What about prescription medications?",
    answer: "You MUST bring all prescription medications in their original containers with documentation from your doctor. Bring enough to last the entire course plus extra."
  },
  {
    question: "Do I need military-specific glasses?",
    answer: "If you wear glasses, bring military-approved frames (conservative, solid color). You'll need both prescription glasses and the capability to do PT in them or with contacts."
  },
  {
    question: "How should I prepare physically?",
    answer: "Focus on running, push-ups, and sit-ups. The PT test includes a 1.5-mile run, push-ups, and sit-ups. Aim to exceed minimums for your age group. Start training at least 2-3 months before."
  },
  {
    question: "What's the daily schedule like?",
    answer: "Days start very early (often 5:00 AM) and are packed with PT, academics, drill, inspections, and military training. Expect 14-16 hour days with minimal free time."
  },
  {
    question: "Can I receive mail/packages?",
    answer: "Yes! Mail is a huge morale booster. You'll receive an address after arrival. Care packages are appreciated but keep them reasonable - space is limited."
  },
  {
    question: "What about haircuts?",
    answer: "Males must maintain military hair standards (short). Females must ensure hair is within regulations (can't touch collar when in uniform). Barbershop is available on base."
  },
  {
    question: "Will I have roommates?",
    answer: "Yes, you'll typically share a room with 1-2 other officer trainees. Privacy is limited, and you'll need to work together to maintain room standards."
  },
  {
    question: "What happens if I get injured?",
    answer: "Seek medical attention immediately. Depending on the injury, you may be set back to a later class to recover. Don't try to tough out injuries - this will make them worse."
  },
  {
    question: "Can I visit on weekends?",
    answer: "Weekend liberty is earned and depends on your flight's performance. When granted, you may have limited off-base privileges. Family visits are possible but coordinated carefully."
  },
  {
    question: "What's the pass/fail rate?",
    answer: "Most candidates who arrive prepared and motivated will graduate. The biggest reasons for elimination are honor violations, safety issues, medical problems, or failure to meet standards."
  },
  {
    question: "How can I best prepare mentally?",
    answer: "Study Air Force knowledge (ranks, chain of command, core values). Practice stress management. Understand you'll be challenged physically, mentally, and emotionally. Maintain a positive attitude and help your classmates."
  },
  {
    question: "What should I do in the weeks before OTS?",
    answer: "Train physically, study AF knowledge, break in your running shoes, get your documents in order, inform your family of limited contact, and mentally prepare for a challenging but rewarding experience."
  }
]

export default function FAQsPage() {
  const router = useRouter()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <img 
                  src="/ots-shield.png" 
                  alt="OTS Shield" 
                  className="w-20 h-20 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide">
                    OTS FAQs
                  </h1>
                  <p className="text-sm text-blue-200 font-semibold uppercase tracking-wider">
                    Frequently Asked Questions
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-blue-900 rounded-md transition-colors font-bold"
            >
              Back to Packing List
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-xl border-t-4 border-yellow-400 overflow-hidden">
          <div className="p-6 bg-blue-50 border-b-2 border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide">
              Everything You Need to Know About OTS
            </h2>
            <p className="text-sm text-blue-700 mt-2">
              Common questions answered by OTS graduates and official guidance
            </p>
          </div>

          <div className="divide-y divide-blue-100">
            {faqs.map((faq, index) => (
              <div key={index} className="transition-colors hover:bg-blue-50">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-4 flex justify-between items-center gap-4"
                >
                  <h3 className="text-sm font-bold text-blue-900 flex-1">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
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
                  <div className="px-4 pb-4 text-sm text-blue-800 bg-blue-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-white rounded-lg shadow-xl border-l-4 border-yellow-400 p-6">
          <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wide mb-4">
            Official Resources
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.airuniversity.af.edu/Holm-Center/OTS/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                → Air University OTS Official Site
              </a>
            </li>
            <li>
              <a
                href="https://www.airforce.com/training/military-training/ots/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                → AirForce.com OTS Overview
              </a>
            </li>
            <li>
              <a
                href="https://www.afpc.af.mil/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                → Air Force Personnel Center
              </a>
            </li>
          </ul>
          <p className="text-xs text-blue-600 mt-4 italic">
            Always verify information with your recruiter and official sources. Requirements and policies can change.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm font-semibold italic">
            "Aim High... Fly-Fight-Win"
          </p>
          <p className="text-blue-300 text-xs mt-1">
            Good luck at OTS, Future Officer!
          </p>
        </div>
      </main>
    </div>
  )
}

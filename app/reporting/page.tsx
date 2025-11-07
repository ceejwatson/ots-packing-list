"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReportingInstructions() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header with OTS Shield - Sticky - Mobile Optimized */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b-4 border-yellow-400 backdrop-blur-md bg-opacity-95">
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
                    REPORTING INSTRUCTIONS
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-200 font-semibold uppercase tracking-wider">
                    Always With Honor
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push("/")}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg transition-colors font-bold touch-manipulation"
              >
                Packing List
              </button>
              <button
                onClick={() => router.push("/faqs")}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-blue-900 rounded-lg transition-colors font-bold touch-manipulation"
              >
                FAQs
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Important Notice Banner */}
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-bold text-red-900 text-sm uppercase mb-2">
                Critical Information
              </h3>
              <p className="text-sm text-red-800 font-semibold">
                All personnel reporting to OTS must follow the instructions below.
                Conflicting information from recruiters, home units, and other sources should be disregarded.
              </p>
              <p className="text-sm text-red-800 mt-2">
                OTS will notify you of any deviations to the arrival process and/or requirements
                via the email you provided in WINGS. <strong>Monitor that inbox up to your arrival to OTS.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/30 overflow-hidden">
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Prior to In-processing */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-200">
                Prior to In-processing
              </h2>
              <ul className="space-y-3 text-sm sm:text-base text-gray-800">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    All OTs must be in the local area of Montgomery, AL <strong>no later than 11:59 pm
                    the day prior to class start date.</strong> This will allow for on-time arrival to OTS the following morning.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Check with your recruiter or home unit for lodging reimbursement. The University Inn at Maxwell AFB
                    (450 LeMay Plaza, Maxwell AFB, AL 36112) can be contacted via their website at{" "}
                    <a
                      href="https://af.dodlodging.nest/propertys/Maxwell-AFB"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      https://af.dodlodging.nest/propertys/Maxwell-AFB
                    </a>
                    {" "}or by phone at (334) 953-3931/7544/1690.
                  </span>
                </li>
              </ul>
            </section>

            {/* Day of In-processing */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-200">
                Day of In-processing
              </h2>
              <ul className="space-y-3 text-sm sm:text-base text-gray-800">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    All OTs will report to the dorms <strong>between 0700-0730.</strong> Follow arrows on the
                    map at the end of this page to the dorm identified in your welcome email. OTs may arrive
                    up to 30 minutes early to account for variability in traffic or ride availability.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <strong className="text-red-700">There is no delayed reporting to OTS.</strong> If you do not arrive during the
                    prescribed window, you will not be in-processed.
                  </span>
                </li>
                <li className="flex gap-3 ml-6">
                  <span className="text-orange-600 font-bold">◦</span>
                  <div>
                    <strong>Exceptions:</strong> In the event of missed or delayed flights or other travel
                    issues, contact OTS immediately. <strong>Call or text (334) 315-2080</strong> with
                    your name, flight/travel issue, and your updated expected arrival time to OTS.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <div>
                    <strong>Base access:</strong> Arrive at the Maxwell Blvd Gate or Maxwell AFB Visitor Center.
                    Show your OTS orders and REAL ID-compliant ID at the gate. From the gate, it is another
                    1.5 miles to the OTS campus at <strong>501 LeMay Plaza N, Maxwell AFB, AL 36112.</strong>
                    <ul className="mt-2 ml-6 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-orange-600 font-bold">◦</span>
                        <span>
                          The base taxi is available at <strong>(334) 953-5038.</strong> If you plan to utilize the
                          base taxi, coordinate ahead of time to ensure your on-time arrival.
                        </span>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <div>
                    <strong>Meals:</strong> OTs should eat breakfast before reporting in and ensure they are
                    properly hydrated, beginning 2 days prior to arrival. Meals will be provided beginning with lunch on day 1.
                    <ul className="mt-2 ml-6 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-orange-600 font-bold">◦</span>
                        <span>
                          <strong>Direct commission OTs only</strong> — be prepared to pay for all meals at OTS.
                          The OTS Dining Facility (DFAC) accepts credit and debit cards; however, OTs should have
                          <strong> $200 in cash</strong> in varied bills to pay for required Meals Ready-to-Eat and
                          in the event of technical issues with card readers.
                        </span>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </section>

            {/* Grooming Standards & Arrival Attire */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-200">
                Grooming Standards & Arrival Attire
              </h2>
              <ul className="space-y-3 text-sm sm:text-base text-gray-800">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    All OTs will arrive in compliance with the grooming standards defined in <strong>DAFI 36-2903</strong> and
                    the <strong>OTS SPINS</strong> or be subject to dismissal.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <strong className="text-red-700">All OTs will arrive at OTS clean-shaven.</strong> Moustaches and beards are
                    not authorized for OTs except for documented and approved religious accommodations or medical profiles.
                    OTs not in compliance will be turned away and will not be in-processed.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <div>
                    <strong>OTs will report to OTS wearing:</strong>
                    <ul className="mt-2 ml-6 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-orange-600 font-bold">◦</span>
                        <span>A solid-color collared shirt (tucked in and buttoned)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-orange-600 font-bold">◦</span>
                        <span>Tan or beige khaki-style pants with a belt. No shorts, capris, jeans, leggings, skirts, or dresses.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-orange-600 font-bold">◦</span>
                        <span>Athletic shoes with laces tucked in. No dress shoes, sandals, flats, heels, or boots</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-orange-600 font-bold">◦</span>
                        <span>As weather conditions warrant, jackets, blazers, or coats are authorized for wear</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-orange-600 font-bold">◦</span>
                        <span><strong>Arrive wearing your hydration pack assembled and filled with water</strong></span>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Transition lenses or sunglasses are not authorized unless accompanied by a doctor's note stipulating
                    the conditions of this requirement. OTs will report to OTS IDMT staff upon in-processing to validate
                    this requirement and coordinate a profile.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Jewelry other than removable wedding rings and religious medallions will not be worn
                  </span>
                </li>
              </ul>
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                <p className="text-sm text-yellow-900">
                  <strong>NOTE:</strong> No civilian/personal items with offensive wording, graphics, or
                  photos are to be worn or displayed.
                </p>
              </div>
            </section>

            {/* Prohibited Items */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-900 mb-4 pb-2 border-b-2 border-red-300">
                Prohibited Items
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm sm:text-base text-red-900 font-semibold">
                  <strong>Alcohol, tobacco/nicotine products, pets, knives, and weapons of any kind</strong> are
                  prohibited for the duration of OTS.
                </p>
              </div>
            </section>

            {/* Campus Map */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-200">
                OTS Campus Map & Parking
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                Follow the arrows on the map below to locate your assigned dorm (identified in your welcome email).
              </p>
              <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
                <img
                  src="/images/ots-campus-map.png"
                  alt="OTS Campus Map showing in-processing and parking locations"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center pb-4">
          <p className="text-blue-200 text-xs sm:text-sm font-semibold italic">
            "Aim High... Fly-Fight-Win"
          </p>
          <p className="text-blue-200 text-xs sm:text-sm font-semibold italic mt-1.5 sm:mt-2">
            "ALWAYS WITH HONOR"
          </p>
          <p className="text-blue-300 text-xs mt-1">Maxwell AFB, Alabama</p>
        </div>
      </main>
    </div>
  );
}

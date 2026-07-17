import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Reporting Instructions",
  description:
    "Air Force OTS Day 1 reporting instructions: arrival window, base access, grooming standards, required attire, prohibited items, and the campus map.",
  alternates: { canonical: "/reporting" },
  openGraph: {
    title: "OTS Reporting Instructions — Air Force Officer Training School",
    description:
      "Day 1 arrival window, base access, grooming standards, required attire, and the OTS campus map.",
    url: "/reporting",
  },
};

export default function ReportingPage() {
  return (
    <main
      id="main-content"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
          Reporting instructions
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          From the CAO 27 March 2026 Orientation Guide.
        </p>
      </div>

      {/* Critical notice */}
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
        <p className="text-sm font-semibold text-red-900">
          All personnel reporting to OTS must follow the instructions below.
          Conflicting information from recruiters, home units, and other
          sources should be disregarded.
        </p>
        <p className="mt-2 text-sm text-red-800">
          OTS will notify you of any deviations via the email you provided in
          WINGS. <strong>Monitor that inbox up to your arrival.</strong>
        </p>
      </div>

      <div className="space-y-6">
        {/* Prior to in-processing */}
        <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide mb-3">
            Prior to in-processing
          </h2>
          <ul className="space-y-2.5 text-sm leading-relaxed text-stone-600 list-disc pl-5 marker:text-blue-700">
            <li>
              All OTs must be in the local area of Montgomery, AL{" "}
              <strong className="text-stone-900">
                no later than 11:59 pm the day prior to class start date
              </strong>{" "}
              to allow on-time arrival the following morning.
            </li>
            <li>
              Check with your recruiter or home unit for lodging reimbursement.
              The University Inn at Maxwell AFB (450 LeMay Plaza, Maxwell AFB,
              AL 36112) can be reached at{" "}
              <a
                href="https://af.dodlodging.nest/propertys/Maxwell-AFB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-900"
              >
                af.dodlodging.nest
              </a>{" "}
              or{" "}
              <a
                href="tel:+13349533931"
                className="text-blue-700 underline hover:text-blue-900"
              >
                (334) 953-3931
              </a>
              /7544/1690.
            </li>
          </ul>
        </section>

        {/* Day of in-processing */}
        <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide mb-3">
            Day of in-processing
          </h2>
          <ul className="space-y-2.5 text-sm leading-relaxed text-stone-600 list-disc pl-5 marker:text-blue-700">
            <li>
              Report to the dorms{" "}
              <strong className="text-stone-900">between 0700&ndash;0730</strong>.
              Follow the arrows on the map below to the dorm identified in your
              welcome email. You may arrive up to 30 minutes early to account
              for traffic or ride availability.
            </li>
            <li>
              <strong className="text-red-700">
                There is no delayed reporting to OTS.
              </strong>{" "}
              If you do not arrive during the prescribed window, you will not
              be in-processed.
              <ul className="mt-2 space-y-2 list-[circle] pl-5 marker:text-stone-400">
                <li>
                  <strong className="text-stone-900">Exceptions:</strong> for
                  missed or delayed flights or other travel issues, contact OTS
                  immediately &mdash;{" "}
                  <strong className="text-stone-900">
                    call or text{" "}
                    <a href="tel:+13343152080" className="underline">
                      (334) 315-2080
                    </a>
                  </strong>{" "}
                  with your name, travel issue, and updated expected arrival
                  time.
                </li>
              </ul>
            </li>
            <li>
              <strong className="text-stone-900">Base access:</strong> arrive
              at the Maxwell Blvd Gate or Maxwell AFB Visitor Center. Show your
              OTS orders and REAL ID-compliant ID at the gate. From the gate it
              is another 1.5 miles to the OTS campus at{" "}
              <strong className="text-stone-900">
                501 LeMay Plaza N, Maxwell AFB, AL 36112
              </strong>
              .
              <ul className="mt-2 space-y-2 list-[circle] pl-5 marker:text-stone-400">
                <li>
                  The base taxi is available at{" "}
                  <strong className="text-stone-900">
                    <a href="tel:+13349535038" className="underline">
                      (334) 953-5038
                    </a>
                  </strong>
                  . Coordinate ahead of time to ensure on-time arrival.
                </li>
              </ul>
            </li>
            <li>
              <strong className="text-stone-900">Meals:</strong> eat breakfast
              before reporting in and hydrate properly beginning 2 days prior
              to arrival. Meals are provided beginning with lunch on Day 1.
              <ul className="mt-2 space-y-2 list-[circle] pl-5 marker:text-stone-400">
                <li>
                  <strong className="text-stone-900">
                    Direct commission OTs only
                  </strong>{" "}
                  &mdash; be prepared to pay for all meals at OTS. The DFAC
                  accepts cards, but have{" "}
                  <strong className="text-stone-900">$200 in cash</strong> in
                  varied bills for required MREs and card-reader outages.
                </li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Grooming & attire */}
        <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide mb-3">
            Grooming standards &amp; arrival attire
          </h2>
          <ul className="space-y-2.5 text-sm leading-relaxed text-stone-600 list-disc pl-5 marker:text-blue-700">
            <li>
              Arrive in compliance with the grooming standards in{" "}
              <strong className="text-stone-900">DAFI 36-2903</strong> and the{" "}
              <strong className="text-stone-900">OTS SPINS</strong> or be
              subject to dismissal.
            </li>
            <li>
              <strong className="text-red-700">
                All OTs will arrive at OTS clean-shaven.
              </strong>{" "}
              Moustaches and beards are not authorized except for documented
              and approved religious accommodations or medical profiles. OTs
              not in compliance will be turned away and not in-processed.
            </li>
            <li>
              <strong className="text-stone-900">Report wearing:</strong>
              <ul className="mt-2 space-y-2 list-[circle] pl-5 marker:text-stone-400">
                <li>A solid-color collared shirt, tucked in and buttoned</li>
                <li>
                  Tan or beige khaki-style pants with a belt &mdash; no shorts,
                  capris, jeans, leggings, skirts, or dresses
                </li>
                <li>
                  Athletic shoes with laces tucked in &mdash; no dress shoes,
                  sandals, flats, heels, or boots
                </li>
                <li>
                  Jackets, blazers, or coats as weather conditions warrant
                </li>
                <li>
                  <strong className="text-stone-900">
                    Your hydration pack, assembled and filled with water
                  </strong>
                </li>
              </ul>
            </li>
            <li>
              Transition lenses or sunglasses are not authorized unless
              accompanied by a doctor&apos;s note stipulating the conditions.
              Report to OTS IDMT staff on in-processing to validate and
              coordinate a profile.
            </li>
            <li>
              Jewelry other than removable wedding rings and religious
              medallions will not be worn.
            </li>
          </ul>
          <p className="mt-4 rounded-lg bg-stone-100 p-3 text-xs text-stone-600">
            <strong className="text-stone-900">Note:</strong> no
            civilian/personal items with offensive wording, graphics, or photos
            are to be worn or displayed.
          </p>
        </section>

        {/* Prohibited items */}
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-red-900 mb-2">
            Prohibited items
          </h2>
          <p className="text-sm text-red-900">
            <strong>
              Alcohol, tobacco/nicotine products, pets, knives, and weapons of
              any kind
            </strong>{" "}
            are prohibited for the duration of OTS.
          </p>
        </section>

        {/* Campus map */}
        <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide mb-3">
            OTS campus map &amp; parking
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            Park only in the designated area and follow the arrows to the dorm
            identified in your welcome email.
          </p>
          <Image
            src="/images/ots-campus-map.png"
            alt="OTS campus map showing officer trainee parking and dorm buildings 1486, 1488, 1489, and 1491"
            width={1606}
            height={1240}
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full h-auto rounded-lg border border-stone-200"
          />
        </section>
      </div>
    </main>
  );
}

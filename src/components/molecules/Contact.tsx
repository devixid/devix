import { ContactForm } from "./ContactForm";

export default function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-white py-20 text-black md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-20">
          {/* Left Column (Heading) */}
          <div className="flex flex-col justify-between lg:col-span-1">
            <div>
              <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
                Get In Touch
              </p>
              <h2 className="font-display text-4xl leading-[1.1] font-extralight tracking-tight md:text-5xl">
                Let's build something world-class together.
              </h2>
            </div>

            {/* Contact details */}
            <div className="font-body mt-12 space-y-2 text-sm text-zinc-500 lg:mt-0">
              <p>Email: hello@devix.id</p>
              <p>Timezone: UTC+7 (GMT+7)</p>
            </div>
          </div>

          {/* Right Column (Form Panel) */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

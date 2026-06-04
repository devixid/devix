import { ContactForm } from "./ContactForm";

export default function Contact() {
  return (
    <section id="contact" className="bg-white text-black py-20 md:py-32 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Left Column (Heading) */}
          <div className="lg:col-span-1 flex flex-col justify-between">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-400 mb-4">
                Get In Touch
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-extralight leading-[1.1] tracking-tight">
                Let's build something world-class together.
              </h2>
            </div>
            
            {/* Contact details */}
            <div className="mt-12 lg:mt-0 font-body text-sm text-zinc-500 space-y-2">
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

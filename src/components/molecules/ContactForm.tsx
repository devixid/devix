"use client";

import { useState, useTransition } from "react";
import { submitContactForm } from "@/actions/contact";
import { m, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    // Client-side validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Name must be at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg("Message must be at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const result = await submitContactForm({
        name,
        email,
        message,
      });

      if (result.success) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setErrorMsg(result.error || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="lg:col-span-2 relative min-h-[400px]">
      <AnimatePresence mode="wait">
        {!success ? (
          <m.form
            key="contact-form"
            onSubmit={handleSubmit}
            className="space-y-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Name field */}
            <div className="relative group">
              <input
                type="text"
                id="name"
                required
                disabled={isPending}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="peer w-full bg-transparent border-b border-zinc-200 py-4 text-base font-body placeholder-zinc-400 focus:outline-none focus:border-accent transition-colors duration-300 disabled:opacity-50"
              />
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-500 peer-focus:w-full" />
            </div>

            {/* Email field */}
            <div className="relative group">
              <input
                type="email"
                id="email"
                required
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                className="peer w-full bg-transparent border-b border-zinc-200 py-4 text-base font-body placeholder-zinc-400 focus:outline-none focus:border-accent transition-colors duration-300 disabled:opacity-50"
              />
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-500 peer-focus:w-full" />
            </div>

            {/* Message field */}
            <div className="relative group">
              <textarea
                id="message"
                required
                disabled={isPending}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your project, goals, and budget"
                rows={5}
                className="peer w-full bg-transparent border-b border-zinc-200 py-4 text-base font-body placeholder-zinc-400 focus:outline-none focus:border-accent transition-colors duration-300 resize-none disabled:opacity-50"
              />
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-500 peer-focus:w-full" />
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="text-red-500 text-sm font-body">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="group relative inline-flex items-center justify-center bg-black text-white hover:bg-accent py-4 px-10 text-sm font-medium tracking-wider uppercase transition-colors duration-300 rounded-none cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </button>
          </m.form>
        ) : (
          <m.div
            key="success-message"
            className="flex flex-col items-start justify-center h-full space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-16 h-16 border border-accent flex items-center justify-center text-accent">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-light mb-2">
                Thank you for reaching out.
              </h3>
              <p className="font-body text-zinc-500 text-base">
                We've received your submission and will get back to you within 24 hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="font-body text-sm text-zinc-500 hover:text-black border-b border-zinc-300 hover:border-black transition-colors pb-0.5 cursor-pointer mt-4"
            >
              Send another message
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

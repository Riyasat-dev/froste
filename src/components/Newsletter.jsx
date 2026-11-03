import { useState } from "react";
import { motion } from "framer-motion";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | error | done

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      return;
    }
    // TODO: send to a real email service
    setStatus("done");
    setEmail("");
  };

  return (
    <section id="newsletter" className="bg-[#d8d0c3] px-6 py-24 md:px-16 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-xl text-center"
      >
        <p className="mb-5 text-[10px] tracking-[4px] text-[#8a3d45]">THE INSIDE LIST</p>
        <h2 className="font-serif text-4xl text-[#292824] md:text-6xl">First to the cold.</h2>
        <p className="mt-5 text-sm leading-7 text-[#55534d]">
          New arrivals, private sales and styling notes, delivered sparingly.
        </p>

        {status === "done" ? (
          <p role="status" className="mt-10 font-serif text-xl text-[#292824]">
            Thank you. You are on the list.
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="nl-email" className="sr-only">
              Email address
            </label>
            <input
              id="nl-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Your email address"
              aria-invalid={status === "error"}
              aria-describedby={status === "error" ? "nl-error" : undefined}
              className="min-w-0 flex-1 border border-[#292824]/30 bg-transparent px-5 py-4 text-sm text-[#292824] outline-none transition placeholder:text-[#292824]/50 focus:border-[#292824]"
            />
            <button
              type="submit"
              className="bg-[#292824] px-9 py-4 text-xs tracking-[2px] text-white transition hover:bg-[#8a3d45]"
            >
              SUBSCRIBE
            </button>
          </form>
        )}
        {status === "error" && (
          <p id="nl-error" role="alert" className="mt-3 text-xs text-[#8a3d45]">
            Please enter a valid email address.
          </p>
        )}
      </motion.div>
    </section>
  );
}

export default Newsletter;

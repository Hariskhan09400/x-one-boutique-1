import { useState, FormEvent } from "react";
import { Mail, MessageCircle, Send, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const emailBody = `Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}

---
Sent from X One Boutique Contact Form`;

    window.location.href = `mailto:hariskhan5375123@gmail.com?subject=Customer Inquiry from ${formData.name}&body=${encodeURIComponent(
      emailBody
    )}`;

    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitted(false);
    }, 3000);
  };

  const handleWhatsApp = () => {
    const message = `Hello! I'm ${formData.name}. ${
      formData.message || "I have a question about your products."
    }`;
    window.open(
      `https://wa.me/917208428589?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <section id="contact" className="mt-8 sm:mt-10 md:mt-12">
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden
        border border-gray-200 dark:border-white/[0.10]
        shadow-[0_26px_100px_rgba(0,0,0,0.25)] dark:shadow-[0_26px_100px_rgba(0,0,0,0.55)]
        transition-all duration-500
        bg-white text-black
        dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
        dark:text-white"
      >
        {/* Dark mode glow only */}
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(900px_380px_at_20%_0%,rgba(59,130,246,0.16),transparent_60%),radial-gradient(700px_360px_at_95%_10%,rgba(56,189,248,0.10),transparent_55%)]"></div>

        <div className="relative grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 md:p-8 lg:p-12">
            <div
              className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full
              text-blue-600 dark:text-blue-200
              text-xs sm:text-sm font-bold mb-3 sm:mb-4
              bg-blue-100 dark:bg-blue-500/15
              ring-1 ring-blue-300 dark:ring-blue-400/25"
            >
              GET IN TOUCH
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 leading-tight text-black dark:text-white">
              Contact & Quick Order
            </h2>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300">
                <MessageCircle className="text-green-500 dark:text-green-400" size={18} />
                <span className="font-semibold break-all">
                  WhatsApp: +91 7208428589
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300">
                <Mail className="text-blue-500 dark:text-blue-400" size={18} />
                <span className="font-semibold break-words">
                  hariskhan5375123@gmail.com
                </span>
              </div>
            </div>

            {isSubmitted ? (
              <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 rounded-xl text-green-700 dark:text-green-400">
                <CheckCircle size={20} />
                <span className="font-semibold text-sm">
                  Message sent! We'll get back to you soon.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl
                    bg-gray-100 text-black
                    dark:bg-gray-800 dark:text-white
                    placeholder:text-gray-500
                    focus:outline-none transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl
                    bg-gray-100 text-black
                    dark:bg-gray-800 dark:text-white
                    placeholder:text-gray-500
                    focus:outline-none transition-all"
                  />
                </div>

                <textarea
                  placeholder="Your message or special request..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl
                  bg-gray-100 text-black
                  dark:bg-gray-800 dark:text-white
                  placeholder:text-gray-500
                  focus:outline-none transition-all resize-none"
                ></textarea>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl
                    font-bold transition-all duration-200 active:scale-95
                    bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  >
                    <Send size={18} />
                    Email Order
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl
                    font-bold transition-all duration-200 active:scale-95
                    bg-gradient-to-r from-green-600 to-emerald-500 text-white"
                  >
                    <MessageCircle size={18} />
                    WhatsApp Now
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="relative min-h-[250px] sm:min-h-[300px] md:min-h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1960"
              alt="Contact us"
              className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 dark:from-black/35 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

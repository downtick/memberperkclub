import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about MemberPerkClub membership? Send us a message.",
};

export default function ContactPage() {
  return (
    <section className="section flex-1">
      <div className="section py-16 px-6 text-center">
        <h1 className="text-white text-3xl md:text-4xl mb-2">Contact Us</h1>
        <p className="text-gray-300">Have a question about membership? We&apos;re happy to help.</p>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-14">
        <div className="card p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

import FaqSection from "./_components/shared/sections/faq-section";
import Hero from "./_components/home/hero";
import HowItWorks from "./_components/home/how-it-works";
import ExclusiveOffers from "./_components/home/offers";
import ReviewsSection from "./_components/home/reviews-section";
import ProductCard from "./_components/shared/cards/product-card";
import Section from "./_components/shared/section";
import { offers, products, reviews } from "./data";

export default function Page() {
  return (
    <>
      <Hero />
      <ExclusiveOffers offers={offers} />
      <Section
        title="Popular products"
        description="Best sellers this week"
        viewMore={{
          href: "/products",
          label: "See all",
          variant: "secondary",
          icon: null,
        }}
      >
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </Section>
      <ReviewsSection
        reviews={reviews}
        viewMore={{
          href: "/reviews",
          label: "See all",
          variant: "secondary",
          icon: null,
        }}
      />
      <HowItWorks />
      <FaqSection />
    </>
  );
}

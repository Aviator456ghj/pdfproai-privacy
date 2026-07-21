'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, ShieldCheck, BadgeDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface PlanFeature {
  label: string;
  free: boolean | string;
  premium: boolean | string;
  business: boolean | string;
}

const planFeatures: PlanFeature[] = [
  { label: 'Basic PDF tools', free: true, premium: true, business: true },
  { label: 'Daily usage limit', free: '5 tasks/day', premium: 'Unlimited', business: 'Unlimited' },
  { label: 'File size limit', free: '10 MB', premium: '100 MB', business: '500 MB' },
  { label: 'Advertisements', free: true, premium: false, business: false },
  { label: 'AI-powered tools', free: false, premium: true, business: true },
  { label: 'Batch processing', free: false, premium: true, business: true },
  { label: 'Faster processing', free: false, premium: true, business: true },
  { label: 'API access', free: false, premium: false, business: true },
  { label: 'Team accounts', free: false, premium: false, business: true },
  { label: 'White-label branding', free: false, premium: false, business: true },
  { label: 'Priority support', free: false, premium: true, business: true },
  { label: 'Custom integrations', free: false, premium: false, business: true },
];

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline';
  popular?: boolean;
  cta: string;
  ctaVariant: 'default' | 'outline';
}

const plans: Plan[] = [
  {
    name: 'Free',
    description: 'Perfect for occasional PDF tasks',
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: 'Get Started',
    ctaVariant: 'outline',
  },
  {
    name: 'Premium',
    description: 'For power users and professionals',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    badge: 'MOST POPULAR',
    popular: true,
    cta: 'Upgrade to Premium',
    ctaVariant: 'default',
  },
  {
    name: 'Business',
    description: 'For teams and enterprises',
    monthlyPrice: 29.99,
    yearlyPrice: 24.99,
    cta: 'Contact Sales',
    ctaVariant: 'outline',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function CheckMark({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-sm font-medium text-foreground">{value}</span>;
  }
  if (value) {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-emerald-100">
        <Check className="size-3 text-emerald-600" strokeWidth={3} />
      </div>
    );
  }
  return (
    <div className="flex size-5 items-center justify-center rounded-full bg-slate-100">
      <X className="size-3 text-slate-400" strokeWidth={3} />
    </div>
  );
}

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-16 sm:py-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need more power. No hidden fees, cancel anytime.
          </p>

          {/* Billing toggle — polished pill design */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-1.5 py-1.5 shadow-sm backdrop-blur-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                !isYearly
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-emerald-600 scale-90"
            />
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isYearly
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              {isYearly && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                  -20%
                </Badge>
              )}
            </button>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start max-w-5xl mx-auto"
        >
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative flex flex-col rounded-2xl border p-6 lg:p-8 transition-all duration-200 ${
                  isPopular
                    ? 'border-transparent bg-white md:scale-105 md:z-10 shadow-xl shadow-emerald-500/10'
                    : 'border-slate-200/80 bg-white shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Gradient border for popular card */}
                {isPopular && (
                  <div className="pointer-events-none absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 -z-10" />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md shadow-emerald-500/25 px-4 py-1 text-[11px] font-bold tracking-wide uppercase">
                      <Sparkles className="size-3 mr-1" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* Plan name & description */}
                <div className="mt-2">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1">
                  {price === 0 ? (
                    <span className="text-4xl font-bold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">${price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
                {isYearly && price !== null && price > 0 && (
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    Billed annually (${(price * 12).toFixed(2)}/year)
                  </p>
                )}

                {/* CTA */}
                <Button
                  className={`mt-8 w-full font-semibold transition-all duration-200 ${
                    isPopular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30'
                      : plan.ctaVariant === 'outline'
                        ? 'hover:bg-slate-50 hover:border-slate-300'
                        : ''
                  }`}
                  variant={isPopular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                {/* Divider */}
                <div className="mt-6 border-t border-slate-100" />

                {/* Features list */}
                <ul className="mt-5 flex-1 space-y-3">
                  {planFeatures.map((feature) => {
                    const value =
                      plan.name === 'Free'
                        ? feature.free
                        : plan.name === 'Premium'
                          ? feature.premium
                          : feature.business;

                    // "Advertisements" inverted — having ads is negative
                    const isPositive = feature.label === 'Advertisements' ? !value : value;

                    return (
                      <li
                        key={feature.label}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span
                          className={
                            isPositive ? 'text-foreground' : 'text-muted-foreground'
                          }
                        >
                          {feature.label === 'Advertisements' ? 'No ads' : feature.label}
                        </span>
                        <CheckMark
                          value={
                            feature.label === 'Advertisements' ? !value : value
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Money-back guarantee badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/60 px-5 py-2.5 text-sm text-emerald-700">
            <ShieldCheck className="size-4" />
            <span className="font-medium">30-day money-back guarantee</span>
            <span className="text-emerald-500">·</span>
            <span className="text-emerald-600">No questions asked</span>
          </div>
        </motion.div>

        {/* Feature comparison table (mobile-friendly) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <h3 className="text-center text-lg font-bold text-foreground mb-6">
            Full Feature Comparison
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    Free
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-emerald-700 bg-emerald-50/50">
                    <div className="flex items-center justify-center gap-1">
                      <Sparkles className="size-3.5" />
                      Premium
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody>
                {planFeatures.map((feature, i) => (
                  <tr
                    key={feature.label}
                    className={`border-b border-slate-100 last:border-0 ${
                      i % 2 === 0 ? '' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{feature.label}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <CheckMark value={feature.free} />
                      </div>
                    </td>
                    <td className="px-4 py-3 bg-emerald-50/20">
                      <div className="flex justify-center">
                        <CheckMark value={feature.premium} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <CheckMark value={feature.business} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
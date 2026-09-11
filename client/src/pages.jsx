import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Camera, CircleAlert, Clock3, Leaf, LogIn, Recycle, ShieldCheck, Sparkles, Star, Truck, CheckCircle2, ImagePlus, Bell, Package, Award, MessageSquare, TrendingUp, User, Calendar, MapPin, Weight, ChevronRight, Download, Plus, RefreshCw, Clock, CheckCheck, XCircle, AlertCircle, Inbox } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { forwardRef, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from './context/AuthContext'
import { api } from './services/api'
import { EmptyState, ErrorState, LoadingState } from './components/Feedback'

const statusLabels = (value) => value?.toLowerCase().replaceAll('_', ' ')
const assetUrl = (value) => value?.startsWith('http') ? value : `${(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://kabadivala-api.onrender.com/api' : 'http://localhost:5000/api')).replace(/\/api$/, '')}${value}`
function PickupImages({ images = [], label = 'Item photos' }) { if (!images.length) return null; return <div className="pickup-images"><h3>{label}</h3><div>{images.map((image) => <a href={assetUrl(image)} target="_blank" rel="noreferrer" key={image}><img src={assetUrl(image)} alt="Uploaded pickup item" loading="lazy" /></a>)}</div></div> }
const useLoad = (request, deps = []) => {
  const [state, setState] = useState({ loading: true, error: '', data: null })
  useEffect(() => { let active = true; setState({ loading: true, error: '', data: null }); request().then(({ data }) => active && setState({ loading: false, error: '', data: data.data })).catch((e) => active && setState({ loading: false, error: e.response?.data?.message || 'Unable to load this section.', data: null })); return () => { active = false } }, deps)
  return state
}
const Button = ({ children, ...props }) => <button className="button primary" {...props}>{children}</button>
function State({ state, children }) { if (state.loading) return <LoadingState />; if (state.error) return <ErrorState message={state.error} />; return children }

export function LandingPage() {
  const stats = [
    { value: '10K+', label: 'Pickups done' },
    { value: '500+', label: 'Collectors' },
    { value: '50T', label: 'Recycled' },
    { value: '4.9★', label: 'Avg rating' },
  ]
  const steps = [
    { icon: <Camera size={22} />, step: '01', title: 'Snap & describe', desc: 'Upload a photo or describe your item. Our AI suggests category, condition and estimated value instantly.' },
    { icon: <Truck size={22} />, step: '02', title: 'Book a pickup', desc: 'Choose your time slot. We match you with a verified local collector based on area, capacity and rating.' },
    { icon: <Sparkles size={22} />, step: '03', title: 'Track every handoff', desc: 'Follow your item from doorstep to recycler with live status, proof images and eco-impact certificates.' },
  ]
  const features = [
    { icon: <Camera size={20} />, title: 'AI-powered scanning', desc: 'Gemini identifies your item, suggests category and condition — saving you time on every request.' },
    { icon: <ShieldCheck size={20} />, title: 'Verified collectors', desc: 'Every collector is background-checked, rated and tracked. You always know who is coming.' },
    { icon: <Sparkles size={20} />, title: 'Live impact tracking', desc: 'See weights, eco points, certificates and recycling outcomes — not just a pickup confirmation.' },
    { icon: <Leaf size={20} />, title: 'Eco points & rewards', desc: 'Earn points for every responsible handoff. Redeem them for discounts and green certificates.' },
    { icon: <Recycle size={20} />, title: 'Full chain visibility', desc: 'Home → Collector → Hub → Recycler. Every step is logged, timestamped and traceable.' },
    { icon: <Star size={20} />, title: 'Fair for everyone', desc: 'Collectors get clear work and fair rates. Customers get transparency. Communities get cleaner streets.' },
  ]
  const testimonials = [
    { name: 'Priya Sharma', role: 'Customer, Delhi', text: 'Booked my first pickup in 2 minutes. The collector arrived on time and I could track everything live. Amazing!', rating: 5 },
    { name: 'Ravi Kumar', role: 'Collector, Mumbai', text: 'Kabadivala gives me steady work and fair pay. The app is simple and the customers are great.', rating: 5 },
    { name: 'Anita Joshi', role: 'Customer, Bangalore', text: 'I love the eco points! Already earned enough for a free pickup. The AI scan is super accurate too.', rating: 5 },
  ]

  return (
    <main className="landing">
      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="container lp-hero__inner">
          <div className="lp-hero__copy">
            <span className="eyebrow lp-eyebrow"><Leaf size={14} /> Circular economy, made local</span>
            <h1 className="lp-hero__h1">
              Waste has a journey.<br />
              <em>Make it count.</em>
            </h1>
            <p className="lp-hero__lede">
              A trusted circular network for homes, collectors, hubs and recyclers.
              Snap an item, get an AI suggestion and book a responsible pickup in minutes.
            </p>
            <div className="lp-hero__actions">
              <Link className="button primary lp-cta-btn" to="/register">
                Start recycling <ArrowRight size={17} />
              </Link>
              <Link className="button secondary lp-cta-btn" to="/login">Sign in</Link>
            </div>
            <div className="lp-hero__trust">
              <span><ShieldCheck size={15} /> Verified collectors</span>
              <span><Recycle size={15} /> Traceable handoffs</span>
              <span><Leaf size={15} /> Eco-certified</span>
            </div>
          </div>

          <div className="lp-hero__art">
            <div className="lp-orb" />
            <div className="floating-chip chip-one"><Camera size={14} /> AI item scan</div>
            <div className="floating-chip chip-two"><Sparkles size={14} /> Live impact tracking</div>
            <div className="lp-impact-card">
              <span className="lp-impact-card__label">Built for the whole chain</span>
              <strong className="lp-impact-card__value">One clear journey</strong>
              <small>From local collection to responsible recycling</small>
              <div className="lp-impact-bar"><i /></div>
            </div>
            <div className="lp-route-card">
              <Recycle size={18} />
              <div>
                <b>Full chain</b>
                <small>Home → Collector → Hub → Recycler</small>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="container lp-stats">
          {stats.map((s) => (
            <div className="lp-stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee" aria-label="Kabadivala benefits">
        <div>
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <span>♻ Responsible recycling</span>
              <span>✦ AI-assisted item details</span>
              <span>↗ Verified collectors</span>
              <span>◌ Transparent handoffs</span>
              <span>♧ Cleaner communities</span>
              <span>🌿 Eco points & rewards</span>
              <span>🏆 Certified recycling</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="section light lp-steps-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps to a cleaner home.</h2>
            <p>From snap to recycled — the whole journey is simple, transparent and rewarding.</p>
          </div>
          <div className="lp-steps">
            {steps.map((s) => (
              <div className="lp-step" key={s.step}>
                <div className="lp-step__num">{s.step}</div>
                <div className="lp-step__icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="how" className="section lp-features-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Why Kabadivala</span>
            <h2>The local network behind a cleaner tomorrow.</h2>
            <p>Book a pickup, meet a verified collector and follow every handoff with a simple, human-first workspace.</p>
          </div>
          <div className="lp-features">
            {features.map((f) => (
              <article className="lp-feature-card" key={f.title}>
                <span className="lp-feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT BAND ── */}
      <section id="impact" className="lp-impact-band">
        <div className="container lp-impact-band__inner">
          <div className="lp-impact-band__copy">
            <span className="eyebrow" style={{ color: '#dff3a6' }}>A better chain, together</span>
            <h2>Every verified kilogram has a story.</h2>
            <p>Customers see progress, collectors get clear work, hubs keep custody visible and recyclers can prove the outcome.</p>
            <Link className="button lp-impact-btn" to="/impact">See our impact <ArrowRight size={16} /></Link>
          </div>
          <div className="lp-impact-band__visual">
            <div className="lp-chain">
              {['🏠 Home', '🚛 Collector', '🏭 Hub', '♻ Recycler'].map((node, i, arr) => (
                <div key={node} className="lp-chain__row">
                  <div className="lp-chain__node">{node}</div>
                  {i < arr.length - 1 && <div className="lp-chain__arrow">↓</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section light lp-testimonials-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Trusted by thousands</span>
            <h2>Real people, real impact.</h2>
          </div>
          <div className="lp-testimonials">
            {testimonials.map((t) => (
              <div className="lp-testimonial" key={t.name}>
                <div className="lp-testimonial__stars">{'★'.repeat(t.rating)}</div>
                <p>"{t.text}"</p>
                <div className="lp-testimonial__author">
                  <span className="lp-testimonial__avatar">{t.name[0]}</span>
                  <div>
                    <b>{t.name}</b>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="section lp-faq-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Questions, answered</span>
            <h2>Everything you need before your first pickup.</h2>
          </div>
          <div className="lp-faq">
            {[
              ['Can I add an item image manually?', 'Yes. You can choose a photo from your phone or use the camera. The AI suggestion is optional and you can edit every field.'],
              ['Who can see my uploaded image?', 'Your assigned operational team can view pickup images to verify the item and collection. Access is protected by role.'],
              ['What happens after collection?', 'The pickup moves through collector, hub and recycler handoffs, with status events, weight records and certificates where applicable.'],
              ['How do eco points work?', 'You earn 10 base points plus a category rate per estimated kilogram after each successful collection. Points can be redeemed for rewards.'],
              ['Is the service available in my city?', 'We are live in 20+ cities across India and expanding fast. Enter your pincode during registration to check availability.'],
            ].map(([q, a]) => (
              <details className="lp-faq__item" key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-final-cta">
        <div className="container lp-final-cta__inner">
          <span className="eyebrow" style={{ color: '#dff3a6' }}>Ready to begin?</span>
          <h2>Turn unused items into a cleaner next step.</h2>
          <p>Join thousands of households making recycling simple, traceable and rewarding.</p>
          <div className="lp-final-cta__actions">
            <Link className="button lp-cta-white" to="/register">Create your account <ArrowRight size={16} /></Link>
            <Link className="button lp-cta-outline" to="/how-it-works">Learn how it works</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

// ═══════════════════════════════════════════════════════════════
//  HOW IT WORKS PAGE
// ═══════════════════════════════════════════════════════════════
function HowItWorksPage() {
  const journey = [
    {
      step: '01', icon: <Camera size={28} />, color: '#edf7d5', iconColor: '#2e7d52',
      title: 'Snap or describe your item',
      desc: 'Take a photo with your phone or upload an image. Our Gemini-powered AI instantly identifies the item, suggests the category, condition and estimated weight — saving you time on every request.',
      tip: 'AI scan works on e-waste, metal, paper, plastic, glass and textiles.',
    },
    {
      step: '02', icon: <MapPin size={28} />, color: '#dbeafe', iconColor: '#1d4ed8',
      title: 'Choose your pickup slot',
      desc: 'Pick a date, time and address that works for you. Our smart matching engine finds the best available verified collector in your area based on distance, capacity, categories and rating.',
      tip: 'Most pickups are matched within 30 minutes of booking.',
    },
    {
      step: '03', icon: <Truck size={28} />, color: '#fef3c7', iconColor: '#d97706',
      title: 'Collector arrives at your door',
      desc: 'Your verified collector arrives at the scheduled time. You get live status updates — from "On the way" to "Arrived". A secure QR handoff token ensures the right person collects your items.',
      tip: 'Every collector is background-verified and rated by customers.',
    },
    {
      step: '04', icon: <Recycle size={28} />, color: '#f3e8ff', iconColor: '#7c3aed',
      title: 'Items go to hub & recycler',
      desc: 'Collected items are batched at a verified hub, weighed and sent to a certified recycler. Every step is logged with timestamps, weights and proof images — fully traceable.',
      tip: 'You can follow the full chain in your dashboard.',
    },
    {
      step: '05', icon: <Award size={28} />, color: '#fce7f3', iconColor: '#be185d',
      title: 'Earn points & get certified',
      desc: 'After successful recycling, you earn eco points and receive a digital recycling certificate. Points can be redeemed for free pickups, discounts and green rewards.',
      tip: '10 base points + category rate per kg collected.',
    },
  ]

  const roles = [
    {
      icon: <User size={24} />, title: 'For Customers', color: 'green',
      points: ['Book pickups in under 2 minutes', 'AI-assisted item identification', 'Live collector tracking', 'Eco points & digital certificates', 'Full recycling chain visibility'],
    },
    {
      icon: <Truck size={24} />, title: 'For Collectors', color: 'blue',
      points: ['Receive matched pickup requests', 'Clear route and item details', 'QR-based secure handoffs', 'Build your rating and trust score', 'Fair, transparent earnings'],
    },
    {
      icon: <Recycle size={24} />, title: 'For Hubs & Recyclers', color: 'purple',
      points: ['Receive verified batches from hubs', 'Record processing stages', 'Issue recycling certificates', 'Full custody chain audit log', 'Analytics and weight reports'],
    },
  ]

  const faqs = [
    ['Is the AI scan mandatory?', 'No. The AI scan is a helpful starting point. You can skip it and fill in all item details manually — category, condition, weight and more.'],
    ['How are collectors verified?', 'Every collector goes through identity verification, background checks and category training before being listed. They are rated after every pickup.'],
    ['What items can I recycle?', 'We accept e-waste, metals, paper, cardboard, plastic, glass and textiles. Hazardous materials like batteries and chemicals require special handling — contact support.'],
    ['How long does a pickup take?', 'Most pickups are matched within 30 minutes. The collector arrives at your chosen time slot. The whole process from booking to collection takes under 24 hours for most requests.'],
    ['What is the QR handoff token?', 'A one-time secure token generated for each pickup. The collector scans it at your door to confirm identity and start the official handoff — no cash, no confusion.'],
    ['Can I cancel a pickup?', 'Yes. You can cancel any pickup that has not yet been accepted by a collector. Once accepted, please contact support for assistance.'],
  ]

  return (
    <main>
      {/* Hero */}
      <section className="piw-hero">
        <div className="container piw-hero__inner">
          <motion.div className="piw-hero__copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="eyebrow piw-eyebrow"><Recycle size={14} /> How Kabadivala works</span>
            <h1>From your doorstep<br />to <em>certified recycling</em>.</h1>
            <p>One simple, transparent journey connects your home to a verified collector, a trusted hub and a certified recycler — with proof at every step.</p>
            <div className="piw-hero__actions">
              <Link className="button primary" to="/register">Start recycling free <ArrowRight size={16} /></Link>
              <a className="button secondary" href="#journey">See the journey ↓</a>
            </div>
          </motion.div>
          <motion.div className="piw-hero__visual" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <div className="piw-chain-visual">
              {['🏠 Your home', '🚛 Collector', '🏭 Hub', '♻ Recycler', '🏆 Certificate'].map((node, i) => (
                <div key={node} className="piw-chain-row">
                  <div className="piw-chain-node">{node}</div>
                  {i < 4 && <div className="piw-chain-connector"><div className="piw-chain-dot" /><div className="piw-chain-line" /><div className="piw-chain-dot" /></div>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Journey steps */}
      <section id="journey" className="section piw-journey-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Step by step</span>
            <h2>The complete Kabadivala journey.</h2>
            <p>Every step is designed to be simple for you and traceable for everyone in the chain.</p>
          </div>
          <div className="piw-journey">
            {journey.map((j, i) => (
              <motion.div className="piw-step" key={j.step} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.1 }}>
                <div className="piw-step__num">{j.step}</div>
                <div className="piw-step__icon" style={{ background: j.color, color: j.iconColor }}>{j.icon}</div>
                <div className="piw-step__body">
                  <h3>{j.title}</h3>
                  <p>{j.desc}</p>
                  <div className="piw-step__tip"><Sparkles size={13} /> {j.tip}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="section piw-roles-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Built for everyone</span>
            <h2>One platform, four roles.</h2>
            <p>Whether you are a household, a collector, a hub manager or a recycler — Kabadivala has a workspace built for you.</p>
          </div>
          <div className="piw-roles">
            {roles.map((r, i) => (
              <motion.div className={`piw-role piw-role--${r.color}`} key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <div className="piw-role__icon">{r.icon}</div>
                <h3>{r.title}</h3>
                <ul>
                  {r.points.map((pt) => <li key={pt}><CheckCircle2 size={14} /> {pt}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section light piw-faq-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Common questions</span>
            <h2>Everything you need to know.</h2>
          </div>
          <div className="piw-faq">
            {faqs.map(([q, a], i) => (
              <motion.details className="lp-faq__item" key={q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <summary>{q}</summary>
                <p>{a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-final-cta">
        <div className="container lp-final-cta__inner">
          <span className="eyebrow" style={{ color: '#dff3a6' }}>Ready to start?</span>
          <h2>Book your first pickup today.</h2>
          <p>It takes less than 2 minutes. No fees, no commitments — just responsible recycling.</p>
          <div className="lp-final-cta__actions">
            <Link className="button lp-cta-white" to="/register">Create free account <ArrowRight size={16} /></Link>
            <Link className="button lp-cta-outline" to="/impact">See our impact</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

// ═══════════════════════════════════════════════════════════════
//  OUR IMPACT PAGE
// ═══════════════════════════════════════════════════════════════
function OurImpactPage() {
  const impactStats = [
    { value: '10,000+', label: 'Pickups completed', icon: <Package size={22} />, color: 'green' },
    { value: '50 tons', label: 'Material recycled', icon: <Recycle size={22} />, color: 'lime' },
    { value: '500+', label: 'Verified collectors', icon: <Truck size={22} />, color: 'blue' },
    { value: '20+ cities', label: 'Across India', icon: <MapPin size={22} />, color: 'orange' },
    { value: '₹12L+', label: 'Collector earnings', icon: <Award size={22} />, color: 'purple' },
    { value: '4.9 / 5', label: 'Average rating', icon: <Star size={22} />, color: 'yellow' },
  ]

  const materials = [
    { name: 'E-waste', kg: '18,400 kg', pct: 37, color: '#3b82f6', icon: '💻' },
    { name: 'Metal', kg: '12,200 kg', pct: 24, color: '#f59e0b', icon: '🔩' },
    { name: 'Paper', kg: '9,800 kg', pct: 20, color: '#10b981', icon: '📄' },
    { name: 'Plastic', kg: '6,100 kg', pct: 12, color: '#8b5cf6', icon: '♻' },
    { name: 'Glass', kg: '2,500 kg', pct: 5, color: '#06b6d4', icon: '🍶' },
    { name: 'Textile', kg: '1,000 kg', pct: 2, color: '#ec4899', icon: '👕' },
  ]

  const milestones = [
    { date: 'Jan 2024', title: 'Kabadivala launched', desc: 'Started with 10 collectors in Delhi NCR and 50 beta customers.' },
    { date: 'Mar 2024', title: '1,000 pickups milestone', desc: 'Reached our first 1,000 successful pickups across 3 cities.' },
    { date: 'Jun 2024', title: 'AI scan launched', desc: 'Integrated Gemini AI for instant item identification and category suggestion.' },
    { date: 'Sep 2024', title: '10 cities live', desc: 'Expanded to Mumbai, Bangalore, Hyderabad, Chennai and 6 more cities.' },
    { date: 'Dec 2024', title: '10,000 pickups & 50 tons recycled', desc: 'Crossed major milestones with 500+ verified collectors nationwide.' },
    { date: '2025', title: 'Pan-India expansion', desc: 'Targeting 50 cities, hub network expansion and recycler partnerships.' },
  ]

  const sdgs = [
    { num: '11', title: 'Sustainable Cities', desc: 'Cleaner communities through organised waste collection.' },
    { num: '12', title: 'Responsible Consumption', desc: 'Closing the loop on material use with traceable recycling.' },
    { num: '13', title: 'Climate Action', desc: 'Reducing landfill waste and carbon emissions from improper disposal.' },
    { num: '8', title: 'Decent Work', desc: 'Fair, dignified livelihoods for local collectors and hub workers.' },
  ]

  return (
    <main>
      {/* Hero */}
      <section className="imp-hero">
        <div className="container imp-hero__inner">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="eyebrow imp-eyebrow"><Leaf size={14} /> Our environmental impact</span>
            <h1>Every kilogram tells<br />a <em>story of change</em>.</h1>
            <p>Kabadivala connects people, proof and progress so responsible recycling becomes measurable, traceable and rewarding for everyone in the chain.</p>
            <div className="imp-hero__actions">
              <Link className="button primary" to="/register">Join the movement <ArrowRight size={16} /></Link>
              <a className="button secondary" href="#stats">See the numbers ↓</a>
            </div>
          </motion.div>
          <motion.div className="imp-hero__visual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="imp-earth">
              <div className="imp-earth__ring" />
              <div className="imp-earth__core">🌍</div>
              <div className="imp-earth__chip imp-earth__chip--1"><Leaf size={13} /> 50 tons saved</div>
              <div className="imp-earth__chip imp-earth__chip--2"><Recycle size={13} /> 10K+ pickups</div>
              <div className="imp-earth__chip imp-earth__chip--3"><Award size={13} /> Certified</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats grid */}
      <section id="stats" className="section light imp-stats-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">By the numbers</span>
            <h2>Real impact, real numbers.</h2>
            <p>Every stat below represents a real pickup, a real collector and a real step toward a cleaner India.</p>
          </div>
          <div className="imp-stats">
            {impactStats.map((s, i) => (
              <motion.div className={`imp-stat imp-stat--${s.color}`} key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="imp-stat__icon">{s.icon}</div>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Material breakdown */}
      <section className="section imp-materials-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Material breakdown</span>
            <h2>What we have recycled so far.</h2>
            <p>Every category is tracked, weighed and certified through our verified recycler network.</p>
          </div>
          <div className="imp-materials">
            {materials.map((m, i) => (
              <motion.div className="imp-material" key={m.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <div className="imp-material__head">
                  <span className="imp-material__emoji">{m.icon}</span>
                  <div>
                    <b>{m.name}</b>
                    <small>{m.kg} recycled</small>
                  </div>
                  <span className="imp-material__pct">{m.pct}%</span>
                </div>
                <div className="imp-material__bar">
                  <motion.div className="imp-material__fill" style={{ background: m.color }} initial={{ width: 0 }} whileInView={{ width: `${m.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.07 + 0.2 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline milestones */}
      <section className="section light imp-timeline-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Our journey</span>
            <h2>Milestones that matter.</h2>
          </div>
          <div className="imp-timeline">
            {milestones.map((m, i) => (
              <motion.div className="imp-milestone" key={m.date} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="imp-milestone__date">{m.date}</div>
                <div className="imp-milestone__dot" />
                <div className="imp-milestone__body">
                  <b>{m.title}</b>
                  <p>{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SDGs */}
      <section className="section imp-sdg-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="eyebrow">Global goals</span>
            <h2>Aligned with UN Sustainable Development Goals.</h2>
            <p>Our work directly contributes to four of the 17 UN SDGs — making local action part of a global mission.</p>
          </div>
          <div className="imp-sdgs">
            {sdgs.map((s, i) => (
              <motion.div className="imp-sdg" key={s.num} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="imp-sdg__num">SDG {s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-final-cta">
        <div className="container lp-final-cta__inner">
          <span className="eyebrow" style={{ color: '#dff3a6' }}>Be part of the change</span>
          <h2>Your next pickup adds to this story.</h2>
          <p>Every kilogram you recycle through Kabadivala is tracked, certified and counted toward a cleaner India.</p>
          <div className="lp-final-cta__actions">
            <Link className="button lp-cta-white" to="/register">Start recycling today <ArrowRight size={16} /></Link>
            <Link className="button lp-cta-outline" to="/how-it-works">How it works</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export function PublicInfoPage({ kind }) {
  return kind === 'impact' ? <OurImpactPage /> : <HowItWorksPage />
}

const authSchema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(8, 'Use at least 8 characters') })
const rolePath = (role) => ({ ADMIN: '/admin/dashboard', HUB_MANAGER: '/hub/dashboard', RECYCLER: '/recycler/dashboard', COLLECTOR: '/collector/dashboard', CUSTOMER: '/customer/dashboard' }[role] || '/dashboard')
const Field = forwardRef(function Field({ label, error, ...props }, ref) {
  return (
    <label className="auth-field">
      <span className="auth-field__label">{label}</span>
      <input ref={ref} className="auth-field__input" {...props} />
      {error && <small className="auth-field__error"><CircleAlert size={12} /> {error}</small>}
    </label>
  )
})

// ─── Auth Layout Shell ────────────────────────────────────────────────────────
function AuthShell({ children, side }) {
  return (
    <div className="auth-shell">
      {/* Left panel — form */}
      <div className="auth-shell__form">
        <div className="auth-shell__form-inner">
          <Link className="auth-shell__logo" to="/">
            <span className="brand-mark"><Recycle size={18} /></span>
            <span className="logo-text">Kabadivala</span>
          </Link>
          {children}
        </div>
      </div>
      {/* Right panel — visual */}
      <div className="auth-shell__visual">
        <div className="auth-shell__visual-inner">
          {side}
        </div>
      </div>
    </div>
  )
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(authSchema) })

  const submit = async (values) => {
    try { const result = await login(values); navigate(rolePath(result.data.user.role)) }
    catch (e) { setError(e.response?.data?.message || 'Unable to sign in. Check your credentials.') }
  }

  const demoAccounts = [
    { label: 'Customer', email: 'customer@demo.com', role: 'customer' },
    { label: 'Collector', email: 'collector@demo.com', role: 'collector' },
    { label: 'Hub Manager', email: 'hub@demo.com', role: 'hub' },
  ]

  const side = (
    <div className="auth-visual-content">
      <div className="auth-visual-icon"><Recycle size={48} /></div>
      <h2>Welcome back to Kabadivala</h2>
      <p>Sign in to track your pickups, eco points and recycling impact — all in one place.</p>
      <div className="auth-visual-features">
        {[
          [<Truck size={16} />, 'Live pickup tracking'],
          [<Leaf size={16} />, 'Eco points & rewards'],
          [<ShieldCheck size={16} />, 'Verified collectors'],
          [<Award size={16} />, 'Digital certificates'],
        ].map(([icon, text]) => (
          <div className="auth-visual-feature" key={text}>{icon}<span>{text}</span></div>
        ))}
      </div>
      <div className="auth-visual-demo">
        <div className="auth-visual-demo__label"><Clock3 size={13} /> Demo credentials</div>
        <div className="auth-visual-demo__pass">Password: <b>Demo@12345</b></div>
        <div className="auth-visual-demo__accounts">
          {demoAccounts.map((d) => (
            <div className="auth-visual-demo__account" key={d.label}>
              <span className={`auth-demo-badge auth-demo-badge--${d.role}`}>{d.label}</span>
              <code>{d.email}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <AuthShell side={side}>
      <motion.div className="auth-form-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="auth-form-head">
          <h1>Sign in</h1>
          <p>Enter your credentials to access your workspace.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(submit)}>
          <Field label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <div className="auth-pass-wrap">
            <Field label="Password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" error={errors.password?.message} {...register('password')} />
            <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? 'Hide' : 'Show'}</button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CircleAlert size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button className="button primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? <><div className="auth-spinner" /> Signing in…</> : <><LogIn size={17} /> Sign in to workspace</>}
          </button>
        </form>

        <div className="auth-divider"><span>New to Kabadivala?</span></div>
        <Link className="button secondary auth-alt-btn" to="/register">Create a free account <ArrowRight size={15} /></Link>
      </motion.div>
    </AuthShell>
  )
}

// ─── Register Page ────────────────────────────────────────────────────────────
const registerSchema = authSchema.extend({ name: z.string().min(2, 'Enter your full name'), role: z.enum(['CUSTOMER', 'COLLECTOR']) })

export function RegisterPage() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { role: 'CUSTOMER' } })
  const selectedRole = watch('role')

  const submit = async (values) => {
    try { const result = await createAccount(values); navigate(result.data.user.role === 'COLLECTOR' ? '/collector/dashboard' : '/customer/dashboard') }
    catch (e) { setError(e.response?.data?.message || 'Unable to create account. Try again.') }
  }

  const roleCards = [
    {
      value: 'CUSTOMER', icon: <User size={22} />, title: 'Customer',
      desc: 'Book pickups, earn eco points and track your recycling impact.',
      perks: ['Free to join', 'AI item scan', 'Eco certificates'],
    },
    {
      value: 'COLLECTOR', icon: <Truck size={22} />, title: 'Collector',
      desc: 'Receive pickup requests, build your rating and earn fairly.',
      perks: ['Flexible schedule', 'Fair earnings', 'Verified badge'],
    },
  ]

  const side = (
    <div className="auth-visual-content">
      <div className="auth-visual-icon"><Leaf size={48} /></div>
      <h2>Join 10,000+ people making recycling count.</h2>
      <p>Create your free account and become part of India's most transparent recycling network.</p>
      <div className="auth-visual-stats">
        {[['10K+', 'Pickups done'], ['500+', 'Collectors'], ['50T', 'Recycled'], ['4.9★', 'Rating']].map(([v, l]) => (
          <div className="auth-visual-stat" key={l}><strong>{v}</strong><span>{l}</span></div>
        ))}
      </div>
      <div className="auth-visual-trust">
        <ShieldCheck size={15} /> Your data is safe · No spam · Cancel anytime
      </div>
    </div>
  )

  return (
    <AuthShell side={side}>
      <motion.div className="auth-form-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="auth-form-head">
          <h1>Create your account</h1>
          <p>Join a more responsible recycling chain — free forever.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(submit)}>
          {/* Role selector */}
          <div className="auth-role-label">I am joining as</div>
          <div className="auth-role-cards">
            {roleCards.map((rc) => (
              <label key={rc.value} className={`auth-role-card ${selectedRole === rc.value ? 'auth-role-card--active' : ''}`}>
                <input type="radio" value={rc.value} {...register('role')} className="visually-hidden" />
                <div className="auth-role-card__icon">{rc.icon}</div>
                <div className="auth-role-card__body">
                  <b>{rc.title}</b>
                  <small>{rc.desc}</small>
                  <div className="auth-role-card__perks">
                    {rc.perks.map((p) => <span key={p}><CheckCircle2 size={11} /> {p}</span>)}
                  </div>
                </div>
                <div className="auth-role-card__check"><CheckCircle2 size={18} /></div>
              </label>
            ))}
          </div>

          <Field label="Full name" placeholder="Rajender Mohan" error={errors.name?.message} {...register('name')} />
          <Field label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <div className="auth-pass-wrap">
            <Field label="Password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" error={errors.password?.message} {...register('password')} />
            <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? 'Hide' : 'Show'}</button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CircleAlert size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button className="button primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? <><div className="auth-spinner" /> Creating account…</> : <><ArrowRight size={17} /> Create free account</>}
          </button>

          <p className="auth-terms">By creating an account you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
        </form>

        <div className="auth-divider"><span>Already have an account?</span></div>
        <Link className="button secondary auth-alt-btn" to="/login"><LogIn size={15} /> Sign in instead</Link>
      </motion.div>
    </AuthShell>
  )
}

// ─── Shared UI primitives ────────────────────────────────────────────────────
const fadeUp = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } }
const stagger = (i) => ({ ...fadeUp, transition: { duration: 0.3, delay: i * 0.07 } })

function PageHeader({ eyebrow, title, copy, action }) {
  return (
    <motion.div className="ph" {...fadeUp}>
      <div className="ph__copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="ph__title">{title}</h1>
        {copy && <p className="ph__sub">{copy}</p>}
      </div>
      {action && <div className="ph__action">{action}</div>}
    </motion.div>
  )
}

function StatCard({ icon, label, value, sub, color = 'green', delay = 0 }) {
  return (
    <motion.div className={`sc sc--${color}`} {...stagger(delay)}>
      {icon && <span className="sc__icon">{icon}</span>}
      <strong className="sc__val">{value}</strong>
      <span className="sc__label">{label}</span>
      {sub && <small className="sc__sub">{sub}</small>}
    </motion.div>
  )
}

function PickupStatusBadge({ status }) {
  const map = {
    COLLECTED: 'success', ACCEPTED: 'success', ARRIVED: 'success',
    REQUESTED: 'warn', MATCHING: 'warn', ASSIGNED: 'warn',
    COLLECTOR_ON_THE_WAY: 'info',
    CANCELLED: 'danger', REJECTED: 'danger',
  }
  return <span className={`badge2 badge2--${map[status] || 'default'}`}>{statusLabels(status)}</span>
}

function PickupCard({ pickup, to }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Link className="pcard" to={to || `/customer/pickups/${pickup.id}`}>
        <div className="pcard__icon"><Package size={18} /></div>
        <div className="pcard__body">
          <b>{pickup.pickupCode}</b>
          <small>{pickup.category} · {pickup.quantity || 1} item(s)</small>
        </div>
        <PickupStatusBadge status={pickup.status} />
        <small className="pcard__date"><Calendar size={12} /> {new Date(pickup.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</small>
        <ChevronRight size={16} className="pcard__arrow" />
      </Link>
    </motion.div>
  )
}

function Panel({ title, action, children, className = '' }) {
  return (
    <motion.section className={`panel2 ${className}`} {...fadeUp}>
      {(title || action) && (
        <div className="panel2__head">
          {title && <h2 className="panel2__title">{title}</h2>}
          {action && <div className="panel2__action">{action}</div>}
        </div>
      )}
      {children}
    </motion.section>
  )
}

// ─── Customer Dashboard ──────────────────────────────────────────────────────
function CustomerDashboard() {
  const state = useLoad(() => api.get('/pickups'))
  const points = useLoad(() => api.get('/points'))
  const active = state.data?.pickups?.filter((p) => !['COLLECTED', 'CANCELLED', 'REJECTED'].includes(p.status)).length || 0
  const completed = state.data?.pickups?.filter((p) => p.status === 'COLLECTED').length || 0

  return (
    <div className="dashboard-content">
      <PageHeader
        eyebrow="Customer workspace"
        title="Welcome back 👋"
        copy="Track your pickups, eco points and recycling impact."
        action={<Link className="button primary" to="/customer/pickups/new"><Plus size={16} /> New pickup</Link>}
      />
      <div className="sc-grid">
        <StatCard icon={<Truck size={20} />} label="Active pickups" value={active} sub="Live requests" delay={0} />
        <StatCard icon={<Leaf size={20} />} label="Eco points" value={points.data?.total || 0} sub="Earned from collections" color="lime" delay={1} />
        <StatCard icon={<CheckCheck size={20} />} label="Completed" value={completed} sub="Responsible handoffs" color="blue" delay={2} />
      </div>
      <Panel title="Recent pickups" action={<Link className="panel2__link" to="/customer/pickups">View all <ChevronRight size={14} /></Link>}>
        <State state={state}>
          {state.data?.pickups?.length
            ? state.data.pickups.slice(0, 5).map((p) => <PickupCard pickup={p} key={p.id} />)
            : <EmptyState message="Your pickup journey starts here. Book your first pickup!" />}
        </State>
      </Panel>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  return user?.role === 'COLLECTOR' ? <CollectorDashboard /> : <CustomerDashboard />
}

// ─── Customer Pickups ────────────────────────────────────────────────────────
export function CustomerPickupsPage() {
  const state = useLoad(() => api.get('/pickups'))
  const [filter, setFilter] = useState('ALL')
  const filters = ['ALL', 'REQUESTED', 'ASSIGNED', 'COLLECTED', 'CANCELLED']
  const pickups = state.data?.pickups?.filter((p) => filter === 'ALL' || p.status === filter) || []

  return (
    <div className="dashboard-content">
      <PageHeader
        eyebrow="Customer workspace"
        title="My pickups"
        copy="All your pickup requests in one place."
        action={<Link className="button primary" to="/customer/pickups/new"><Plus size={16} /> New pickup</Link>}
      />
      <div className="filter-tabs">
        {filters.map((f) => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All' : statusLabels(f)}
          </button>
        ))}
      </div>
      <Panel>
        <State state={state}>
          {pickups.length
            ? pickups.map((p) => <PickupCard pickup={p} key={p.id} />)
            : <EmptyState message="No pickups found for this filter." />}
        </State>
      </Panel>
    </div>
  )
}

export function LegacyNewPickupPage() { return null }

// ─── Pickup Detail ───────────────────────────────────────────────────────────
export function PickupDetailPage() {
  const { id } = useParams()
  const state = useLoad(() => api.get(`/pickups/${id}`), [id])
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState('error')
  const [qr, setQr] = useState('')
  const [busy, setBusy] = useState(false)

  const transition = async (status) => {
    setBusy(true)
    try { await api.patch(`/pickups/${id}/status`, { status }); setMsgType('success'); setMessage('Status updated'); window.location.reload() }
    catch (e) { setMsgType('error'); setMessage(e.response?.data?.message || 'Action not permitted') }
    finally { setBusy(false) }
  }
  const match = async () => {
    setBusy(true)
    try { await api.post(`/pickups/${id}/match`); window.location.reload() }
    catch (e) { setMsgType('error'); setMessage(e.response?.data?.message || 'Matching failed') }
    finally { setBusy(false) }
  }

  const pickup = state.data?.pickup
  const timelineIcons = { REQUESTED: <Clock size={14} />, MATCHING: <RefreshCw size={14} />, ASSIGNED: <Truck size={14} />, COLLECTED: <CheckCircle2 size={14} />, CANCELLED: <XCircle size={14} /> }

  return (
    <div className="dashboard-content">
      <State state={state}>
        {pickup && (
          <motion.div {...fadeUp}>
            <PageHeader
              eyebrow="Pickup details"
              title={pickup.pickupCode}
              copy={`${pickup.category} · ${pickup.quantity || 1} item(s)`}
              action={<PickupStatusBadge status={pickup.status} />}
            />
            <div className="detail-grid2">
              <div>
                <Panel title="Request summary">
                  <div className="detail-info-grid">
                    <div className="detail-info-item"><MapPin size={15} /><div><small>Address</small><b>{pickup.address}</b></div></div>
                    <div className="detail-info-item"><Calendar size={15} /><div><small>Schedule</small><b>{new Date(pickup.pickupDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })} · {pickup.timeSlot}</b></div></div>
                    <div className="detail-info-item"><Package size={15} /><div><small>Item details</small><b>{pickup.itemDetails}</b></div></div>
                    <div className="detail-info-item"><Weight size={15} /><div><small>Est. weight</small><b>{pickup.estimatedWeight || '—'} kg</b></div></div>
                  </div>
                  <PickupImages images={pickup.images} />
                  {message && <p className={msgType === 'success' ? 'success-text mt-8' : 'form-error mt-8'}>{message}</p>}
                  <div className="form-actions mt-16">
                    {['REQUESTED', 'REJECTED'].includes(pickup.status) && (
                      <button className="button primary" onClick={match} disabled={busy}><RefreshCw size={15} /> Find collector</button>
                    )}
                    {['REQUESTED', 'MATCHING', 'ASSIGNED', 'ACCEPTED'].includes(pickup.status) && (
                      <button className="button secondary" onClick={() => transition('CANCELLED')} disabled={busy}><XCircle size={15} /> Cancel pickup</button>
                    )}
                  </div>
                </Panel>

                <Panel title="Secure handoff QR">
                  <p className="text-muted">Generate a one-time verification token for the collector handoff.</p>
                  <button className="button secondary mt-12" onClick={async () => { const r = await api.get(`/pickups/${id}/qr`); setQr(r.data.data.token) }}>
                    Generate QR token
                  </button>
                  {qr && <code className="qr-code">{qr}</code>}
                </Panel>
              </div>

              <Panel title="Live timeline" className="timeline-panel">
                <div className="timeline2">
                  {pickup.events?.map((entry, i) => (
                    <motion.div className="tl-step" key={entry.id} {...stagger(i)}>
                      <div className="tl-dot">{timelineIcons[entry.status] || <CheckCircle2 size={14} />}</div>
                      <div className="tl-body">
                        <b>{statusLabels(entry.status)}</b>
                        <small>{new Date(entry.createdAt).toLocaleString('en-IN')} · {entry.actor?.name || 'Kabadivala'}</small>
                        {entry.note && <p>{entry.note}</p>}
                      </div>
                    </motion.div>
                  ))}
                  {!pickup.events?.length && <EmptyState message="Timeline events will appear as your pickup progresses." />}
                </div>
              </Panel>
            </div>
          </motion.div>
        )}
      </State>
    </div>
  )
}

// ─── Profile ─────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: user })
  const submit = async (values) => {
    await api.patch('/auth/profile', { ...values, capacityKg: values.capacityKg ? Number(values.capacityKg) : null, available: values.available === true || values.available === 'true' })
    setSaved('Profile saved successfully!')
    setTimeout(() => setSaved(''), 3000)
  }

  return (
    <div className="dashboard-content narrow">
      <PageHeader eyebrow="Account" title="Your profile" copy="Keep your details up to date for the best experience." />
      <Panel>
        <div className="profile-avatar-row">
          <div className="profile-avatar">{user?.name?.slice(0, 1)}</div>
          <div><b>{user?.name}</b><small>{user?.email}</small><span className="badge2 badge2--success" style={{ marginTop: 6 }}>{user?.role?.replace('_', ' ')}</span></div>
        </div>
        <form className="form-grid mt-24" onSubmit={handleSubmit(submit)}>
          <Field label="Full name" {...register('name')} />
          <Field label="Phone number" {...register('phone')} />
          <Field label="Address" {...register('address')} />
          {user?.role === 'COLLECTOR' && <>
            <Field label="Service area" {...register('serviceArea')} />
            <Field label="Supported categories" placeholder="metal,paper,plastic" {...register('supportedCategories')} />
            <Field label="Capacity (kg)" type="number" {...register('capacityKg')} />
          </>}
          <div className="form-actions">
            <button className="button primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save profile'}</button>
            <AnimatePresence>{saved && <motion.span className="success-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{saved}</motion.span>}</AnimatePresence>
          </div>
        </form>
      </Panel>
    </div>
  )
}

// ─── Eco Points ──────────────────────────────────────────────────────────────
export function PointsPage() {
  const state = useLoad(() => api.get('/points'))

  return (
    <div className="dashboard-content">
      <PageHeader eyebrow="Impact wallet" title="Eco points" copy="Earn points for every responsible handoff. 10 base + category rate per kg." />
      <State state={state}>
        {state.data && (
          <>
            <motion.div className="points-hero2" {...fadeUp}>
              <div className="points-hero2__icon"><Leaf size={36} /></div>
              <div>
                <strong>{state.data.total}</strong>
                <span>Total eco points earned</span>
              </div>
              <div className="points-hero2__badges">
                <div className="points-badge"><Award size={16} /> Green contributor</div>
              </div>
            </motion.div>
            <Panel title="Points history">
              {state.data.transactions?.length
                ? state.data.transactions.map((t, i) => (
                  <motion.div className="points-row" key={t.id} {...stagger(i)}>
                    <div className="points-row__icon"><TrendingUp size={16} /></div>
                    <div className="points-row__body"><b>+{t.points} points</b><small>{t.reason}</small></div>
                    <time>{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                  </motion.div>
                ))
                : <EmptyState message="Collect your first pickup to start earning eco points!" />}
            </Panel>
          </>
        )}
      </State>
    </div>
  )
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export function ReviewsPage() {
  const state = useLoad(() => api.get('/reviews'))

  return (
    <div className="dashboard-content">
      <PageHeader eyebrow="Trust & feedback" title="My reviews" copy="Reviews from collectors and customers after completed pickups." />
      <Panel>
        <State state={state}>
          {state.data?.reviews?.length
            ? state.data.reviews.map((r, i) => (
              <motion.div className="review-card" key={r.id} {...stagger(i)}>
                <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="review-comment">"{r.comment || 'No comment left.'}"</p>
                <small className="review-meta"><Package size={12} /> {r.pickup?.pickupCode}</small>
              </motion.div>
            ))
            : <EmptyState message="Reviews will appear after your completed pickups." />}
        </State>
      </Panel>
    </div>
  )
}

// ─── Complaints ──────────────────────────────────────────────────────────────
export function ComplaintsPage() {
  const state = useLoad(() => api.get('/complaints'))
  const pickups = useLoad(() => api.get('/pickups'))
  const [done, setDone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const data = new FormData(e.currentTarget)
    try {
      await api.post('/complaints', Object.fromEntries(data))
      setDone('Complaint submitted successfully!')
      e.currentTarget.reset()
      setTimeout(() => setDone(''), 4000)
    } catch (err) {
      setDone('')
    } finally { setSubmitting(false) }
  }

  const statusColor = { OPEN: 'warn', IN_REVIEW: 'info', RESOLVED: 'success', CLOSED: 'default' }

  return (
    <div className="dashboard-content">
      <PageHeader eyebrow="Support" title="Complaints" copy="Raise an issue with any pickup. Our team reviews every complaint." />
      <Panel title="Raise a complaint">
        <form className="form-grid" onSubmit={submit}>
          <label className="field">
            <span>Select pickup</span>
            <select name="pickupId" required>
              <option value="">Choose a pickup…</option>
              {pickups.data?.pickups?.map((p) => <option value={p.id} key={p.id}>{p.pickupCode} — {p.category}</option>)}
            </select>
          </label>
          <Field label="Subject" name="subject" placeholder="Brief description of the issue" required />
          <Field label="Description" name="description" placeholder="Provide full details of your complaint" required />
          <div className="form-actions">
            <button className="button primary" disabled={submitting}><MessageSquare size={15} /> {submitting ? 'Submitting…' : 'Submit complaint'}</button>
            <AnimatePresence>{done && <motion.span className="success-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{done}</motion.span>}</AnimatePresence>
          </div>
        </form>
      </Panel>
      <Panel title="My complaints">
        <State state={state}>
          {state.data?.complaints?.length
            ? state.data.complaints.map((c, i) => (
              <motion.div className="complaint-row" key={c.id} {...stagger(i)}>
                <div className="complaint-row__body"><b>{c.subject}</b><small>{c.description}</small></div>
                <span className={`badge2 badge2--${statusColor[c.status] || 'default'}`}>{c.status?.replace('_', ' ')}</span>
              </motion.div>
            ))
            : <EmptyState message="No complaints raised yet." />}
        </State>
      </Panel>
    </div>
  )
}

// ─── Notifications ───────────────────────────────────────────────────────────
export function NotificationsPage() {
  const state = useLoad(() => api.get('/notifications'))

  return (
    <div className="dashboard-content">
      <PageHeader eyebrow="Updates" title="Notifications" copy="Stay updated on your pickups, points and account activity." />
      <Panel>
        <State state={state}>
          {state.data?.notifications?.length
            ? state.data.notifications.map((n, i) => (
              <motion.div className={`notif-row ${!n.readAt ? 'notif-row--unread' : ''}`} key={n.id} {...stagger(i)}>
                <div className="notif-dot" />
                <div className="notif-body"><b>{n.title}</b><small>{n.message}</small></div>
                <time>{new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
              </motion.div>
            ))
            : <EmptyState message="You are all caught up! No new notifications." />}
        </State>
      </Panel>
    </div>
  )
}

// ─── Collector Dashboard ─────────────────────────────────────────────────────
function CollectorDashboard() {
  const state = useLoad(() => api.get('/collector/requests'))
  const pending = state.data?.pickups?.filter((p) => ['REQUESTED', 'MATCHING', 'ASSIGNED'].includes(p.status)).length || 0

  return (
    <div className="dashboard-content">
      <PageHeader
        eyebrow="Collector workspace"
        title="Your collection route 🚛"
        copy="Accept requests, track your route and keep every handoff traceable."
        action={<Link className="button primary" to="/collector/requests">View all requests <ArrowRight size={16} /></Link>}
      />
      <div className="sc-grid">
        <StatCard icon={<Package size={20} />} label="Pending requests" value={pending} sub="Ready to accept" delay={0} />
        <StatCard icon={<Star size={20} />} label="Trust score" value="5.0 ★" sub="Verified collector" color="lime" delay={1} />
        <StatCard icon={<Truck size={20} />} label="Total requests" value={state.data?.pickups?.length || 0} sub="In your area" color="blue" delay={2} />
      </div>
      <Panel title="Incoming requests" action={<Link className="panel2__link" to="/collector/requests">See all <ChevronRight size={14} /></Link>}>
        <State state={state}>
          {state.data?.pickups?.slice(0, 4).map((p) => <CollectorRequestCard key={p.id} pickup={p} />) || <EmptyState message="No requests right now. Check back soon!" />}
        </State>
      </Panel>
    </div>
  )
}

function CollectorRequestCard({ pickup }) {
  const [accepting, setAccepting] = useState(false)
  const accept = async () => {
    setAccepting(true)
    try { await api.post(`/collector/requests/${pickup.id}/accept`); window.location.reload() }
    catch { setAccepting(false) }
  }

  return (
    <motion.div className="creq-card" layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="creq-card__icon"><Package size={18} /></div>
      <div className="creq-card__body">
        <b>{pickup.pickupCode}</b>
        <small><MapPin size={11} /> {pickup.address || pickup.customer?.address || 'Address on file'}</small>
        <small><Package size={11} /> {pickup.category}</small>
      </div>
      <div className="creq-card__actions">
        <PickupStatusBadge status={pickup.status} />
        {['REQUESTED', 'MATCHING', 'ASSIGNED'].includes(pickup.status) && (
          <button className="button primary small" onClick={accept} disabled={accepting}>{accepting ? '…' : 'Accept'}</button>
        )}
        <Link className="button secondary small" to={`/collector/requests/${pickup.id}`}>Details</Link>
      </div>
    </motion.div>
  )
}

export function CollectorRequestsPage() {
  const state = useLoad(() => api.get('/collector/requests'))

  return (
    <div className="dashboard-content">
      <PageHeader eyebrow="Collector workspace" title="Pickup requests" copy="All requests matched to your area, capacity and categories." />
      <Panel>
        <State state={state}>
          {state.data?.pickups?.length
            ? state.data.pickups.map((p) => <CollectorRequestCard key={p.id} pickup={p} />)
            : <EmptyState message="No requests match your route right now." />}
        </State>
      </Panel>
    </div>
  )
}

export function CollectorDetailPage() {
  const { id } = useParams()
  const state = useLoad(() => api.get(`/pickups/${id}`), [id])
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState('error')
  const [busy, setBusy] = useState(false)

  const advance = async (status) => {
    setBusy(true)
    try { await api.patch(`/pickups/${id}/status`, { status }); window.location.reload() }
    catch (e) { setMsgType('error'); setMessage(e.response?.data?.message || 'Action not permitted') }
    finally { setBusy(false) }
  }

  const collect = async (e) => {
    e.preventDefault()
    setBusy(true)
    const form = new FormData(e.currentTarget)
    try { await api.patch(`/collector/requests/${id}/collection`, form, { headers: { 'Content-Type': 'multipart/form-data' } }); window.location.reload() }
    catch (error) { setMsgType('error'); setMessage(error.response?.data?.message || 'Unable to record collection') }
    finally { setBusy(false) }
  }

  const pickup = state.data?.pickup
  const nextStatus = { ASSIGNED: 'ACCEPTED', ACCEPTED: 'COLLECTOR_ON_THE_WAY', COLLECTOR_ON_THE_WAY: 'ARRIVED' }
  const nextLabel = { ASSIGNED: 'Accept request', ACCEPTED: 'Start journey', COLLECTOR_ON_THE_WAY: 'Mark arrived' }

  return (
    <div className="dashboard-content">
      <State state={state}>
        {pickup && (
          <motion.div {...fadeUp}>
            <PageHeader eyebrow="Collector request" title={pickup.pickupCode} copy={`${pickup.category} · ${statusLabels(pickup.status)}`} action={<PickupStatusBadge status={pickup.status} />} />
            <div className="detail-grid2">
              <div>
                <Panel title="Customer & item details">
                  <div className="detail-info-grid">
                    <div className="detail-info-item"><User size={15} /><div><small>Customer</small><b>{pickup.customer?.name}</b></div></div>
                    <div className="detail-info-item"><MapPin size={15} /><div><small>Address</small><b>{pickup.address}</b></div></div>
                    <div className="detail-info-item"><Package size={15} /><div><small>Items</small><b>{pickup.itemDetails}</b></div></div>
                    <div className="detail-info-item"><Weight size={15} /><div><small>Est. weight</small><b>{pickup.estimatedWeight || '—'} kg</b></div></div>
                  </div>
                  <PickupImages images={pickup.images} label="Customer item photos" />
                  {message && <p className={`mt-12 ${msgType === 'success' ? 'success-text' : 'form-error'}`}>{message}</p>}
                  <div className="form-actions mt-16">
                    {nextStatus[pickup.status] && (
                      <button className="button primary" onClick={() => advance(nextStatus[pickup.status])} disabled={busy}>
                        <Truck size={15} /> {nextLabel[pickup.status]}
                      </button>
                    )}
                  </div>
                </Panel>

                {pickup.status === 'ARRIVED' && (
                  <Panel title="Record collection">
                    <form className="form-grid" onSubmit={collect}>
                      <label className="field"><span>Actual weight (kg)</span><input name="actualWeight" type="number" min="0.1" step="0.1" required /></label>
                      <label className="field"><span>Collection proof photo</span><input name="proof" type="file" accept="image/png,image/jpeg,image/webp" /></label>
                      <div className="form-actions"><button className="button primary" disabled={busy}><CheckCircle2 size={15} /> {busy ? 'Recording…' : 'Record collection'}</button></div>
                    </form>
                  </Panel>
                )}
              </div>

              <Panel title="Journey timeline" className="timeline-panel">
                <div className="timeline2">
                  {pickup.events?.map((e, i) => (
                    <motion.div className="tl-step" key={e.id} {...stagger(i)}>
                      <div className="tl-dot"><Truck size={13} /></div>
                      <div className="tl-body">
                        <b>{statusLabels(e.status)}</b>
                        <small>{new Date(e.createdAt).toLocaleString('en-IN')}</small>
                        {e.note && <p>{e.note}</p>}
                      </div>
                    </motion.div>
                  ))}
                  {!pickup.events?.length && <EmptyState message="Timeline will update as you progress." />}
                </div>
              </Panel>
            </div>
          </motion.div>
        )}
      </State>
    </div>
  )
}

export function CollectorHistoryPage() {
  const state = useLoad(() => api.get('/collector/history'))

  return (
    <div className="dashboard-content">
      <PageHeader eyebrow="Collector workspace" title="Collection history" copy="All your completed and past pickup collections." />
      <Panel>
        <State state={state}>
          {state.data?.pickups?.length
            ? state.data.pickups.map((p) => <CollectorRequestCard key={p.id} pickup={p} />)
            : <EmptyState message="Your completed collections will appear here." />}
        </State>
      </Panel>
    </div>
  )
}

export function CollectorAvailabilityPage() {
  const { user } = useAuth()
  const [available, setAvailable] = useState(user?.available ?? true)
  const [saving, setSaving] = useState(false)

  const toggle = async () => {
    const next = !available
    setSaving(true)
    setAvailable(next)
    await api.patch('/collector/availability', { available: next })
    setSaving(false)
  }

  return (
    <div className="dashboard-content narrow">
      <PageHeader eyebrow="Collector workspace" title="Availability" copy="Control when you receive new pickup requests." />
      <motion.div className="avail-card" {...fadeUp}>
        <div className={`avail-indicator ${available ? 'avail-indicator--on' : ''}`} />
        <div className="avail-icon"><Truck size={40} /></div>
        <h2>{available ? 'You are available' : 'You are paused'}</h2>
        <p>Smart matching uses your availability, service area, categories, capacity, distance, rating and current workload to assign requests.</p>
        <button className={`avail-toggle ${available ? 'avail-toggle--on' : ''}`} onClick={toggle} disabled={saving}>
          {saving ? 'Updating…' : available ? '🟢 Available — tap to pause' : '⏸ Paused — tap to go live'}
        </button>
        <div className="avail-tips">
          <div className="avail-tip"><CheckCircle2 size={14} /> Set your service area in profile</div>
          <div className="avail-tip"><CheckCircle2 size={14} /> Keep categories updated</div>
          <div className="avail-tip"><CheckCircle2 size={14} /> Maintain a high rating</div>
        </div>
      </motion.div>
    </div>
  )
}

export function CollectorRatingsPage() {
  const state = useLoad(() => api.get('/reviews'))
  const avg = state.data?.reviews?.length
    ? (state.data.reviews.reduce((s, r) => s + r.rating, 0) / state.data.reviews.length).toFixed(1)
    : '—'

  return (
    <div className="dashboard-content">
      <PageHeader eyebrow="Collector workspace" title="My ratings" copy="Customer feedback after completed pickups." />
      {state.data?.reviews?.length > 0 && (
        <motion.div className="rating-hero" {...fadeUp}>
          <div className="rating-hero__score">{avg}</div>
          <div><div className="rating-hero__stars">{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</div><small>{state.data.reviews.length} review{state.data.reviews.length !== 1 ? 's' : ''}</small></div>
        </motion.div>
      )}
      <Panel title="Customer reviews">
        <State state={state}>
          {state.data?.reviews?.length
            ? state.data.reviews.map((r, i) => (
              <motion.div className="review-card" key={r.id} {...stagger(i)}>
                <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="review-comment">"{r.comment || 'Customer left no comment.'}"</p>
              </motion.div>
            ))
            : <EmptyState message="Ratings arrive after completed pickups." />}
        </State>
      </Panel>
    </div>
  )
}

// ─── 404 / Forbidden ─────────────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <motion.div className="error-page" {...fadeUp}>
      <div className="error-page__code">404</div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link className="button primary" to="/">Return home</Link>
    </motion.div>
  )
}

export function ForbiddenPage() {
  return (
    <motion.div className="error-page" {...fadeUp}>
      <div className="error-page__code">403</div>
      <h1>Access restricted</h1>
      <p>This workspace is not available for your current role.</p>
      <Link className="button primary" to="/dashboard">Go to dashboard</Link>
    </motion.div>
  )
}

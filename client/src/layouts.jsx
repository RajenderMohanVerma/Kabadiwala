import { ArrowRight, ArrowUp, Bell, ChevronDown, ClipboardList, Home, LayoutDashboard, Leaf, LogOut, Menu, Recycle, Star, Truck, UserRound, X } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'

// ── Scroll to top on every route change ──────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// ── Back-to-top floating button ───────────────────────────────────────────────
function BackToTopButton() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <button
      className={`back-to-top${visible ? ' back-to-top--visible' : ''}`}
      onClick={scrollTop}
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  )
}

const customerNav = [
  ['Overview', LayoutDashboard, '/customer/dashboard'], ['My pickups', ClipboardList, '/customer/pickups'],
  ['Eco points', Leaf, '/customer/points'], ['Reviews', Star, '/customer/reviews'],
  ['Complaints', Bell, '/customer/complaints'], ['Certificates', Recycle, '/customer/certificates'], ['Bulk pickup', Truck, '/customer/bulk-pickup'], ['Notifications', Bell, '/customer/notifications'],
  ['Profile', UserRound, '/customer/profile']
]
const collectorNav = [
  ['Overview', LayoutDashboard, '/collector/dashboard'], ['Requests', ClipboardList, '/collector/requests'],
  ['Availability', Truck, '/collector/availability'], ['History', ClipboardList, '/collector/history'],
  ['Ratings', Star, '/collector/ratings'], ['Profile', UserRound, '/collector/profile']
]
const hubNav = [
  ['Overview', LayoutDashboard, '/hub/dashboard'], ['Collections', ClipboardList, '/hub/collections'], ['Batches', ClipboardList, '/hub/batches'],
  ['Inventory', Recycle, '/hub/inventory'], ['Analytics', Leaf, '/hub/analytics']
]
const recyclerNav = [
  ['Overview', LayoutDashboard, '/recycler/dashboard'], ['Batches', ClipboardList, '/recycler/batches'], ['Processing', Recycle, '/recycler/processing'],
  ['History', ClipboardList, '/recycler/history'], ['Analytics', Leaf, '/recycler/analytics'], ['Profile', UserRound, '/recycler/profile']
]
const adminNav = [
  ['Overview', LayoutDashboard, '/admin/dashboard'], ['Users', UserRound, '/admin/users'], ['Collectors', Truck, '/admin/collectors'], ['Hubs', Home, '/admin/hubs'],
  ['Recyclers', Recycle, '/admin/recyclers'], ['Pickups', ClipboardList, '/admin/pickups'], ['Batches', ClipboardList, '/admin/batches'],
  ['Complaints', Bell, '/admin/complaints'], ['Notifications', Bell, '/admin/notifications'], ['Analytics', Leaf, '/admin/analytics'], ['Audit logs', ClipboardList, '/admin/audit-logs']
]
export function PublicLayout() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // FAQ link — go to how-it-works page and scroll to faq section
  const handleFaqClick = (e) => {
    e.preventDefault()
    setMobileOpen(false)
    if (location.pathname === '/how-it-works') {
      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/how-it-works')
      setTimeout(() => {
        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
      }, 400)
    }
  }

  return (
    <>
      <ScrollToTop />

      {/* ── HEADER ── */}
      <header className={`pub-header${scrolled ? ' pub-header--scrolled' : ''}`}>
        <div className="pub-header__inner container">
          <Link className="logo" to="/">
            <span className="brand-mark"><Recycle size={20} /></span>
            <span className="logo-text">Kabadivala</span>
          </Link>

          {/* Desktop nav */}
          <nav className="pub-nav">
            <Link className={`pub-nav__link${location.pathname === '/how-it-works' ? ' active' : ''}`} to="/how-it-works">How it works</Link>
            <Link className={`pub-nav__link${location.pathname === '/impact' ? ' active' : ''}`} to="/impact">Our impact</Link>
            <button className="pub-nav__link pub-nav__link--btn" onClick={handleFaqClick}>FAQ</button>
            <div className="pub-nav__divider" />
            <Link className="pub-nav__signin" to="/login">Sign in</Link>
            <Link className="button primary pub-nav__cta" to="/register">Get started <ArrowRight size={15} /></Link>
          </nav>

          {/* Mobile hamburger */}
          <button className="pub-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="pub-drawer">
            <div className="pub-drawer__head">
              <Link className="logo" to="/" onClick={() => setMobileOpen(false)}>
                <span className="brand-mark"><Recycle size={18} /></span>
                <span className="logo-text">Kabadivala</span>
              </Link>
              <button className="pub-drawer__close" onClick={() => setMobileOpen(false)} aria-label="Close">✕</button>
            </div>
            <nav className="pub-drawer__nav">
              <Link to="/how-it-works" onClick={() => setMobileOpen(false)}>How it works</Link>
              <Link to="/impact" onClick={() => setMobileOpen(false)}>Our impact</Link>
              <button className="pub-drawer__nav-btn" onClick={handleFaqClick}>FAQ</button>
            </nav>
            <div className="pub-drawer__actions">
              <Link className="button secondary full" to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link className="button primary full" to="/register" onClick={() => setMobileOpen(false)}>Get started</Link>
            </div>
          </div>
        )}
        {mobileOpen && <div className="pub-drawer__scrim" onClick={() => setMobileOpen(false)} />}
      </header>

      <Outlet />
      <BackToTopButton />

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="container">
          {/* Top band */}
          <div className="footer-top">
            <div className="footer-brand">
              <Link className="logo footer-logo" to="/">
                <span className="brand-mark"><Recycle size={18} /></span>
                <span className="logo-text">Kabadivala</span>
              </Link>
              <p>Responsible recycling, made simple for every home and every handoff across India.</p>
              <div className="footer-badges">
                <span className="footer-badge">♻ Circular economy</span>
                <span className="footer-badge">🌿 Eco-certified</span>
                <span className="footer-badge">🤝 Fair trade</span>
              </div>
            </div>

            <div className="footer-links-group">
              <div className="footer-col">
                <b>Platform</b>
                <Link to="/how-it-works">How it works</Link>
                <Link to="/impact">Our impact</Link>
                <button className="footer-faq-btn" onClick={handleFaqClick}>FAQs</button>
              </div>
              <div className="footer-col">
                <b>Get started</b>
                <Link to="/register">Book a pickup</Link>
                <Link to="/login">Sign in</Link>
                <Link to="/register?role=COLLECTOR">Become a collector</Link>
              </div>
              <div className="footer-col">
                <b>Support</b>
                <a href="mailto:hello@kabadivala.example">Contact us</a>
                <a href="#">Privacy policy</a>
                <a href="#">Terms of service</a>
              </div>
            </div>
          </div>

          {/* Stats band */}
          <div className="footer-stats">
            <div className="footer-stat"><strong>10,000+</strong><span>Pickups completed</span></div>
            <div className="footer-stat"><strong>500+</strong><span>Verified collectors</span></div>
            <div className="footer-stat"><strong>50 tons</strong><span>Responsibly recycled</span></div>
            <div className="footer-stat"><strong>20+ cities</strong><span>Across India</span></div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <span>© 2026 Kabadivala · Built for a circular India 🇮🇳</span>
            <div className="footer-bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
export function AuthLayout() { return <Outlet /> }
export function DashboardLayout() {
  const [open, setOpen] = useState(false); const { user, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const signOut = () => { logout(); navigate('/') }
  const nav = user?.role === 'COLLECTOR' ? collectorNav : user?.role === 'HUB_MANAGER' ? hubNav : user?.role === 'RECYCLER' ? recyclerNav : user?.role === 'ADMIN' ? adminNav : customerNav
  const home = user?.role === 'COLLECTOR' ? '/collector/dashboard' : user?.role === 'HUB_MANAGER' ? '/hub/dashboard' : user?.role === 'RECYCLER' ? '/recycler/dashboard' : user?.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'
  return <div className="dashboard-shell"><aside className={open ? 'sidebar open' : 'sidebar'}><div className="side-brand"><Link className="logo" to={home}><span className="brand-mark"><Recycle size={18} /></span>Kabadivala</Link><button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label="Close menu"><X size={19} /></button></div><div className="side-label">{user?.role === 'COLLECTOR' ? 'Collector workspace' : `${user?.role?.replace('_', ' ')} workspace`}</div><nav className="side-nav">{nav.map(([label, Icon, href]) => <Link className={location.pathname === href || location.pathname.startsWith(`${href}/`) ? 'active' : ''} onClick={() => setOpen(false)} to={href} key={label}><Icon size={18} />{label}</Link>)}</nav><div className="side-bottom"><button onClick={signOut}><LogOut size={17} />Sign out</button></div></aside>{open && <div className="scrim" onClick={() => setOpen(false)} />}<div className="dashboard-main"><header className="dashboard-topbar"><button className="icon-button mobile-only" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumbs"><Home size={15} /> <span>/</span> Workspace</div><div className="top-actions"><div className="profile-pill"><span>{user?.name?.slice(0, 1)}</span><b>{user?.name}</b><ChevronDown size={15} /></div></div></header><Outlet /></div></div>
}
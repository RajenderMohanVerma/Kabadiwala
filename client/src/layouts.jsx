import { Bell, ChevronDown, ClipboardList, Home, LayoutDashboard, Leaf, LogOut, Menu, Recycle, Star, Truck, UserRound, X } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from './context/AuthContext'

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
export function PublicLayout() { return <><header className="site-header container"><Link className="logo" to="/"><span className="brand-mark"><Recycle size={19} /></span><span>Kabadivala</span></Link><nav><Link to="/#how">How it works</Link><Link to="/#impact">Our impact</Link><Link className="header-login" to="/login">Sign in <ChevronDown size={15} /></Link></nav></header><Outlet /><footer className="site-footer"><div className="container footer-inner"><Link className="logo" to="/"><span className="brand-mark"><Recycle size={17} /></span>Kabadivala</Link><span>© 2026 Kabadivala. Built for a circular India.</span><span>Fair work · Clean cities · Shared future</span></div></footer></> }
export function AuthLayout() { return <Outlet /> }
export function DashboardLayout() {
  const [open, setOpen] = useState(false); const { user, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const signOut = () => { logout(); navigate('/') }
  const nav = user?.role === 'COLLECTOR' ? collectorNav : user?.role === 'HUB_MANAGER' ? hubNav : user?.role === 'RECYCLER' ? recyclerNav : user?.role === 'ADMIN' ? adminNav : customerNav
  const home = user?.role === 'COLLECTOR' ? '/collector/dashboard' : user?.role === 'HUB_MANAGER' ? '/hub/dashboard' : user?.role === 'RECYCLER' ? '/recycler/dashboard' : user?.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'
  return <div className="dashboard-shell"><aside className={open ? 'sidebar open' : 'sidebar'}><div className="side-brand"><Link className="logo" to={home}><span className="brand-mark"><Recycle size={18} /></span>Kabadivala</Link><button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label="Close menu"><X size={19} /></button></div><div className="side-label">{user?.role === 'COLLECTOR' ? 'Collector workspace' : `${user?.role?.replace('_', ' ')} workspace`}</div><nav className="side-nav">{nav.map(([label, Icon, href]) => <Link className={location.pathname === href || location.pathname.startsWith(`${href}/`) ? 'active' : ''} onClick={() => setOpen(false)} to={href} key={label}><Icon size={18} />{label}</Link>)}</nav><div className="side-bottom"><button onClick={signOut}><LogOut size={17} />Sign out</button></div></aside>{open && <div className="scrim" onClick={() => setOpen(false)} />}<div className="dashboard-main"><header className="dashboard-topbar"><button className="icon-button mobile-only" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumbs"><Home size={15} /> <span>/</span> Workspace</div><div className="top-actions"><div className="profile-pill"><span>{user?.name?.slice(0, 1)}</span><b>{user?.name}</b><ChevronDown size={15} /></div></div></header><Outlet /></div></div>
}
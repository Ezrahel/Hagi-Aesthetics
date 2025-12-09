# Performance & Memory Optimization Analysis
## Hagi-Aesthetics Next.js Application

**Date:** Generated for OOM killer mitigation on 4GB VPS  
**Target:** Reduce memory footprint and CPU bottlenecks

---

## 1. Dependency Review (package.json)

| Dependency | Size Impact | Issue | Recommendation |
|------------|-------------|-------|----------------|
| `three` | ~600KB | Heavy 3D library loaded on homepage | **CRITICAL:** Use dynamic import with `ssr: false` for Scene component |
| `@react-three/fiber` | ~200KB | React wrapper for Three.js | Load only when Scene component is needed |
| `@react-three/drei` | ~150KB | Three.js helpers | Load only when Scene component is needed |
| `gsap` | ~100KB | Animation library | Use dynamic import for components using GSAP (Spinwheel) |
| `lenis` | ~20KB | Smooth scroll library | Use dynamic import with `ssr: false` |
| `@clerk/nextjs` | ~500KB | **UNUSED** | **REMOVE:** Not used anywhere in codebase (switched to Supabase) |
| `pg` | ~2MB | PostgreSQL client | **MOVE TO DEV:** Only needed for scripts, not runtime |
| `dotenv` | ~5KB | Environment loader | **REMOVE:** Next.js handles env vars natively |

**Total Potential Savings:** ~3.5MB+ from removing unused dependencies

---

## 2. Server Component & API Route Analysis

| File | Issue | Current Behavior | Optimization Suggestion |
|------|-------|------------------|------------------------|
| `src/app/api/create-checkout-session/route.js` | **Sequential Database Queries** | Lines 152-169: Products fetched sequentially, then order creation | **Use `Promise.all()`** to fetch products and validate coupon concurrently: `const [productsResult, couponResult] = await Promise.all([supabase.from('products').select(...), supabase.from('coupons').select(...)])` |
| `src/app/api/create-checkout-session/route.js` | **Sequential Stripe Operations** | Lines 300-350: Order creation → Stripe session → Order update | **Parallelize non-dependent operations:** Create Stripe session and Supabase order concurrently, then link them |
| `src/app/api/products/[id]/route.js` | **Sequential Fallback Queries** | Lines 16-65: Try UUID → Try productData → Try slug (3 sequential attempts) | **Refactor:** Use single query with OR condition or check productData first (in-memory, faster) before database lookup |
| `src/app/success/page.jsx` | **Sequential Operations** | Lines 260-283: Stripe retrieve → Supabase update → Email send | **Optimize:** Fire email send in background (non-blocking) using `setImmediate()` or queue, don't await it |
| `src/app/success/page.jsx` | **Heavy Email Template** | Lines 103-219: Large HTML template string built synchronously | **Optimize:** Move email template generation to separate function, use template literals more efficiently, or use a lightweight template library |
| `src/app/checkout/page.js` | **Sequential Auth Checks** | Lines 65-79: getUser → onAuthStateChange setup | **Optimize:** Combine auth state check with coupon loading using `Promise.all()` |

---

## 3. Client-Side Component Optimization (Code Splitting)

| Component | File | Issue | Current Import | Recommended Fix |
|-----------|------|-------|----------------|-----------------|
| **Scene (Three.js)** | `src/app/page.js` | **CRITICAL:** Heavy 3D library (~800KB) loaded on initial page load | `import Scene from '@/three/Scene'` | `const Scene = dynamic(() => import('@/three/Scene'), { ssr: false, loading: () => <div className="h-screen" /> })` |
| **Spinwheel** | `src/app/page.js` | Heavy GSAP animations loaded immediately | `import Spinwheel from '@/components/Spinwheel'` | `const Spinwheel = dynamic(() => import('@/components/Spinwheel'), { ssr: false })` |
| **Lenis Smooth Scroll** | `src/app/page.js` | Smooth scroll library loaded synchronously | `import Lenis from 'lenis'` | Move Lenis initialization to dynamic import or lazy load: `useEffect(() => { import('lenis').then(Lenis => { const lenis = new Lenis.default(); ... }) }, [])` |
| **Products Component** | `src/app/page.js` | Could be lazy loaded below fold | `import Products from '@/components/Products'` | `const Products = dynamic(() => import('@/components/Products'))` |
| **Whyus Component** | `src/app/page.js` | Below fold content | `import Whyus from '@/components/Whyus'` | `const Whyus = dynamic(() => import('@/components/Whyus'))` |
| **Ourvalues Component** | `src/app/page.js` | Below fold content | `import Ourvalues from '@/components/Ourvalues'` | `const Ourvalues = dynamic(() => import('@/components/Ourvalues'))` |
| **CTA Component** | `src/app/page.js` | Below fold content | `import CTA from '@/components/CTA'` | `const CTA = dynamic(() => import('@/components/CTA'))` |
| **Stripe.js** | `src/app/checkout/page.js` | Stripe SDK loaded on every checkout render | `import { loadStripe } from '@stripe/stripe-js'` | Already optimized with singleton pattern, but ensure it's not re-initialized |

---

## 4. Memory Leaks & Global State Issues

| File | Issue | Location | Problem | Fix |
|------|-------|----------|---------|-----|
| **Multiple Files** | **Global `stripePromise` Variables** | `src/app/checkout/page.js:9`, `src/app/shop/[slug]/page.js:10`, `src/components/Spinwheel.jsx:9` | Multiple global singletons can cause memory leaks if not properly cleaned | **Centralize:** Create `src/lib/stripe.js` with single `getStripe()` function, remove duplicates |
| **src/app/page.js** | **Lenis Instance Not Cleaned Up** | Lines 15-22 | Lenis instance created but never destroyed, causing memory leak | **Fix:** `useEffect(() => { const lenis = new Lenis(); const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); }; requestAnimationFrame(raf); return () => { lenis.destroy(); }; }, [])` |
| **src/components/Spinwheel.jsx** | **GSAP ScrollTrigger Not Cleaned** | Lines 67-115 | ScrollTrigger instances created but not killed on unmount | **Fix:** `useEffect(() => { ... return () => { ScrollTrigger.getAll().forEach(trigger => trigger.kill()); }; }, [])` |
| **src/utils/index.js** | **Large Static Object** | Lines 1-93 | `productData` and `Faqs` exported as large objects, loaded into memory on every import | **Consider:** Move to database or lazy-load, or at minimum ensure it's tree-shakeable |
| **src/app/api/products/[id]/route.js** | **Global Supabase Client** | Lines 5-8 | Supabase client created at module level, persists across requests | **Fix:** Create client per-request or use connection pooling: `function getSupabase() { return createClient(...) }` |
| **src/app/api/create-checkout-session/route.js** | **Global Stripe Instance** | Lines 13-30 | Stripe instance created at module level | **Acceptable:** Singleton pattern is fine for Stripe, but ensure error handling doesn't leak |

---

## 5. Next.js Configuration Optimizations

| Setting | Current | Recommended | Impact |
|---------|---------|-------------|--------|
| `output: 'standalone'` | **MISSING** | Add to `next.config.mjs` | Reduces Docker image size by ~70% |
| `experimental.optimizeCss` | Not set | `true` | Reduces CSS bundle size |
| `swcMinify` | Default | `true` (explicit) | Faster builds, smaller bundles |
| `compiler.removeConsole` | Not set | `process.env.NODE_ENV === 'production'` | Removes console.logs in production |
| `images.optimization` | Default | Configure domains/formats | Optimizes image loading |

---

## 6. High-Priority Action Items (Immediate Impact)

### **Priority 1: Remove Unused Dependencies**
```bash
npm uninstall @clerk/nextjs pg dotenv
```
**Expected Savings:** ~2.5MB+ in node_modules

### **Priority 2: Dynamic Import Heavy Components**
- Scene component (Three.js) - **CRITICAL**
- Spinwheel component (GSAP)
- Lenis smooth scroll

**Expected Savings:** ~800KB+ initial bundle reduction

### **Priority 3: Fix Memory Leaks**
- Clean up Lenis instance
- Clean up GSAP ScrollTrigger instances
- Centralize Stripe singleton

**Expected Impact:** Prevents memory accumulation over time

### **Priority 4: Parallelize API Routes**
- `create-checkout-session`: Use `Promise.all()` for concurrent queries
- `success/page.jsx`: Fire email send asynchronously

**Expected Impact:** 30-50% reduction in API response time

### **Priority 5: Add Next.js Config Optimizations**
```javascript
// next.config.mjs
export default {
  output: 'standalone',
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
}
```

---

## 7. Estimated Memory Reduction

| Optimization | Estimated Memory Savings |
|--------------|-------------------------|
| Remove unused dependencies | ~50-100MB (node_modules) |
| Dynamic import Scene/Three.js | ~20-30MB (runtime) |
| Dynamic import GSAP/Lenis | ~5-10MB (runtime) |
| Fix memory leaks | Prevents accumulation (critical) |
| Parallelize API routes | Reduces peak CPU usage by 30-40% |
| **Total Estimated Savings** | **~75-140MB+ runtime + prevents leaks** |

---

## 8. Implementation Checklist

- [ ] Remove `@clerk/nextjs`, `pg`, `dotenv` from package.json
- [ ] Add dynamic imports for Scene, Spinwheel, Lenis
- [ ] Fix Lenis cleanup in `src/app/page.js`
- [ ] Fix GSAP ScrollTrigger cleanup in `src/components/Spinwheel.jsx`
- [ ] Centralize Stripe singleton in `src/lib/stripe.js`
- [ ] Refactor `create-checkout-session` to use `Promise.all()`
- [ ] Make email send non-blocking in `success/page.jsx`
- [ ] Add `output: 'standalone'` to `next.config.mjs`
- [ ] Add compiler optimizations to `next.config.mjs`
- [ ] Test build size reduction: `npm run build` → check `.next` folder size
- [ ] Monitor memory usage after deployment

---

**Generated:** Performance optimization analysis for Hagi-Aesthetics  
**Next Steps:** Implement Priority 1-3 items first for immediate impact


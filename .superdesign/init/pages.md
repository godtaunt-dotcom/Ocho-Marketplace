# Pages Component Dependency Trees

Hierarchy and dependencies for each screen in Ocho.

## 1. HomePage (`ocho/client/src/pages/HomePage.tsx`)
- **Route**: `#/`
- **Purpose**: Main marketplace catalog, search, category pills, filtering, and product grid.
- **Dependencies**:
  - `components/ui/ProductCard.tsx`
  - `components/ui/ProductCardSkeleton.tsx`
  - `components/ui/Badge.tsx`
  - `components/ui/Button.tsx`
  - `services/api.ts` (`fetchItems`, `fetchCategories`)
  - `lucide-react` (`Search`, `Sparkles`, `ShieldCheck`, `SlidersHorizontal`, `ArrowUpDown`, `CheckCircle2`, `MapPin`, `RotateCcw`)

## 2. ItemDetailPage (`ocho/client/src/pages/ItemDetailPage.tsx`)
- **Route**: `#/items/:id`
- **Purpose**: Full item information, photo gallery, seller trust profile, delivery options, platform commission breakdown, 30-minute holding modal, and item report modal.
- **Dependencies**:
  - `components/ui/Badge.tsx`
  - `components/ui/Button.tsx`
  - `components/ui/Card.tsx` (`Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter`)
  - `components/ui/Modal.tsx`
  - `components/ui/Alert.tsx`
  - `services/api.ts` (`fetchItemById`, `ItemDetail`, `createReport`)
  - `lucide-react` (`ArrowLeft`, `MapPin`, `Truck`, `ShieldCheck`, `Star`, `Clock`, `Flag`, `ChevronRight`, `CreditCard`, `CheckCircle2`, `Info`, `Lock`)

## 3. ComponentShowcase (`ocho/client/src/pages/ComponentShowcase.tsx`)
- **Route**: `#/showcase`
- **Purpose**: Living style guide and interactive testing sandbox for all design tokens and primitives.
- **Dependencies**:
  - `components/ui/Button.tsx`
  - `components/ui/Input.tsx` (`Input`, `RupiahInput`)
  - `components/ui/Badge.tsx`
  - `components/ui/Card.tsx`
  - `components/ui/Modal.tsx`
  - `components/ui/Alert.tsx`
  - `components/ui/Logo.tsx`
  - `lucide-react` (`Layers`, `ArrowLeft`, `Send`, `Check`, `Search`, `Mail`, `Lock`, `ShieldCheck`, `ExternalLink`)

## Root Shell (`ocho/client/src/App.tsx`)
- Coordinates hash router state.
- Hosts global layout (`Navbar`, `Footer`).
- Manages auth modals (`LoginModal`, `RegisterModal`).
- Integrates `currentUser` state from `services/auth.ts`.

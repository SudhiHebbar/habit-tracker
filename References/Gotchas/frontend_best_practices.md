# Frontend Code Generation Best Practices

## Core Frontend Principles

### 1. Stylesheet Separation

**Rule**: Stylesheets must NEVER be embedded in TypeScript/JavaScript files. Always use separate files in a dedicated `Styles` folder.

#### File Structure Requirements

```
src/
├── components/
│   ├── UserCard/
│   │   ├── UserCard.tsx          # Component logic only
│   │   └── index.ts              # Barrel export
├── styles/
│   ├── components/
│   │   └── UserCard.module.css   # Component-specific styles
│   ├── global/
│   │   ├── variables.css         # CSS custom properties
│   │   ├── reset.css             # CSS reset/normalize
│   │   └── typography.css        # Font and text styles
│   └── themes/
│       ├── light.css
│       └── dark.css
```

#### Technology-Specific Implementation

**React with CSS Modules:**

```typescript
// ✅ CORRECT: UserCard.tsx
import React from "react";
import styles from "../../styles/components/UserCard.module.css";

interface UserCardProps {
  name: string;
  email: string;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email }) => {
  return (
    <div className={styles.userCard}>
      <h3 className={styles.userName}>{name}</h3>
      <p className={styles.userEmail}>{email}</p>
    </div>
  );
};

// ❌ WRONG: Never do this
export const UserCard: React.FC<UserCardProps> = ({ name, email }) => {
  const styles = {
    userCard: { padding: "1rem", border: "1px solid #ccc" },
  };
  // Inline styles violate separation of concerns
};
```

**Angular with Component Styles:**

```typescript
// ✅ CORRECT: user-card.component.ts
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-user-card",
  templateUrl: "./user-card.component.html",
  styleUrls: ["../../styles/components/user-card.component.scss"],
})
export class UserCardComponent {
  @Input() name: string = "";
  @Input() email: string = "";
}
```

**Vue with Scoped Styles:**

```vue
<!-- ✅ CORRECT: UserCard.vue -->
<template>
  <div class="user-card">
    <h3 class="user-name">{{ name }}</h3>
    <p class="user-email">{{ email }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  email: string;
}

defineProps<Props>();
</script>

<style scoped src="../../styles/components/UserCard.module.css"></style>
```

### 2. Lazy Loading Strategy

**Rule**: Components must implement lazy loading to optimize initial bundle size and improve performance.

#### Route-Level Lazy Loading

**React with React Router:**

```typescript
// ✅ CORRECT: App.tsx with lazy loading
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load route components
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const UserManagement = React.lazy(() => import("./pages/UserManagement"));
const Settings = React.lazy(() => import("./pages/Settings"));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

// ❌ WRONG: Loading all components upfront
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
```

**Angular with Lazy Loading Routes:**

```typescript
// ✅ CORRECT: app-routing.module.ts
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () =>
      import("./pages/dashboard/dashboard.module").then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: "users",
    loadChildren: () =>
      import("./pages/user-management/user-management.module").then(
        (m) => m.UserManagementModule
      ),
  },
  {
    path: "settings",
    loadChildren: () =>
      import("./pages/settings/settings.module").then((m) => m.SettingsModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

**Vue with Dynamic Imports:**

```typescript
// ✅ CORRECT: router/index.ts
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../pages/Dashboard.vue"),
  },
  {
    path: "/users",
    name: "UserManagement",
    component: () => import("../pages/UserManagement.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../pages/Settings.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```

#### Component-Level Lazy Loading

**React with Dynamic Imports:**

```typescript
// ✅ CORRECT: Conditional component loading
import React, { useState, Suspense } from "react";

const HeavyChart = React.lazy(() => import("./HeavyChart"));

export const Dashboard: React.FC = () => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => setShowChart(true)}>Load Chart</button>

      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
};
```

**Angular with Dynamic Component Loading:**

```typescript
// ✅ CORRECT: Dynamic component loading
import { Component, ViewContainerRef, ComponentRef } from "@angular/core";

@Component({
  selector: "app-dashboard",
  template: `
    <h1>Dashboard</h1>
    <button (click)="loadChart()">Load Chart</button>
    <div #chartContainer></div>
  `,
})
export class DashboardComponent {
  constructor(private viewContainer: ViewContainerRef) {}

  async loadChart() {
    const { HeavyChartComponent } = await import(
      "./heavy-chart/heavy-chart.component"
    );
    this.viewContainer.createComponent(HeavyChartComponent);
  }
}
```

### 3. Bundle Optimization Patterns

#### Code Splitting Configuration

**Webpack Configuration:**

```javascript
// ✅ CORRECT: webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
};
```

**Vite Configuration:**

```typescript
// ✅ CORRECT: vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["lodash", "date-fns"],
        },
      },
    },
  },
});
```

### 4. Performance Best Practices

#### Preloading Strategy

```typescript
// ✅ CORRECT: Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload likely next pages
  import("./pages/Dashboard");
  import("./pages/UserProfile");
};

// Call after initial load
setTimeout(preloadCriticalRoutes, 2000);
```

#### Tree Shaking Optimization

```typescript
// ✅ CORRECT: Import only what you need
import { debounce } from "lodash/debounce";
import { format } from "date-fns/format";

// ❌ WRONG: Imports entire library
import _ from "lodash";
import * as dateFns from "date-fns";
```

## Framework-Specific Guidelines

### React Best Practices

```yaml
component_structure:
  - component_logic: [Keep in .tsx files with TypeScript]
  - styles: [Separate .module.css files in styles/components/]
  - tests: [Co-located .test.tsx files]
  - types: [Shared types in types/ folder]

lazy_loading:
  - route_level: [Use React.lazy() for page components]
  - component_level: [Conditional lazy loading for heavy components]
  - resource_level: [Lazy load images, videos, large datasets]

bundle_optimization:
  - code_splitting: [Route-based and component-based splitting]
  - tree_shaking: [Import individual functions, not entire libraries]
  - preloading: [Preload critical routes after initial load]
```

### Angular Best Practices

```yaml
module_structure:
  - feature_modules: [Lazy loaded with own routing]
  - shared_modules: [Common components and services]
  - core_modules: [Singletons and app-wide services]

styling_strategy:
  - component_styles: [styleUrls pointing to styles/ folder]
  - global_styles: [In styles/ folder with proper organization]
  - theme_support: [CSS custom properties for theming]

lazy_loading:
  - route_modules: [loadChildren with dynamic imports]
  - feature_modules: [Separate modules for major features]
  - component_lazy: [Dynamic component loading when needed]
```

### Vue Best Practices

```yaml
component_organization:
  - single_file_components: [Logic, template, scoped styles]
  - external_styles: [src attribute for complex styles]
  - composables: [Reusable logic in composables/ folder]

performance:
  - route_lazy_loading: [Dynamic imports in router]
  - component_lazy_loading: [defineAsyncComponent for heavy components]
  - resource_optimization: [v-lazy for images, virtual scrolling]
```

## Validation Commands

### Bundle Analysis

```bash
# React/Next.js
npm run build
npm run analyze  # If webpack-bundle-analyzer is configured

# Angular
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Vue
npm run build
vue-cli-service build --report
```

### Performance Auditing

```bash
# Lighthouse CI
npx @lhci/cli@latest autorun

# Bundle size check
npx bundlesize

# Unused CSS detection
npx purgecss --css build/static/css/*.css --content build/static/js/*.js
```

### Style Architecture Validation

```bash
# CSS linting
npx stylelint "src/styles/**/*.css"

# SCSS linting
npx stylelint "src/styles/**/*.scss"

# CSS modules validation
grep -r "styles\." src/components/ # Should only find imports
```

## Quality Gates

### Code Review Checklist

- [ ] No inline styles in TypeScript/JavaScript files
- [ ] All styles organized in `styles/` folder structure
- [ ] Route-level lazy loading implemented
- [ ] Heavy components use conditional lazy loading
- [ ] Bundle size analysis performed and optimized
- [ ] Tree shaking optimization verified
- [ ] Critical CSS identified and inlined if needed
- [ ] Performance budget met (First Contentful Paint < 2s)
- [ ] Accessibility standards maintained in dynamic loading
- [ ] Error boundaries implemented for lazy-loaded components

### Performance Metrics

```yaml
performance_targets:
  first_contentful_paint: "< 2 seconds"
  largest_contentful_paint: "< 4 seconds"
  cumulative_layout_shift: "< 0.1"
  first_input_delay: "< 100ms"

bundle_size_targets:
  initial_bundle: "< 200KB gzipped"
  route_chunks: "< 100KB gzipped each"
  vendor_bundle: "< 300KB gzipped"

lazy_loading_coverage:
  routes: "100% lazy loaded except root"
  heavy_components: "Charts, tables, media players"
  third_party: "Analytics, chat widgets, etc."
```

## Anti-Patterns to Avoid

### Styling Anti-Patterns

```typescript
// ❌ WRONG: Inline styles in components
const badStyle = {
  color: "red",
  fontSize: "16px",
};

// ❌ WRONG: CSS-in-JS without proper organization
const StyledButton = styled.button`
  color: red;
  font-size: 16px;
`;

// ❌ WRONG: Global CSS imports in components
import "./global-styles.css";
```

### Loading Anti-Patterns

```typescript
// ❌ WRONG: Loading everything upfront
import AllComponents from "./all-components";

// ❌ WRONG: No loading states for lazy components
const LazyComponent = React.lazy(() => import("./Heavy"));
// Missing Suspense wrapper

// ❌ WRONG: Blocking main thread with large imports
import massiveLibrary from "massive-library";
```

## Technology Integration Examples

### Next.js with App Router

```typescript
// ✅ CORRECT: app/dashboard/page.tsx
import { Suspense } from "react";
import styles from "../../styles/pages/dashboard.module.css";

const HeavyChart = lazy(() => import("../../components/HeavyChart"));

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

### Nuxt.js with Auto Imports

```vue
<!-- ✅ CORRECT: pages/dashboard.vue -->
<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <LazyHeavyChart v-if="showChart" />
  </div>
</template>

<script setup>
const showChart = ref(false);

onMounted(() => {
  // Load chart after page interaction
  setTimeout(() => (showChart.value = true), 1000);
});
</script>

<style scoped src="~/styles/pages/dashboard.css"></style>
```

This comprehensive guide ensures that all code generation follows proper frontend architecture patterns with clear separation of concerns and optimal performance characteristics.

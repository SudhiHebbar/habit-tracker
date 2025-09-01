# User Story: Dark Mode Toggle in Settings

## As a user, I want to switch between light and dark modes so that I can use the app comfortably in different lighting conditions and match my personal preference.

---

## **Acceptance Criteria**

### **Settings Integration**
- **Given** I navigate to the Settings page (`/settings`)
- **When** I view the settings options
- **Then** I should see a "Theme" section with a toggle switch for Dark Mode
- **And** the toggle should clearly indicate current state (Light/Dark)
- **And** the toggle should use the existing visual customization design patterns

### **Theme Switching**
- **Given** I'm on the Settings page
- **When** I toggle the Dark Mode switch
- **Then** the entire application should immediately switch themes
- **And** the change should persist across browser sessions
- **And** the toggle state should update to reflect the new theme
- **And** I should see a smooth transition animation between themes

### **Visual Consistency**
- **Given** I'm using dark mode
- **When** I navigate through different pages (Dashboard, Habits, Settings)
- **Then** all text should be readable with appropriate contrast
- **And** all UI components should maintain their visual hierarchy
- **And** habit colors should remain vibrant and distinguishable
- **And** icons and buttons should adapt to the dark theme
- **And** existing animations should work seamlessly in both themes

### **Component Integration**
- **Given** I switch to dark mode
- **When** I interact with existing components (HabitCard, modals, buttons)
- **Then** all components should respect the dark theme
- **And** hover states and focus indicators should remain visible
- **And** completion checkboxes and celebration animations should work properly
- **And** skeleton loaders should adapt to the dark background

---

## **Technical Implementation**

### **Theme System Architecture**
Based on existing CSS structure in `app/src/styles/global/`:

1. **CSS Variables Enhancement** (`themes.css`)
   ```css
   :root {
     --theme-bg-primary: #ffffff;
     --theme-bg-secondary: #f8fafc;
     --theme-bg-tertiary: #f1f5f9;
     --theme-text-primary: #1e293b;
     --theme-text-secondary: #64748b;
     --theme-text-muted: #94a3b8;
     --theme-border: #e2e8f0;
     --theme-shadow: rgba(0, 0, 0, 0.1);
   }

   [data-theme="dark"] {
     --theme-bg-primary: #0f172a;
     --theme-bg-secondary: #1e293b;
     --theme-bg-tertiary: #334155;
     --theme-text-primary: #f8fafc;
     --theme-text-secondary: #cbd5e1;
     --theme-text-muted: #94a3b8;
     --theme-border: #475569;
     --theme-shadow: rgba(0, 0, 0, 0.3);
   }
   ```

2. **Theme Hook** (`app/src/shared/hooks/useTheme.ts`)
   ```typescript
   interface ThemeContextType {
     theme: 'light' | 'dark';
     toggleTheme: () => void;
     setTheme: (theme: 'light' | 'dark') => void;
   }

   export const useTheme = () => {
     const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
     
     const toggleTheme = useCallback(() => {
       setTheme(prev => prev === 'light' ? 'dark' : 'light');
     }, [setTheme]);

     // Apply theme to document
     useEffect(() => {
       document.documentElement.setAttribute('data-theme', theme);
     }, [theme]);

     return { theme, toggleTheme, setTheme };
   };
   ```

3. **Settings Page Enhancement** (`app/src/features/settings/SettingsPage.tsx`)
   ```typescript
   import { useTheme } from '../../shared/hooks/useTheme';

   export const SettingsPage: React.FC = () => {
     const { theme, toggleTheme } = useTheme();

     return (
       <Container>
         <div className={styles.section}>
           <h2>Appearance</h2>
           <div className={styles.setting}>
             <label>
               <span>Dark Mode</span>
               <Toggle
                 checked={theme === 'dark'}
                 onChange={toggleTheme}
                 aria-label="Toggle dark mode"
               />
             </label>
           </div>
         </div>
       </Container>
     );
   };
   ```

### **Component Updates Required**

1. **CSS Modules Updates**: Update all `.module.css` files to use CSS custom properties
   - Replace hardcoded colors with `var(--theme-*)` variables
   - Ensure proper contrast ratios in both themes
   - Update existing files like:
     - `HabitCard.module.css`
     - `Dashboard.module.css`
     - `Modal.module.css`

2. **Animation Integration**: Ensure existing animations work in dark mode
   - Update `completion-animations.css`
   - Verify `CompletionCelebration` visibility
   - Test `SkeletonLoader` in dark backgrounds

3. **Toggle Component**: Create reusable toggle switch
   ```typescript
   interface ToggleProps {
     checked: boolean;
     onChange: () => void;
     'aria-label'?: string;
   }
   ```

### **Environment Variable Support**
Leverage existing environment system (`app/.env.local`):
```env
VITE_DEFAULT_THEME=light  # or 'dark'
```

### **System Preference Detection**
```typescript
const getSystemPreference = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};
```

---

## **User Experience Flow**

1. **Initial Load**: App loads with light mode (current behavior)
2. **Settings Access**: User navigates to Settings page via main navigation
3. **Theme Discovery**: User sees "Appearance" section with Dark Mode toggle
4. **Theme Switch**: User toggles switch, sees immediate visual change
5. **Persistence**: Theme choice saved to localStorage, persists across sessions
6. **Consistency**: All pages and components respect the selected theme

## **Accessibility Considerations**

- **Contrast Ratios**: Ensure WCAG AA compliance (4.5:1) for all text
- **Focus Indicators**: Maintain visible focus states in both themes
- **Screen Readers**: Proper ARIA labels for theme toggle
- **Reduced Motion**: Respect `prefers-reduced-motion` for theme transitions

## **Testing Strategy**

- **Manual Testing**: Verify all pages/components in both themes
- **Automated Testing**: Update existing component tests to cover theme variants
- **Accessibility Testing**: Run contrast ratio checks for both themes
- **Cross-browser Testing**: Ensure CSS custom property support

## **Migration Plan**

1. **Phase 1**: Create theme system infrastructure and hooks
2. **Phase 2**: Update global styles and CSS custom properties  
3. **Phase 3**: Migrate component styles to use theme variables
4. **Phase 4**: Add Settings page toggle and persistence
5. **Phase 5**: Test and refine visual consistency

This implementation integrates seamlessly with the existing architecture while providing a robust, accessible dark mode experience.

---

## **Definition of Done**

- [ ] Theme toggle appears in Settings page
- [ ] Light/dark themes switch immediately when toggled
- [ ] Theme preference persists across browser sessions
- [ ] All pages and components respect selected theme
- [ ] Text contrast meets WCAG AA standards in both themes
- [ ] Existing animations work in both themes
- [ ] Focus indicators visible in both themes
- [ ] Component tests updated for theme variants
- [ ] Cross-browser compatibility verified
- [ ] Accessibility testing completed
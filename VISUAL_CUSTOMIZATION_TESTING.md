# Visual Customization System - Testing Guide

This guide provides comprehensive instructions for testing the visual customization system in the Habit Tracker application.

## Quick Start

### 1. Build and Start the Application

```bash
# Navigate to the app directory
cd app

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The app should now be running at http://localhost:5173

### 2. Create a Test Page

Add the test page to your router to easily access all components:

```typescript
// In your router configuration (e.g., App.tsx or router setup)
import { VisualCustomizationTestPage } from './features/visual-customization/examples/TestPage';

// Add a route for testing
<Route path="/test-customization" element={<VisualCustomizationTestPage />} />
```

Then navigate to: http://localhost:5173/test-customization

### 3. Alternative: Import Components Individually

You can also test components individually in existing pages:

```typescript
import {
  ColorPalette,
  ColorPicker,
  IconSelector,
  CustomizationPreview,
  // ... other components
} from './features/visual-customization';

// Use components in your JSX
<ColorPalette 
  onColorSelect={(color) => console.log('Selected:', color)}
  showAccessibility={true}
/>
```

## Component Testing Checklist

### ✅ ColorPalette Component

**Basic Functionality:**
- [ ] Colors display in organized categories
- [ ] Color selection works (click/keyboard)
- [ ] Selected color is highlighted
- [ ] Custom color input works
- [ ] Search functionality works

**Accessibility:**
- [ ] Keyboard navigation (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader announcements
- [ ] High contrast mode support
- [ ] WCAG AA compliant colors are marked
- [ ] Color descriptions are readable

**Visual:**
- [ ] Hover effects work smoothly
- [ ] Colors are visually distinct
- [ ] Loading states appear correctly
- [ ] Responsive design on mobile

### ✅ ColorPicker Component

**Basic Functionality:**
- [ ] Color wheel/picker interface works
- [ ] Hex input accepts valid colors
- [ ] Color preview updates in real-time
- [ ] Saved colors persist
- [ ] Eyedropper tool works (if supported by browser)

**Validation:**
- [ ] Invalid hex codes show error messages
- [ ] Color format conversion works
- [ ] Accessibility warnings appear for low contrast

### ✅ ColorContrastIndicator Component

**Functionality:**
- [ ] Contrast ratios calculate correctly
- [ ] WCAG AA/AAA ratings display
- [ ] Pass/fail status is clear
- [ ] Multiple background tests work
- [ ] Recommendations are helpful

**Visual:**
- [ ] Color previews are accurate
- [ ] Text is readable on all backgrounds
- [ ] Status indicators are clear

### ✅ IconSelector Component

**Basic Functionality:**
- [ ] Icons display in categories
- [ ] Search finds relevant icons
- [ ] Icon selection works
- [ ] Categories can be expanded/collapsed
- [ ] Popular icons section works

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader describes icons
- [ ] Focus indicators are visible
- [ ] Icon names are descriptive

### ✅ CustomizationPreview Component

**Preview Contexts:**
- [ ] Dashboard preview looks realistic
- [ ] List view preview is accurate
- [ ] Card view preview matches design
- [ ] Detail view preview is comprehensive
- [ ] All contexts update with color/icon changes

**Interactivity:**
- [ ] Real-time updates work
- [ ] Mock data displays correctly
- [ ] Accessibility info is accurate

### ✅ CustomizationPresets Component

**Functionality:**
- [ ] Preset categories work
- [ ] Search finds relevant presets
- [ ] Preset selection applies both color and icon
- [ ] Popular presets are highlighted
- [ ] Custom save functionality works (if implemented)

**Visual:**
- [ ] Preset previews are attractive
- [ ] Category organization makes sense
- [ ] Accessibility badges are accurate

### ✅ RecentColors Component

**Functionality:**
- [ ] Recent colors persist across sessions
- [ ] Clear button removes all colors
- [ ] Color selection from recent works
- [ ] Maximum color limit is enforced
- [ ] Statistics are accurate

**Visual:**
- [ ] Empty state is informative
- [ ] Tooltips show helpful information
- [ ] Overflow handling works

### ✅ Shared Components (ColorSwatch, IconDisplay, PreviewCard)

**ColorSwatch:**
- [ ] Different sizes render correctly
- [ ] Shape variants work (circle, square, rounded)
- [ ] Selection states are clear
- [ ] Accessibility badges appear when appropriate
- [ ] Tooltips show color information

**IconDisplay:**
- [ ] Icons render at all sizes
- [ ] Variants (filled, outlined) work
- [ ] Colors apply correctly
- [ ] Fallback states work for missing icons
- [ ] Loading states display

**PreviewCard:**
- [ ] Different contexts render appropriately
- [ ] Interactive mode works
- [ ] Accessibility information is accurate
- [ ] Mock data displays correctly

## Integration Testing

### With Habit Creation Flow

1. Test the `HabitCustomizationExample` component:
   ```typescript
   import { HabitCustomizationExample } from './features/visual-customization/examples/HabitCustomizationExample';
   
   <HabitCustomizationExample
     initialColor="#3B82F6"
     initialIcon="heart"
     onSave={(customization) => {
       console.log('Saving:', customization);
       // Integrate with your habit creation logic
     }}
   />
   ```

2. Test the workflow:
   - [ ] Default values display correctly
   - [ ] Tabbed interface works smoothly
   - [ ] Preview updates in real-time
   - [ ] Save button applies customization
   - [ ] Cancel button resets changes

### With Existing Habit Data

Test with real habit data structure:

```typescript
const habitData = {
  id: 1,
  name: "Daily Exercise",
  description: "30 minutes of physical activity",
  color: "#10B981",
  iconId: "dumbbell",
  // ... other habit properties
};

// Test customization with existing data
<CustomizationPreview
  color={habitData.color}
  iconId={habitData.iconId}
  title={habitData.name}
  description={habitData.description}
/>
```

## Accessibility Testing

### Keyboard Navigation

Test all components with keyboard only:

1. **Tab Navigation:** Should move through all interactive elements
2. **Enter/Space:** Should activate buttons and selections
3. **Arrow Keys:** Should navigate within component grids
4. **Escape:** Should close modals/dropdowns

### Screen Reader Testing

Test with screen readers (NVDA, JAWS, VoiceOver):

1. **Color Descriptions:** Should announce color names and accessibility status
2. **Icon Descriptions:** Should describe icon names and purposes  
3. **State Changes:** Should announce selection changes
4. **Instructions:** Should provide clear usage instructions

### Visual Accessibility

1. **High Contrast Mode:** Enable in OS and verify all components remain usable
2. **Color Blindness:** Use browser extensions to simulate different types
3. **Zoom Testing:** Test at 200% and 400% zoom levels
4. **Focus Indicators:** Should be clearly visible on all interactive elements

## Performance Testing

### Large Data Sets

Test with many colors/icons:

```typescript
// Test with large recent colors array
const manyRecentColors = Array.from({ length: 50 }, (_, i) => 
  `#${Math.floor(Math.random()*16777215).toString(16)}`
);

<RecentColors recentColors={manyRecentColors} />
```

### Memory Usage

1. Monitor memory usage when switching between components
2. Check for memory leaks during extended use
3. Test component cleanup when unmounting

## Browser Testing

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

Mobile browsers:
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Samsung Internet

## Error Handling Testing

Test error scenarios:

1. **Invalid Colors:** Test with malformed hex codes
2. **Missing Icons:** Test with non-existent icon IDs
3. **Network Issues:** Test with slow/failed requests
4. **Invalid Props:** Test with unexpected prop values

## TypeScript Testing

Verify TypeScript integration:

```bash
# Run type checking
npm run type-check
```

Common type issues to check:
- [ ] All props have correct types
- [ ] Event handlers match expected signatures
- [ ] Service method calls are typed correctly
- [ ] No `any` types in production code

## Build Testing

Test production builds:

```bash
# Build the application
npm run build

# Test the built version
npm run preview
```

Check for:
- [ ] All components render correctly in production
- [ ] CSS modules are properly scoped
- [ ] Bundle sizes are reasonable
- [ ] No console errors in production

## Visual Regression Testing

Take screenshots of components in different states and compare:

1. **Default States:** All components in initial state
2. **Selected States:** Components with selections made
3. **Hover States:** Components with hover effects
4. **Error States:** Components showing error messages
5. **Empty States:** Components with no data
6. **Loading States:** Components in loading state

## Manual Test Scenarios

### Scenario 1: New User Creating First Habit
1. User opens habit creation form
2. User sees default customization options
3. User browses preset combinations
4. User selects a preset
5. User sees preview update
6. User saves the habit

**Expected:** Smooth workflow, clear previews, successful save

### Scenario 2: Power User Customizing Multiple Habits
1. User has many recent colors
2. User creates multiple habits with different customizations
3. User uses search functionality extensively
4. User tests accessibility features

**Expected:** Good performance, accurate recent colors, helpful search

### Scenario 3: Accessibility-Focused User
1. User navigates entirely with keyboard
2. User relies on screen reader
3. User checks contrast ratios
4. User uses high contrast mode

**Expected:** Full accessibility, clear announcements, usable interface

## Debugging Tips

### Component Not Rendering
- Check import paths
- Verify CSS modules are loading
- Check for TypeScript errors
- Ensure services are properly initialized

### Styles Not Applying
- Verify CSS module imports
- Check CSS variable definitions
- Test CSS specificity issues
- Validate responsive breakpoints

### Performance Issues
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Monitor bundle size
- Test with large datasets

### Accessibility Issues
- Use browser DevTools accessibility audit
- Test with actual assistive technologies
- Verify WCAG compliance with automated tools
- Get feedback from users with disabilities

## Reporting Issues

When reporting bugs, include:

1. **Steps to reproduce**
2. **Expected vs actual behavior**
3. **Browser and version**
4. **Screen size/device**
5. **Console errors**
6. **Screenshots/videos**
7. **Accessibility impact**

## Success Criteria

The visual customization system is ready for production when:

- [ ] All components render correctly in all supported browsers
- [ ] Keyboard navigation works throughout the system
- [ ] Screen readers can use all functionality
- [ ] High contrast mode is fully supported
- [ ] Performance is acceptable with large datasets
- [ ] TypeScript compilation passes without errors
- [ ] Build process completes successfully
- [ ] Integration with existing habit workflows is seamless
- [ ] Visual regression tests pass
- [ ] All accessibility audits pass with WCAG AA compliance

## Support

For questions about testing or issues encountered:

1. Check the component documentation in the code
2. Review the TypeScript types for expected interfaces
3. Look at the example implementations
4. Test with the provided test page
5. Check browser console for helpful error messages

Happy testing! 🎨✨
# React Gotchas & Best Practices

## Critical React Gotchas

### State Management
```typescript
// ❌ GOTCHA: State updates are async and batched
const [count, setCount] = useState(0);
setCount(count + 1);
setCount(count + 1); // Still shows 0, not 1!

// ✅ CORRECT: Use functional updates
setCount(prev => prev + 1);
setCount(prev => prev + 1); // Now correctly increments by 2
```

### useEffect Dependencies
```typescript
// ❌ GOTCHA: Missing dependencies cause stale closures
useEffect(() => {
  fetchData(userId); // userId not in deps array!
}, []); // This will always use initial userId

// ✅ CORRECT: Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### Object/Array Updates
```typescript
// ❌ GOTCHA: Mutating state directly
const [items, setItems] = useState([]);
items.push(newItem); // React won't re-render!

// ✅ CORRECT: Create new references
setItems(prev => [...prev, newItem]);
```

### Key Prop in Lists
```typescript
// ❌ GOTCHA: Using index as key with dynamic lists
{items.map((item, index) => (
  <Item key={index} data={item} /> // Causes render issues!
))}

// ✅ CORRECT: Use stable, unique identifiers
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

## Performance Gotchas

### Unnecessary Re-renders
```typescript
// ❌ GOTCHA: Creating objects/functions in render
function Component() {
  return <Child config={{theme: 'dark'}} />; // New object every render!
}

// ✅ CORRECT: Memoize or move outside
const config = {theme: 'dark'};
function Component() {
  return <Child config={config} />;
}
```

### useCallback Dependencies
```typescript
// ❌ GOTCHA: Stale closures in callbacks
const handleClick = useCallback(() => {
  doSomething(value); // 'value' not in deps!
}, []);

// ✅ CORRECT: Include dependencies
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

## Common Patterns to Follow

### Error Boundaries
```typescript
// Always wrap components that might throw
<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

### Loading States
```typescript
// Always handle loading and error states
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <DataComponent data={data} />;
```

### Form Handling
```typescript
// Use controlled components for forms
const [formData, setFormData] = useState({});
const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

## Testing Gotchas

### Async Updates
```typescript
// ❌ GOTCHA: Not waiting for async updates
fireEvent.click(button);
expect(screen.getByText('Updated')).toBeInTheDocument(); // Might fail!

// ✅ CORRECT: Wait for updates
fireEvent.click(button);
await screen.findByText('Updated');
```

### Mocking External Dependencies
```typescript
// Always mock external services in tests
jest.mock('../services/api', () => ({
  fetchData: jest.fn().mockResolvedValue(mockData)
}));
```

## Security Considerations

### XSS Prevention
```typescript
// ❌ DANGEROUS: Using dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{__html: userContent}} />

// ✅ SAFE: Sanitize content or use libraries like DOMPurify
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userContent)}} />
```

### Input Validation
```typescript
// Always validate and sanitize user inputs
const handleSubmit = (formData) => {
  const validated = validateFormData(formData);
  if (!validated.isValid) {
    setErrors(validated.errors);
    return;
  }
  // Proceed with validated data
};
```

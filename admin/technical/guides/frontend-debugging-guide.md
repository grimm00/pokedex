# Frontend Debugging Guide

## Overview
This guide documents the debugging process and solutions for common frontend issues encountered during the Pokedex project development.

## Common Issues and Solutions

### 1. Blank Screen / React App Crashes

**Symptoms:**
- Frontend loads for a split second then goes blank
- No console errors visible initially
- React app appears to crash silently

**Root Causes:**
- Complex state management (Zustand stores) not properly initialized
- TypeScript strict mode errors
- Missing dependencies or incorrect imports
- Data structure mismatches between components

**Debugging Steps:**
1. **Check Browser Console** (F12 → Console tab)
   - Look for JavaScript errors
   - Check for TypeScript compilation errors
   - Look for missing module errors

2. **Simplify Components Step by Step**
   - Remove complex state management temporarily
   - Use mock data directly instead of API calls
   - Remove complex useEffect hooks
   - Comment out problematic imports

3. **Add Console Logging**
   ```typescript
   console.log('Component rendering...')
   console.log('Data:', data)
   ```

4. **Isolate the Problem**
   - Create minimal working versions
   - Gradually add back features one by one
   - Test each addition before proceeding

**Solution Pattern:**
```typescript
// ❌ Complex version that crashes
const [pokemon, setPokemon] = useState([])
const { fetchPokemon } = usePokemonStore()
useEffect(() => {
  fetchPokemon() // This might fail
}, [])

// ✅ Simple version that works
const pokemon = mockPokemon // Direct assignment
```

### 2. TypeScript Strict Mode Errors

**Common Errors:**
- `TS1484: 'TypeName' is a type and must be imported using a type-only import`
- `TS2503: Cannot find namespace 'NodeJS'`
- `TS2307: Cannot find module 'path'`

**Solutions:**
```typescript
// ❌ Wrong
import { Pokemon, ApiError } from '@/types'

// ✅ Correct
import type { Pokemon } from '@/types'
import { ApiError } from '@/types' // If it's a class

// ❌ Wrong
setTimeout(() => {}, 1000)

// ✅ Correct
setTimeout(() => {}, 1000) as ReturnType<typeof setTimeout>
```

### 3. Tailwind CSS Configuration Issues

**Error:** `Error: Cannot apply unknown utility class 'bg-gray-50'`

**Root Cause:** Tailwind CSS v4 vs v3 differences

**Solution:**
```bash
# Downgrade to v3
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
```

Update `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {}, // Not @tailwindcss/postcss
    autoprefixer: {},
  },
}
```

### 4. Data Structure Mismatches

**Problem:** Components expect different data structures

**Example:**
```typescript
// Component expects
interface Pokemon {
  types: string[]
}

// API provides
interface Pokemon {
  types: { name: string }[]
}
```

**Solution:** Ensure consistent data structure across all components

### 5. Hover Effects Not Working

**Symptoms:**
- CSS classes not applying on hover
- Inline styles not overriding CSS
- Specificity issues

**Debugging:**
1. Check browser dev tools for applied styles
2. Use `!important` or inline styles for testing
3. Verify CSS specificity

**Solution:**
```typescript
// Use inline styles for guaranteed application
style={{
  background: isHovered ? getHoverStyle().background : 'rgba(255, 255, 255, 0.9)',
  // ... other styles
}}
```

## Debugging Workflow

### 1. Systematic Approach
1. **Identify the Problem** - What exactly is broken?
2. **Isolate the Issue** - Which component/feature is causing it?
3. **Simplify** - Remove complexity until it works
4. **Test** - Verify the fix works
5. **Gradually Restore** - Add back features one by one
6. **Document** - Record the solution for future reference

### 2. Tools and Techniques
- **Browser Dev Tools** - Console, Network, Elements tabs
- **Console Logging** - Strategic `console.log()` statements
- **Git Commits** - Save working states frequently
- **Minimal Reproductions** - Create simple test cases
- **Step-by-step Restoration** - Add complexity gradually

### 3. Prevention Strategies
- **Frequent Commits** - Save working states
- **Incremental Development** - Add one feature at a time
- **Type Safety** - Use TypeScript strictly
- **Testing** - Test each change before proceeding
- **Documentation** - Record solutions and patterns

## Best Practices

### 1. Development Workflow
```bash
# 1. Make a small change
# 2. Test it works
# 3. Commit if working
git add .
git commit -m "Working feature X"

# 4. Make next small change
# 5. Repeat
```

### 2. Error Handling
```typescript
// Always handle errors gracefully
try {
  const data = await fetchData()
  setData(data)
} catch (error) {
  console.log('Error, using fallback:', error)
  setData(mockData) // Fallback
}
```

### 3. State Management
```typescript
// Start simple, add complexity only when needed
const [pokemon, setPokemon] = useState(mockPokemon) // Simple
// vs
const { pokemon, fetchPokemon } = usePokemonStore() // Complex
```

## Lessons Learned

1. **Complexity Kills** - Start simple, add complexity gradually
2. **Console is Your Friend** - Always check browser console first
3. **Git is Your Safety Net** - Commit working states frequently
4. **TypeScript Helps** - Use strict mode, fix errors immediately
5. **Test Everything** - Verify each change works before proceeding
6. **Document Solutions** - Record what worked for future reference

## Quick Reference

### Emergency Fixes
```bash
# If frontend won't start
cd frontend
npm install
npm run dev

# If TypeScript errors
npm install -D @types/node

# If Tailwind issues
npm install -D tailwindcss@^3.4.0

# If blank screen
# 1. Check console
# 2. Simplify components
# 3. Use mock data
# 4. Remove complex state
```

### Debugging Checklist
- [ ] Check browser console for errors
- [ ] Verify all imports are correct
- [ ] Check data structure consistency
- [ ] Test with mock data
- [ ] Simplify components
- [ ] Add console logging
- [ ] Check CSS specificity
- [ ] Verify TypeScript compilation
- [ ] Test in isolation
- [ ] Document the solution

---

*This guide was created during the Pokedex project development and should be updated as new issues and solutions are discovered.*

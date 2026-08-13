---
name: react-19
description: Guidelines and documentation for React 19. Use this skill when building modern React components, working with forms, optimistic UI, or Server Actions.
---

# React 19 Best Practices

React 19 introduces major features reducing boilerplate and enhancing integration with modern frameworks (like Next.js 15+).

## Core Concepts

1. **Actions (Form Actions)**:
   - React 19 seamlessly integrates with Server Actions.
   - You can pass an async function directly to the `action` prop of a `<form>`.
   ```tsx
   export default function Form() {
     async function handleSubmit(formData: FormData) {
       "use server"
       // ... do something
     }
     return <form action={handleSubmit}>...</form>
   }
   ```

2. **`useActionState`**:
   - Replaces `useFormState` (which is now deprecated). It allows tracking the state of an action.
   ```tsx
   import { useActionState } from "react"
   
   const [state, formAction, isPending] = useActionState(myAction, initialState)
   
   return (
     <form action={formAction}>
       <input name="email" />
       {isPending ? <p>Loading...</p> : <button type="submit">Submit</button>}
       <p>{state?.message}</p>
     </form>
   )
   ```

3. **`useFormStatus`**:
   - Extracts the pending state and form data of the parent `<form>`. Must be used inside a component nested within the `<form>`.
   ```tsx
   import { useFormStatus } from "react-dom"
   
   function SubmitButton() {
     const { pending } = useFormStatus()
     return <button disabled={pending}>Submit</button>
   }
   ```

4. **`useOptimistic`**:
   - Manages optimistic state updates directly in React while a server mutation is running.
   ```tsx
   import { useOptimistic } from "react"
   
   const [optimisticState, addOptimistic] = useOptimistic(
     state,
     (currentState, newValue) => [...currentState, newValue]
   )
   ```

5. **`ref` as a Prop**:
   - `forwardRef` is no longer needed. You can pass `ref` directly as a prop in function components.
   ```tsx
   function MyInput({ ref, ...props }) {
     return <input ref={ref} {...props} />
   }
   ```

6. **Document Metadata & Resource Preloading**:
   - You can render `<title>`, `<meta>`, and `<link>` tags directly inside components. React will automatically hoist them to the `<head>`.

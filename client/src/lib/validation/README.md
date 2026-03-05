# Registration Form Validation - Test Documentation

This document outlines the testing scenarios for the registration form validation implementation.

## Test Scenarios

### Email Validation (Real-time)

#### Valid Emails (Should show green border)
- `user@example.com` - Standard email
- `first.last@example.com` - Dot in local part
- `user+tag@example.com` - Plus sign in local part
- `user123@example.com` - Numbers in local part
- `user@sub.example.com` - Subdomain
- `user@example.co.uk` - Multi-level TLD

#### Invalid Emails (Should show red border with error message)
- `test@` - Missing domain
- `test@test` - Missing TLD
- `test` - Missing @ symbol
- `@example.com` - Missing local part
- `test @example.com` - Space in email
- `test..test@example.com` - Consecutive dots (borderline case)
- Empty field - "Email é obrigatório"

### Password Validation (Real-time)

#### Valid Passwords (Should show green border)
- `123456` - Exactly 6 characters
- `password123` - More than 6 characters
- `Abc!23` - Mixed characters

#### Invalid Passwords (Should show red border with error message)
- `12345` - Less than 6 characters: "A senha deve ter pelo menos 6 caracteres"
- Empty field - "Senha é obrigatória"

### Password Confirmation Validation (Real-time)

#### Matching Passwords (Should show green border)
- Password: `123456`, Confirm: `123456`

#### Non-Matching Passwords (Should show red border with error message)
- Password: `123456`, Confirm: `1234567` - "As senhas não coincidem"
- Empty confirm field - "Confirme sua senha"

### Server-Side Error Handling

#### Duplicate Email
- Register with email that already exists
- Expected: "Este email já está cadastrado" in general error box

#### Invalid Email Format (Server)
- Email with invalid format that passes basic validation
- Expected: "Insira um endereço de email válido" in general error box

#### Weak Password (Server)
- Password rejected by Supabase
- Expected: "A senha deve ter pelo menos 6 caracteres" in general error box

### Form Submission

#### Successful Registration
- Fill all fields with valid data
- Submit form
- Expected: Success state with confirmation message

#### Validation Errors on Submit
- Submit with invalid data in any field
- Expected: All fields show validation errors, form doesn't submit

### Visual States

#### Default State
- Border color: `rgba(211, 158, 23, 0.2)` (gold, semi-transparent)
- Background: `rgba(255, 255, 255, 0.05)`
- Text color: `#f1f5f9`

#### Focus State
- Border color: `rgba(211, 158, 23, 0.5)` (gold, more opaque)

#### Error State
- Border color: `#ef4444` (red)
- Error message below input in red text
- ARIA attributes: `aria-invalid="true"`, `aria-describedby="field-id-error"`

#### Valid State (after blur)
- Border color: `#22c55e` (green)

### Accessibility Features

- All errors have `role="alert"` for screen readers
- Error messages are linked to inputs via `aria-describedby`
- Invalid inputs have `aria-invalid="true"`
- Form has `noValidate` attribute to disable browser validation
- All inputs have proper labels with `htmlFor` attribute

### Behavior Characteristics

1. **Real-time Validation**: Errors appear as user types after field has been blurred (touched)
2. **Error Clearing**: Errors clear when user starts typing in a field
3. **Cross-field Validation**: Confirm password re-validates when password changes
4. **Submit Validation**: All fields validate on submit attempt
5. **Touched Tracking**: Fields only show errors after being touched (blurred)

## Testing Checklist

- [ ] Invalid email format shows error immediately after blur
- [ ] Valid email shows green border after blur
- [ ] Password less than 6 characters shows error
- [ ] Password 6+ characters shows green border
- [ ] Password mismatch shows error
- [ ] Matching passwords show green border
- [ ] Submit button disabled during loading
- [ ] General error box displays server errors
- [ ] Success state displays after successful registration
- [ ] All error messages are in Portuguese
- [ ] Color scheme matches existing design (gold/navy)
- [ ] Accessibility attributes present (ARIA)
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces errors

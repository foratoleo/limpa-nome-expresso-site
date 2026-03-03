# Autopilot Completion Checklist

## Manual Step Required: Apply SQL Migration

The autopilot has completed all code changes, but the RLS security fix must be manually applied to the database.

### File to Execute
Location: `supabase/migrations/005_fix_rls_policies.sql`

### How to Apply
1. Open: https://supabase.com/dashboard/project/dvkfvhqfwffxgmmjbgjd/sql/new
2. Copy the SQL from the file above
3. Paste and execute
4. Verify no errors occur

### After Applying
Return to this terminal and confirm:
- [ ] SQL executed successfully
- [ ] Ready for production testing

Then autopilot can be completed with /oh-my-claudecode:cancel

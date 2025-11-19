# Admin Setup Instructions

## How to Grant Admin Access

To give a user admin access to view all submissions:

1. Have the user create an account at `/auth`
2. Get their user ID from the authentication system
3. Access your backend database
4. Run this SQL query to grant admin role:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

Replace `USER_ID_HERE` with the actual user ID from the auth.users table.

## Admin Features

Once a user has the admin role, they can:
- Access `/admin` dashboard
- View all submissions from all users
- See submission details including files, urgency levels, and contact information

## Regular Users

Regular users (without admin role):
- Can submit SI/PI review requests at `/intake`
- Can only view their own submissions
- All submissions are kept confidential and secure

## Security Notes

- The submissions table is protected by Row-Level Security (RLS)
- Users can only read their own submissions
- Admins can read all submissions through a secure role-based policy
- Authentication is required for all operations
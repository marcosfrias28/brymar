# User Activities System

This system tracks user activities across the platform and displays them in the user's profile.

## 🗄️ Database Schema

### Table: `user_activities`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users table |
| `type` | VARCHAR(50) | Activity type (view, favorite, search, contact, message, login, profile, settings) |
| `title` | TEXT | Activity title |
| `description` | TEXT | Activity description |
| `details` | TEXT | Optional additional details |
| `metadata` | JSONB | Additional structured data |
| `ip_address` | VARCHAR(45) | User's IP address |
| `user_agent` | TEXT | Browser/device information |
| `created_at` | TIMESTAMP | When the activity occurred |
| `updated_at` | TIMESTAMP | Last update time |

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
node scripts/create-activities-table.js
```

### 2. Update Your Components

Add activity logging to your existing components:

```typescript
import { ActivityLogger } from "@/lib/utils/activity-logger";

// In a property view component
useEffect(() => {
  if (property) {
    ActivityLogger.logPropertyView(property.id, property.title);
  }
}, [property]);

// In a favorite button component
const handleFavorite = async (propertyId: string, propertyTitle: string) => {
  // Your existing favorite logic
  await toggleFavorite();
  
  // Log the activity
  await ActivityLogger.logPropertyFavorite(
    propertyId, 
    propertyTitle, 
    isFavorite ? "remove" : "add"
  );
};
```

## 📊 Activity Types

| Type | Description | Example |
|------|-------------|---------|
| `view` | Property or page views | "Visualizzazione proprietà" |
| `favorite` | Adding/removing favorites | "Aggiunto ai preferiti" |
| `search` | Search queries | "Nuova ricerca" |
| `contact` | Contacting property owners | "Contatto proprietario" |
| `message` | Sending/receiving messages | "Messaggio inviato" |
| `login` | User login events | "Accesso effettuato" |
| `profile` | Profile updates | "Profilo aggiornato" |
| `settings` | Settings changes | "Impostazioni modificate" |

## 🔧 API Endpoints

### GET `/api/profile/activities`

Query parameters:
- `limit` (optional): Number of activities to return (default: 50)
- `offset` (optional): Number of activities to skip (default: 0)
- `type` (optional): Filter by activity type
- `startDate` (optional): Filter activities from this date
- `endDate` (optional): Filter activities until this date

### Server Actions

- `getUserActivities()` - Get user activities with filtering
- `createUserActivity()` - Create a new activity
- `createActivity()` - Create activity for current user
- `getActivityStats()` - Get activity statistics
- `cleanupOldActivities()` - Clean up old activities

## 🎯 Usage Examples

### Logging Property Views

```typescript
// In property detail page
useEffect(() => {
  if (property && user) {
    ActivityLogger.logPropertyView(property.id, property.title);
  }
}, [property, user]);
```

### Logging Search Activities

```typescript
// In search component
const handleSearch = async (searchParams: SearchParams) => {
  const results = await searchProperties(searchParams);
  
  // Log the search activity
  await ActivityLogger.logSearch(
    searchParams.query,
    searchParams,
    results.length
  );
  
  return results;
};
```

### Logging Profile Updates

```typescript
// In profile update form
const handleProfileUpdate = async (formData: ProfileData) => {
  const updatedFields = getChangedFields(profile, formData);
  
  // Update profile
  await updateProfile(formData);
  
  // Log the activity
  await ActivityLogger.logProfileUpdate(updatedFields);
};
```

## 📈 Performance Considerations

- Activities are cached for 10 minutes to reduce database load
- Automatic cleanup of activities older than 90 days
- Indexes on `user_id`, `type`, and `created_at` for fast queries
- Debounced refresh to prevent excessive API calls

## 🔄 Refresh Button

The profile activity component includes a refresh button that:
- Invalidates the cache
- Fetches fresh data from the database
- Shows loading state during refresh
- Prevents multiple simultaneous refreshes

## 🛠️ Customization

### Adding New Activity Types

1. Update the `ActivityData` interface in `src/lib/actions/activities.ts`
2. Add the new type to the database schema
3. Update the `ActivityLogger` class with new methods
4. Update the profile activity component to handle the new type

### Custom Activity Logging

```typescript
// Log custom activities
await ActivityLogger.logCustom({
  type: "custom",
  title: "Custom Activity",
  description: "Something happened",
  details: "Additional information",
  metadata: { customField: "value" }
});
```

## 🧹 Maintenance

### Cleanup Old Activities

```typescript
// Run cleanup (typically in a cron job)
const result = await cleanupOldActivities(90); // Keep 90 days
console.log(`Cleaned up ${result.data.deletedCount} old activities`);
```

### Monitoring

The system includes comprehensive logging for:
- Activity creation
- API requests
- Error handling
- Performance metrics

Check your logs for activity-related events to monitor the system health.

# Database Seeding Scripts

This directory contains scripts to populate the database with sample data for development and testing.

## 🚀 Quick Start

### 1. Basic Seeding (Properties + Lands + Activities)
```bash
npm run db:seed
```
This will:
- Create properties and lands tables if they don't exist
- Insert 5 sample properties
- Insert 3 sample lands  
- Insert 14 mock activities for user `contact@mzn.group`

### 2. Complete Seeding (Full Setup)
```bash
npm run db:seed:complete
```
This will:
- Create all necessary tables with proper constraints
- Add indexes for performance
- Clear existing data
- Insert fresh sample data
- Set up foreign key relationships

## 📊 Sample Data Included

### Properties (5 items)
- Villa Moderna Milano - €850,000
- Appartamento Centro Storico Roma - €650,000  
- Casa di Campagna Toscana - €450,000
- Loft Industriale Milano - €420,000
- Villa sul Lago di Como - €1,200,000

### Lands (3 items)
- Terreno Agricolo Puglia - €150,000
- Lotto Edificabile Sicilia - €280,000
- Bosco Trentino - €180,000

### Activities (14 items)
- Property views (4 activities)
- Favorites (2 activities)
- Searches (3 activities)
- Contact inquiries (1 activity)
- Land views (2 activities)
- Login events (1 activity)
- Profile updates (1 activity)

## 🔧 Prerequisites

1. **Database Connection**: Make sure `DATABASE_URL` is set in your environment
2. **User Exists**: Ensure user with email `contact@mzn.group` exists in the database
3. **Tables**: The script will create tables if they don't exist

## 📝 Script Details

### `seed-database.js`
- Basic seeding script
- Assumes tables already exist
- Good for development

### `complete-seed.js`
- Full setup script
- Creates tables, indexes, constraints
- Clears existing data
- Perfect for fresh database setup

## 🎯 Activity Types Generated

| Type | Count | Description |
|------|-------|-------------|
| `view` | 4 | Property/land views |
| `favorite` | 2 | Added to favorites |
| `search` | 3 | Search queries |
| `contact` | 1 | Contact inquiries |
| `login` | 1 | Login events |
| `profile` | 1 | Profile updates |
| `settings` | 1 | Settings changes |
| `message` | 1 | Messages sent |

## 🔍 Verification

After running the seed script, you can verify the data:

```sql
-- Check properties
SELECT COUNT(*) FROM properties;

-- Check lands  
SELECT COUNT(*) FROM lands;

-- Check activities for user
SELECT COUNT(*) FROM user_activities 
WHERE user_id = (SELECT id FROM users WHERE email = 'contact@mzn.group');

-- View recent activities
SELECT type, title, description, created_at 
FROM user_activities 
WHERE user_id = (SELECT id FROM users WHERE email = 'contact@mzn.group')
ORDER BY created_at DESC;
```

## 🛠️ Customization

To modify the sample data:

1. Edit the `sampleProperties` array in the script
2. Edit the `sampleLands` array in the script  
3. Edit the `sampleActivities` array in the script
4. Run the script again

## 🧹 Cleanup

To clear all seeded data:

```sql
DELETE FROM user_activities WHERE user_id IN (
  SELECT id FROM users WHERE email = 'contact@mzn.group'
);
DELETE FROM properties;
DELETE FROM lands;
```

## ⚠️ Important Notes

- The script will clear existing data when using `complete-seed.js`
- Make sure to backup your database before running in production
- Activities are generated with random timestamps within the last 30 days
- All activities are linked to the user with email `contact@mzn.group`

## 🐛 Troubleshooting

### User Not Found
```
❌ User with email contact@mzn.group not found
```
**Solution**: Make sure the user exists in the database first.

### Database Connection Error
```
❌ DATABASE_URL environment variable is required
```
**Solution**: Set your `DATABASE_URL` environment variable.

### Table Already Exists
```
❌ Error creating tables
```
**Solution**: This is normal if tables already exist. The script will continue.

## 📈 Performance

The scripts include:
- Batch inserts for better performance
- Proper indexing
- Foreign key constraints
- Error handling for each operation

Expected execution time: 2-5 seconds for complete seeding.

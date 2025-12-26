# Integration Tests for HakiArdhi Public Portal API

This folder contains test specifications and example tests for the Public Portal API endpoints.

## Test Structure

```
tests/
├── api/
│   ├── programs.test.ts
│   ├── portfolio.test.ts
│   ├── news.test.ts
│   ├── publications.test.ts
│   ├── legal-aid.test.ts
│   ├── lrm.test.ts
│   ├── about.test.ts
│   ├── contact.test.ts
│   ├── donations.test.ts
│   └── gallery.test.ts
├── fixtures/
│   └── test-data.ts
└── utils/
    └── test-helpers.ts
```

## Testing Framework

We use **Jest** with **Supertest** for API testing.

```bash
# Install dependencies
npm install --save-dev jest @types/jest supertest @types/supertest ts-jest

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- programs.test.ts
```

## Test Configuration

### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/app/api/public/portal/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

### tests/setup.ts

```typescript
import { createClient } from '@supabase/supabase-js';

// Set test environment variables
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_KEY = 'test-key';

// Global test timeout
jest.setTimeout(30000);

// Clean up after tests
afterAll(async () => {
  // Cleanup code if needed
});
```

## Test Examples

### tests/api/programs.test.ts

```typescript
import request from 'supertest';

const API_URL = 'http://localhost:3001';

describe('Programs API', () => {
  describe('GET /api/public/portal/programs', () => {
    it('should return paginated programs', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/programs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('total');
    });

    it('should filter by category', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/programs')
        .query({ category: 'Research' })
        .expect(200);

      expect(response.body.data.every(
        (p: any) => p.category === 'Research'
      )).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/programs')
        .query({ status: 'Ongoing' })
        .expect(200);

      expect(response.body.data.every(
        (p: any) => p.status === 'Ongoing'
      )).toBe(true);
    });

    it('should search by title', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/programs')
        .query({ search: 'land' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should paginate correctly', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/programs')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.limit).toBe(5);
    });
  });

  describe('GET /api/public/portal/programs/featured', () => {
    it('should return featured programs', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/programs/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(6);
    });
  });

  describe('GET /api/public/portal/programs/:slug', () => {
    it('should return program details', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/programs/test-program')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('full_description');
    });

    it('should return 404 for non-existent program', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/programs/non-existent-slug')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
```

### tests/api/contact.test.ts

```typescript
import request from 'supertest';

const API_URL = 'http://localhost:3001';

describe('Contact API', () => {
  describe('POST /api/public/portal/contact/submit', () => {
    it('should submit contact form successfully', async () => {
      const response = await request(API_URL)
        .post('/api/public/portal/contact/submit')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'General',
          message: 'This is a test message for the contact form.',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ticket_id');
    });

    it('should validate required fields', async () => {
      const response = await request(API_URL)
        .post('/api/public/portal/contact/submit')
        .send({
          name: 'Test',
          // missing email, subject, message
        })
        .expect(400);

      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should validate email format', async () => {
      const response = await request(API_URL)
        .post('/api/public/portal/contact/submit')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          subject: 'General',
          message: 'This is a test message.',
        })
        .expect(400);

      expect(response.body.errors.some(
        (e: any) => e.field === 'email'
      )).toBe(true);
    });

    it('should validate message length', async () => {
      const response = await request(API_URL)
        .post('/api/public/portal/contact/submit')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'General',
          message: 'Short',
        })
        .expect(400);

      expect(response.body.errors.some(
        (e: any) => e.field === 'message'
      )).toBe(true);
    });
  });

  describe('POST /api/public/portal/newsletter/subscribe', () => {
    it('should subscribe to newsletter', async () => {
      const response = await request(API_URL)
        .post('/api/public/portal/newsletter/subscribe')
        .send({
          email: `test-${Date.now()}@example.com`,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject duplicate subscription', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // First subscription
      await request(API_URL)
        .post('/api/public/portal/newsletter/subscribe')
        .send({ email })
        .expect(201);

      // Duplicate subscription
      const response = await request(API_URL)
        .post('/api/public/portal/newsletter/subscribe')
        .send({ email })
        .expect(409);

      expect(response.body.error.code).toBe('ALREADY_SUBSCRIBED');
    });
  });
});
```

### tests/api/donations.test.ts

```typescript
import request from 'supertest';

const API_URL = 'http://localhost:3001';

describe('Donations API', () => {
  describe('GET /api/public/portal/donate/campaigns', () => {
    it('should return active campaigns', async () => {
      const response = await request(API_URL)
        .get('/api/public/portal/donate/campaigns')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      // Check progress percentage is calculated
      response.body.data.forEach((campaign: any) => {
        expect(campaign).toHaveProperty('progress_percentage');
      });
    });
  });

  describe('POST /api/public/portal/donate/process', () => {
    it('should initiate donation', async () => {
      const response = await request(API_URL)
        .post('/api/public/portal/donate/process')
        .send({
          amount: 10000,
          payment_method: 'mpesa',
          donor_email: 'donor@example.com',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transaction_reference');
      expect(response.body.data).toHaveProperty('payment_url');
    });

    it('should validate minimum amount', async () => {
      const response = await request(API_URL)
        .post('/api/public/portal/donate/process')
        .send({
          amount: 100, // Below minimum
          payment_method: 'mpesa',
          donor_email: 'donor@example.com',
        })
        .expect(400);

      expect(response.body.errors.some(
        (e: any) => e.field === 'amount'
      )).toBe(true);
    });
  });
});
```

## Test Fixtures

### tests/fixtures/test-data.ts

```typescript
export const testProgram = {
  title: 'Test Program',
  slug: 'test-program',
  short_description: 'A test program for testing',
  full_description: 'Full description of the test program',
  status: 'Ongoing',
  is_published: true,
  is_featured: true,
};

export const testPortfolioItem = {
  title: 'Test Portfolio Item',
  slug: 'test-portfolio',
  description: 'A test portfolio item',
  category: 'Case Study',
  type: 'Project',
  is_published: true,
};

export const testPublication = {
  title: 'Test Publication',
  authors: ['Author One', 'Author Two'],
  publication_date: '2024-01-01',
  type: 'Report',
  topics: ['Land Rights', 'Research'],
  abstract: 'Abstract of the test publication',
  download_url: 'https://example.com/test.pdf',
  is_published: true,
};

export const testContactForm = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'General',
  message: 'This is a test message that meets minimum length requirements.',
};

export const testDonation = {
  amount: 10000,
  payment_method: 'mpesa',
  donor_email: 'donor@example.com',
  donor_name: 'Test Donor',
  is_anonymous: false,
};
```

## Test Utilities

### tests/utils/test-helpers.ts

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function seedTestData(table: string, data: any[]) {
  const { error } = await supabase.from(table).insert(data);
  if (error) throw error;
}

export async function cleanupTestData(table: string, ids: string[]) {
  const { error } = await supabase
    .from(table)
    .delete()
    .in('id', ids);
  if (error) throw error;
}

export function generateTestEmail() {
  return `test-${Date.now()}@example.com`;
}

export function generateTestSlug(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
```

## Running Tests

### Local Development

```bash
# Start test database
supabase start

# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run specific test suite
npm test -- programs

# Generate coverage report
npm test -- --coverage
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run migrate:test

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Coverage Requirements

| Category | Minimum Coverage |
|----------|-----------------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

## API Test Checklist

### For each endpoint, test:

- [ ] Success case with valid data
- [ ] Pagination (page, limit)
- [ ] Filtering (category, type, status, etc.)
- [ ] Search functionality
- [ ] Sorting (sort, order)
- [ ] Error case: Invalid parameters
- [ ] Error case: Resource not found
- [ ] Error case: Validation failures
- [ ] Response format matches schema
- [ ] Meta data is correct

### For form submissions, test:

- [ ] Required field validation
- [ ] Email format validation
- [ ] Min/max length validation
- [ ] Enum value validation
- [ ] Successful submission
- [ ] Duplicate prevention (where applicable)
- [ ] Response includes reference/ID

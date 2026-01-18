# 📄 3. Frontend Documentation

Create this in `loan-tracker-frontend/README.md`

#### 📄 `loan-tracker-frontend/README.md`

```markdown
# 💻 Loan Tracker Frontend

Modern, responsive React application for managing loans with real-time updates and intuitive UI.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Components](#components)
- [Pages](#pages)
- [State Management](#state-management)
- [Routing](#routing)
- [Styling](#styling)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Best Practices](#best-practices)

---

## 🎯 Overview

The frontend provides:

- Responsive design (mobile, tablet, desktop)
- Real-time loan tracking
- Interactive dashboard with statistics
- Advanced search and filtering
- Toast notifications
- Color-coded status indicators
- History timeline visualization
- Form validation with error feedback

---

## 🛠 Tech Stack

- **React 18.2** - UI library with Hooks
- **Vite 5.x** - Build tool and dev server
- **React Router v6** - Client-side routing
- **TailwindCSS (CDN)** - Utility-first CSS
- **Axios** - HTTP client
- **date-fns** - Date manipulation library
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library (1000+ icons)
- **Headless UI** - Unstyled accessible components

---

## 🏗 Architecture
```

Component Hierarchy:
App
├── Router
├── Layout
│ ├── Header
│ ├── Sidebar
│ └── Main Content
│ ├── Dashboard
│ ├── LoanList
│ │ ├── LoanTable
│ │ └── LoanCard
│ ├── LoanDetail
│ │ └── LoanHistoryTimeline
│ ├── AddLoan
│ │ └── LoanForm
│ ├── EditLoan
│ │ └── LoanForm
│ └── Settings
└── Toast Provider

````

---

## 📦 Installation

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Steps

1. **Install dependencies**

```bash
npm install
````

2. **Create `.env` file**

```bash
cp .env.example .env
```

3. **Configure environment variables**

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Loan Tracker
```

4. **Start development server**

```bash
npm run dev
```

Application will run on `http://localhost:5173`

---

## ⚙️ Configuration

### Environment Variables

| Variable        | Description          | Example                     | Required |
| --------------- | -------------------- | --------------------------- | -------- |
| `VITE_API_URL`  | Backend API base URL | `http://localhost:5000/api` | Yes      |
| `VITE_APP_NAME` | Application name     | `Loan Tracker`              | No       |

**Note:** All Vite environment variables must be prefixed with `VITE_`

### Accessing Environment Variables

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

---

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── common/             # Reusable components
│   │   ├── StatusBadge.jsx       # Status indicator
│   │   ├── LoadingSpinner.jsx    # Loading state
│   │   ├── EmptyState.jsx        # Empty data state
│   │   ├── ConfirmDialog.jsx     # Confirmation modal
│   │   ├── SearchInput.jsx       # Search field
│   │   ├── Pagination.jsx        # Pagination controls
│   │   └── ErrorBoundary.jsx     # Error boundary
│   │
│   ├── layout/             # Layout components
│   │   └── Layout.jsx            # Main app layout
│   │
│   ├── loans/              # Loan-specific components
│   │   ├── LoanCard.jsx          # Loan card (mobile)
│   │   ├── LoanTable.jsx         # Loan table (desktop)
│   │   ├── LoanForm.jsx          # Add/Edit form
│   │   ├── LoanHistoryTimeline.jsx # History display
│   │   └── StatsCard.jsx         # Statistics card
│   │
│   └── notifications/      # Notification components
│
├── context/                # React Context
│   └── AppContext.jsx            # Global state management
│
├── hooks/                  # Custom React hooks
│   └── useLoans.js               # Loan operations hook
│
├── pages/                  # Page components
│   ├── Dashboard.jsx             # Dashboard page
│   ├── LoanList.jsx              # Loan list page
│   ├── LoanDetail.jsx            # Loan detail page
│   ├── AddLoan.jsx               # Add loan page
│   ├── EditLoan.jsx              # Edit loan page
│   ├── Settings.jsx              # Settings page
│   └── NotFound.jsx              # 404 page
│
├── services/               # API services
│   ├── api.js                    # Axios configuration
│   └── loanService.js            # Loan API calls
│
├── utils/                  # Utility functions
│   ├── constants.js              # App constants
│   └── helpers.js                # Helper functions
│
├── App.jsx                 # Main app component
├── main.jsx                # App entry point
└── index.css               # Global styles
```

---

## 🧩 Components

### Common Components

#### StatusBadge

Displays loan status with color coding.

```jsx
import StatusBadge from '../components/common/StatusBadge';

<StatusBadge status="active" />
<StatusBadge status="dueSoon" />
<StatusBadge status="overdue" />
<StatusBadge status="completed" />
```

**Status Colors:**

- 🟢 Active - Green
- 🟡 Due Soon - Yellow
- 🔴 Overdue - Red
- ⚪ Completed - Gray

---

#### LoadingSpinner

Loading state indicator.

```jsx
import LoadingSpinner from '../components/common/LoadingSpinner';

<LoadingSpinner size="sm" />   // Small
<LoadingSpinner size="md" />   // Medium (default)
<LoadingSpinner size="lg" />   // Large
```

---

#### EmptyState

Display when no data is available.

```jsx
import EmptyState from "../components/common/EmptyState";

<EmptyState
  icon={FileText}
  title="No loans yet"
  description="Get started by adding your first loan"
  action={<button>Add Loan</button>}
/>;
```

---

#### ConfirmDialog

Confirmation modal using Headless UI.

```jsx
import ConfirmDialog from "../components/common/ConfirmDialog";

<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  title="Delete Loan"
  message="Are you sure?"
  confirmText="Delete"
  cancelText="Cancel"
  type="danger" // or "warning", "info"
/>;
```

---

#### SearchInput

Debounced search input.

```jsx
import SearchInput from "../components/common/SearchInput";

<SearchInput
  value={searchTerm}
  onSearch={handleSearch}
  placeholder="Search loans..."
/>;
```

**Features:**

- Auto-debounce (500ms)
- Clear button
- Icon support

---

#### Pagination

Pagination controls.

```jsx
import Pagination from "../components/common/Pagination";

<Pagination currentPage={1} totalPages={10} onPageChange={handlePageChange} />;
```

---

### Layout Components

#### Layout

Main application layout with header, sidebar, and content area.

**Features:**

- Responsive sidebar (collapsible on mobile)
- Navigation menu
- User profile section
- Notification bell
- Mobile hamburger menu

---

### Loan Components

#### LoanCard

Mobile-friendly card view.

```jsx
import LoanCard from "../components/loans/LoanCard";

<LoanCard loan={loanData} onDelete={handleDelete} />;
```

---

#### LoanTable

Desktop table view with sorting.

```jsx
import LoanTable from "../components/loans/LoanTable";

<LoanTable
  loans={loans}
  onDelete={handleDelete}
  onSort={handleSort}
  sortBy="dueDate"
  sortOrder="asc"
/>;
```

---

#### LoanForm

Reusable form for add/edit.

```jsx
import LoanForm from "../components/loans/LoanForm";

<LoanForm
  initialData={loan} // Optional, for edit mode
  onSubmit={handleSubmit}
  isLoading={loading}
/>;
```

**Validation:**

- Client-side validation
- Real-time error display
- Required field indicators

---

#### LoanHistoryTimeline

Visual timeline of loan changes.

```jsx
import LoanHistoryTimeline from "../components/loans/LoanHistoryTimeline";

<LoanHistoryTimeline history={loan.history} />;
```

**Displays:**

- Due date extensions
- Interest updates
- Loan creation
- Timestamps

---

#### StatsCard

Dashboard statistics card.

```jsx
import StatsCard from "../components/loans/StatsCard";

<StatsCard
  title="Total Loans"
  value="150"
  subtitle="All loans tracked"
  icon={FileText}
  color="blue"
  trend="up"
  trendValue="+12%"
/>;
```

---

## 📄 Pages

### Dashboard

**Route:** `/`

**Features:**

- Statistics cards (total loans, amount, interest)
- Overdue loans alert section
- Due soon loans alert section
- Recent loans preview
- Quick action buttons

**Key Components:**

- StatsCard
- LoanCard
- EmptyState

---

### Loan List

**Route:** `/loans`

**Features:**

- Table and grid view toggle
- Search by borrower name
- Filter by status
- Sort by multiple fields
- Pagination
- Bulk actions

**Query Parameters:**

- `?status=active` - Filter by status
- `?search=john` - Search term
- `?page=2` - Page number

**Key Components:**

- LoanTable
- LoanCard
- SearchInput
- Pagination

---

### Loan Detail

**Route:** `/loans/:id`

**Features:**

- Complete loan information
- Borrower contact details
- History timeline
- Quick actions (extend, update interest, edit)
- Delete functionality
- Status indicators

**Actions:**

- Extend due date (with modal)
- Update interest (with modal)
- Edit loan
- Delete loan
- Mark as completed

**Key Components:**

- LoanHistoryTimeline
- ConfirmDialog
- StatusBadge

---

### Add Loan

**Route:** `/loans/new`

**Features:**

- Multi-section form
- Real-time validation
- Error feedback
- Cancel action
- Auto-calculate status

**Form Sections:**

1. Borrower Information
2. Loan Details

---

### Edit Loan

**Route:** `/loans/:id/edit`

**Features:**

- Pre-populated form
- Same validation as add
- Update confirmation
- Cancel action

---

### Settings

**Route:** `/settings`

**Features:**

- Email service testing
- Send test email
- Trigger reminders manually
- Scheduler status check

**Admin Tools:**

- Connection test
- Email test
- Manual reminder trigger

---

### Not Found

**Route:** `*` (catch-all)

**Features:**

- 404 error page
- Navigation back to home
- Go back button

---

## 🔄 State Management

### Global State (Context API)

Located in `src/context/AppContext.jsx`

**State Structure:**

```javascript
{
  loans: [],              // All loans
  selectedLoan: null,     // Currently selected loan
  isLoading: false,       // Global loading state
  error: null,            // Global error
  filters: {              // Current filters
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {           // Pagination state
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  },
  notifications: {        // Notification counts
    dueSoon: [],
    overdue: []
  }
}
```

**Actions:**

- `setLoading(boolean)`
- `setError(string)`
- `setLoans(array)`
- `addLoan(loan)`
- `updateLoan(loan)`
- `deleteLoan(loanId)`
- `setFilters(filters)`
- `setPagination(pagination)`

**Usage:**

```jsx
import { useAppContext } from "../context/AppContext";

function MyComponent() {
  const { loans, setLoans, isLoading } = useAppContext();

  // Use state and actions
}
```

---

### Local State

Component-level state using `useState`:

```jsx
const [viewMode, setViewMode] = useState("table");
const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loan: null });
```

---

## 🗺 Routing

### Routes Configuration

```javascript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/loans" element={<LoanList />} />
  <Route path="/loans/new" element={<AddLoan />} />
  <Route path="/loans/:id" element={<LoanDetail />} />
  <Route path="/loans/:id/edit" element={<EditLoan />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Navigation

**Programmatic Navigation:**

```jsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Navigate to route
navigate("/loans");

// Navigate with state
navigate("/loans/123", { state: { fromDashboard: true } });

// Go back
navigate(-1);
```

**Link Component:**

```jsx
import { Link } from "react-router-dom";

<Link to="/loans/123">View Loan</Link>;
```

**Route Parameters:**

```jsx
import { useParams } from "react-router-dom";

const { id } = useParams();
```

**Query Parameters:**

```jsx
import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();

// Get param
const status = searchParams.get("status");

// Set params
setSearchParams({ status: "active", page: "1" });
```

---

## 🎨 Styling

### TailwindCSS (CDN)

Using Tailwind via CDN for simplicity.

**Configuration in `index.html`:**

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: { ... },
          status: {
            active: '#22c55e',
            dueSoon: '#eab308',
            overdue: '#ef4444',
            completed: '#6b7280'
          }
        }
      }
    }
  }
</script>
```

### Custom CSS Classes

Defined in `src/index.css`:

**Buttons:**

- `.btn` - Base button
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-danger` - Danger button
- `.btn-outline` - Outlined button

**Inputs:**

- `.input` - Base input
- `.input-error` - Error state input
- `.label` - Form label

**Cards:**

- `.card` - Card container
- `.card-header` - Card header
- `.card-body` - Card body

**Tables:**

- `.table-container` - Table wrapper
- `.table` - Table element
- `.table-header` - Table header
- `.table-body` - Table body
- `.table-row` - Table row
- `.table-cell` - Table cell

**Status Badges:**

- `.badge` - Base badge
- `.badge-active` - Active badge
- `.badge-dueSoon` - Due soon badge
- `.badge-overdue` - Overdue badge
- `.badge-completed` - Completed badge

---

## 🌐 API Integration

### Axios Configuration

Located in `src/services/api.js`

**Base Configuration:**

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Interceptors:**

Request interceptor (adds auth token):

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Response interceptor (handles errors):

```javascript
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  },
);
```

---

### Loan Service

Located in `src/services/loanService.js`

**Available Methods:**

```javascript
// Get all loans
loanService.getAll({ page, limit, status, search });

// Get single loan
loanService.getById(id);

// Create loan
loanService.create(loanData);

// Update loan
loanService.update(id, loanData);

// Delete loan
loanService.delete(id);

// Extend due date
loanService.extendDueDate(id, { extendedDueDate, notes });

// Update interest
loanService.updateInterest(id, { additionalInterest, notes });

// Get due soon loans
loanService.getDueSoon();

// Get overdue loans
loanService.getOverdue();
```

**Usage Example:**

```javascript
import loanService from "../services/loanService";

const fetchLoans = async () => {
  try {
    const response = await loanService.getAll({ page: 1, limit: 10 });
    setLoans(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

---

### Custom Hook (useLoans)

Located in `src/hooks/useLoans.js`

**Provides:**

- Abstracted API calls
- Loading states
- Error handling
- Toast notifications
- Context integration

**Usage:**

```jsx
import useLoans from '../hooks/useLoans';

function LoanList() {
  const {
    loans,
    loading,
    fetchLoans,
    deleteLoan
  } = useLoans();

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    // Component JSX
  );
}
```

---

## 🚀 Deployment

### Deploy to Vercel

#### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Method 2: GitHub Integration

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/loan-tracker-frontend.git
git push -u origin main
```

2. **Import on Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add environment variables:
     - `VITE_API_URL=https://your-backend-url.onrender.com/api`

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your URL: `https://your-app.vercel.app`

#### Method 3: Manual Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to any static host
```

---

### Build Optimization

**Vite automatically optimizes:**

- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Cache busting

**Build output:**

```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images]
└── index.html
```

---

## 🎯 Best Practices

### Code Organization

✅ **Component Structure:**

- One component per file
- Named exports for utilities
- Default export for components
- Props destructuring
- PropTypes for type checking (optional)

✅ **File Naming:**

- Components: PascalCase (e.g., `LoanCard.jsx`)
- Hooks: camelCase with "use" prefix (e.g., `useLoans.js`)
- Utilities: camelCase (e.g., `helpers.js`)
- Constants: UPPER_SNAKE_CASE

✅ **Import Order:**

1. React imports
2. Third-party imports
3. Local component imports
4. Utility imports
5. Style imports

```jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import LoanCard from "../components/loans/LoanCard";
import { formatDate } from "../utils/helpers";
```

---

### Performance

✅ **Use React.memo for expensive components:**

```jsx
export default React.memo(LoanCard);
```

✅ **Use useCallback for functions:**

```jsx
const handleDelete = useCallback(
  (id) => {
    // Delete logic
  },
  [dependencies],
);
```

✅ **Use useMemo for computed values:**

```jsx
const sortedLoans = useMemo(() => {
  return loans.sort(...);
}, [loans]);
```

✅ **Lazy load routes:**

```jsx
const Dashboard = lazy(() => import("./pages/Dashboard"));
```

---

### Error Handling

✅ **Use Error Boundaries:**

```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

✅ **Handle async errors:**

```jsx
try {
  await loanService.create(data);
} catch (error) {
  toast.error(classifyError(error));
}
```

✅ **Provide fallback UI:**

```jsx
{
  isLoading ? <LoadingSpinner /> : <LoanList />;
}
{
  error && <ErrorMessage message={error} />;
}
```

---

### Accessibility

✅ **Semantic HTML:**

```jsx
<button type="button">Click</button>
<nav>...</nav>
<main>...</main>
```

✅ **ARIA labels:**

```jsx
<button aria-label="Delete loan">
  <TrashIcon />
</button>
```

✅ **Keyboard navigation:**

```jsx
<button onClick={handleClick} onKeyPress={handleKeyPress}>
```

✅ **Focus management:**

```jsx
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

---

## 🔧 Utilities

### Helper Functions

Located in `src/utils/helpers.js`

**Date Formatting:**

```javascript
formatDate(date, "MMM dd, yyyy");
formatDateForInput(date);
getDaysRemaining(dueDate);
getDaysRemainingText(dueDate);
```

**Currency:**

```javascript
formatCurrency(amount, "USD");
formatNumber(num);
```

**Status:**

```javascript
calculateStatus(loan, threshold);
getEffectiveDueDate(loan);
```

**Text:**

```javascript
truncateText(text, maxLength);
```

**Other:**

```javascript
debounce(func, wait);
generateId();
classifyError(error);
```

---

### Constants

Located in `src/utils/constants.js`

```javascript
export const LOAN_STATUS = {
  ACTIVE: 'active',
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  COMPLETED: 'completed'
};

export const STATUS_CONFIG = {
  active: { label: 'Active', color: 'green', ... },
  dueSoon: { label: 'Due Soon', color: 'yellow', ... },
  overdue: { label: 'Overdue', color: 'red', ... },
  completed: { label: 'Completed', color: 'gray', ... }
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  FULL: 'MMMM dd, yyyy'
};
```

---

## 🐛 Troubleshooting

### Common Issues

**Vite dev server not starting:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Check port 5173 is not in use
```

**API calls failing:**

```bash
# Check VITE_API_URL in .env
# Verify backend is running
# Check browser console for CORS errors
```

**Build errors:**

```bash
# Clear cache
rm -rf dist
npm run build

# Check for unused imports
# Verify all dependencies are installed
```

**Styling not applying:**

```bash
# Verify Tailwind CDN script in index.html
# Check class names spelling
# Clear browser cache (Ctrl+Shift+R)
```

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [date-fns](https://date-fns.org/)

---

## 🤝 Contributing

See main [README.md](../README.md#contributing) for contribution guidelines.

---

**Built with React ⚛️**

```

---

## 🎉 Summary



#
```

# Dynamic Component Architecture Plan

## 📋 Overview

This document outlines the plan to refactor the frontend into a **dynamic, role-based component system** that eliminates code duplication and provides a consistent, scalable architecture for all user roles (Teacher, Student, Coordinator, Principal, Super Admin).

## 🎯 Goals

1. **DRY Principle**: Eliminate duplicate code across different role views
2. **Maintainability**: Single source of truth for UI components
3. **Scalability**: Easy to add new roles or features
4. **Consistency**: Uniform look and feel across all pages
5. **Type Safety**: Leverage TypeScript for robust type checking
6. **Performance**: Optimized bundle size through component reusability

## 🔍 Current Problems

### Problem 1: Code Duplication
- **Teacher List**: `frontend/src/app/admin/teachers/list/page.tsx` (508 lines)
- **Coordinator Teacher List**: `frontend/src/app/admin/coordinator/teacher-list/page.tsx` (221 lines)
- **Student List**: `frontend/src/app/admin/students/student-list/page.tsx`
- **Issue**: Similar functionality, duplicated code for tables, filters, search, pagination

### Problem 2: Inconsistent Patterns
- Different parameter names (`id` vs `teacherId` vs `studentId`)
- Different error handling approaches
- Inconsistent loading states
- Varying styling patterns

### Problem 3: Maintenance Overhead
- Bug fixes need to be applied to multiple files
- Feature additions require changes in multiple places
- Styling updates need to be synchronized
- Testing becomes repetitive

### Problem 4: Scalability Issues
- Adding new entity types requires full page implementation
- Role-based views need separate implementations
- No clear separation of concerns

## 💡 Proposed Solution

### Architecture Overview

```
frontend/src/
├── components/
│   ├── shared/              # Reusable components
│   │   ├── DataTable/       # Generic table component
│   │   ├── ProfileView/     # Generic profile layout
│   │   ├── Dashboard/       # Dashboard widgets
│   │   ├── Forms/           # Form components
│   │   └── Layout/          # Layout components
│   │
│   ├── features/            # Feature-specific components
│   │   ├── teacher/         # Teacher-specific components
│   │   ├── student/         # Student-specific components
│   │   ├── coordinator/     # Coordinator-specific components
│   │   └── principal/       # Principal-specific components
│   │
├── config/                  # Configuration files
│   ├── entities/            # Entity configurations
│   │   ├── teacher.config.ts
│   │   ├── student.config.ts
│   │   ├── coordinator.config.ts
│   │   └── principal.config.ts
│   │
│   ├── routes.config.ts     # Route permissions
│   └── theme.config.ts      # Theming configuration
│   │
├── hooks/                   # Custom React hooks
│   ├── useEntityData.ts     # Generic data fetching
│   ├── useRoleConfig.ts     # Role configuration hook
│   ├── usePermissions.ts    # Permission checking
│   └── useFilters.ts        # Filter management
│   │
├── types/                   # TypeScript definitions
│   ├── entities.ts          # Entity types
│   ├── config.ts            # Configuration types
│   └── common.ts            # Common types
│   │
└── app/
    └── admin/
        ├── [role]/          # Dynamic role-based routes
        │   ├── page.tsx     # Dashboard
        │   ├── list/
        │   │   └── page.tsx # Generic list view
        │   └── profile/
        │       └── [id]/
        │           └── page.tsx # Generic profile
        └── legacy/          # Old implementation (gradual migration)
```

## 🏗️ Core Components

### 1. Generic Data Table Component

**File**: `components/shared/DataTable/DataTable.tsx`

```typescript
interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface Action<T> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  variant?: 'default' | 'outline' | 'destructive';
  permission?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  error?: string | null;
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    currentPage?: number;
    totalCount?: number;
    onPageChange?: (page: number) => void;
  };
  filters?: FilterConfig[];
  onFilterChange?: (filters: any) => void;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  actions,
  loading,
  error,
  searchable = true,
  pagination,
  filters,
  ...props
}: DataTableProps<T>) {
  // Implementation
}
```

**Features**:
- Generic type support for any entity
- Built-in search functionality
- Column sorting
- Row actions with permission checks
- Pagination support
- Filter integration
- Loading and error states
- Empty state handling
- Responsive design

### 2. Entity Configuration System

**File**: `config/entities/teacher.config.ts`

```typescript
import { EntityConfig } from '@/types/config';

export const teacherConfig: EntityConfig = {
  // Basic Information
  entity: 'teacher',
  displayName: 'Teacher',
  displayNamePlural: 'Teachers',
  icon: 'Users',
  
  // API Configuration
  api: {
    endpoint: '/api/teachers/',
    listEndpoint: '/api/teachers/',
    detailEndpoint: (id) => `/api/teachers/${id}/`,
    createEndpoint: '/api/teachers/',
    updateEndpoint: (id) => `/api/teachers/${id}/`,
    deleteEndpoint: (id) => `/api/teachers/${id}/`,
  },
  
  // List View Configuration
  listView: {
    title: 'Teacher Management',
    description: 'View and manage all teachers',
    
    // Table Columns
    columns: [
      {
        key: 'full_name',
        label: 'Name',
        sortable: true,
        searchable: true,
        width: '20%',
      },
      {
        key: 'employee_code',
        label: 'Employee Code',
        sortable: true,
        searchable: true,
        width: '15%',
      },
      {
        key: 'email',
        label: 'Email',
        searchable: true,
        width: '20%',
      },
      {
        key: 'current_subjects',
        label: 'Subjects',
        width: '15%',
        render: (value) => value || 'Not Assigned',
      },
      {
        key: 'coordinator_names',
        label: 'Coordinators',
        width: '20%',
        render: (value: string[]) => {
          if (!value || value.length === 0) return 'None';
          return value.join(', ');
        },
      },
      {
        key: 'is_currently_active',
        label: 'Status',
        width: '10%',
        render: (value: boolean) => (
          <Badge variant={value ? 'success' : 'secondary'}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    
    // Available Filters
    filters: [
      {
        key: 'current_campus',
        label: 'Campus',
        type: 'select',
        options: [], // Dynamically loaded
      },
      {
        key: 'shift',
        label: 'Shift',
        type: 'select',
        options: [
          { value: 'morning', label: 'Morning' },
          { value: 'afternoon', label: 'Afternoon' },
          { value: 'evening', label: 'Evening' },
        ],
      },
      {
        key: 'is_currently_active',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ],
      },
    ],
    
    // Row Actions
    actions: [
      {
        icon: 'Eye',
        label: 'View Profile',
        route: (id) => `/admin/teachers/profile?id=${id}`,
        permission: 'view_teacher',
      },
      {
        icon: 'Edit',
        label: 'Edit',
        route: (id) => `/admin/teachers/edit?id=${id}`,
        permission: 'edit_teacher',
      },
      {
        icon: 'Trash',
        label: 'Delete',
        action: 'delete',
        permission: 'delete_teacher',
        confirmMessage: 'Are you sure you want to delete this teacher?',
      },
    ],
    
    // Bulk Actions
    bulkActions: [
      {
        label: 'Export Selected',
        action: 'export',
        permission: 'export_teachers',
      },
      {
        label: 'Send Notification',
        action: 'notify',
        permission: 'notify_teachers',
      },
    ],
    
    // Search Configuration
    search: {
      enabled: true,
      placeholder: 'Search by name, email, or employee code...',
      fields: ['full_name', 'email', 'employee_code'],
    },
    
    // Pagination
    pagination: {
      enabled: true,
      defaultPageSize: 50,
      pageSizeOptions: [10, 25, 50, 100],
    },
  },
  
  // Profile View Configuration
  profileView: {
    title: (data) => data.full_name,
    subtitle: (data) => data.employee_code,
    
    sections: [
      {
        id: 'personal',
        title: 'Personal Information',
        icon: 'User',
        fields: [
          { key: 'full_name', label: 'Full Name' },
          { key: 'email', label: 'Email' },
          { key: 'contact_number', label: 'Phone' },
          { key: 'dob', label: 'Date of Birth', format: 'date' },
          { key: 'gender', label: 'Gender' },
          { key: 'cnic', label: 'CNIC' },
        ],
      },
      {
        id: 'professional',
        title: 'Professional Details',
        icon: 'Briefcase',
        fields: [
          { key: 'employee_code', label: 'Employee Code' },
          { key: 'joining_date', label: 'Joining Date', format: 'date' },
          { key: 'total_experience_years', label: 'Experience', suffix: 'years' },
          { key: 'current_role_title', label: 'Role' },
          { key: 'current_subjects', label: 'Subjects' },
          { key: 'current_classes_taught', label: 'Classes' },
        ],
      },
      {
        id: 'assignment',
        title: 'Assignment Details',
        icon: 'Users',
        fields: [
          { 
            key: 'campus_name', 
            label: 'Campus',
            render: (data) => data.campus_data?.campus_name || 'Not Assigned'
          },
          { 
            key: 'coordinator_names', 
            label: 'Coordinators',
            render: (data) => data.coordinator_names?.join(', ') || 'None'
          },
          { 
            key: 'classroom_name', 
            label: 'Assigned Classroom',
            render: (data) => data.classroom_data 
              ? `${data.classroom_data.grade.name} - ${data.classroom_data.section}`
              : 'Not Assigned'
          },
          { key: 'is_class_teacher', label: 'Class Teacher', format: 'boolean' },
        ],
      },
      {
        id: 'education',
        title: 'Education',
        icon: 'GraduationCap',
        fields: [
          { key: 'education_level', label: 'Degree' },
          { key: 'institution_name', label: 'Institution' },
          { key: 'year_of_passing', label: 'Year of Passing' },
          { key: 'education_subjects', label: 'Subjects' },
          { key: 'education_grade', label: 'Grade' },
        ],
      },
    ],
    
    actions: [
      {
        label: 'Edit Profile',
        icon: 'Edit',
        route: (id) => `/admin/teachers/edit?id=${id}`,
        permission: 'edit_teacher',
        variant: 'default',
      },
      {
        label: 'View Attendance',
        icon: 'Calendar',
        route: (id) => `/admin/attendance?teacher=${id}`,
        permission: 'view_attendance',
        variant: 'outline',
      },
      {
        label: 'Assign Classes',
        icon: 'BookOpen',
        action: 'assign_classes',
        permission: 'assign_classes',
        variant: 'outline',
      },
    ],
  },
  
  // Form Configuration (for create/edit)
  formView: {
    sections: [
      {
        title: 'Personal Information',
        fields: [
          { key: 'full_name', label: 'Full Name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'contact_number', label: 'Phone', type: 'tel', required: true },
          { key: 'dob', label: 'Date of Birth', type: 'date', required: true },
          { key: 'gender', label: 'Gender', type: 'select', required: true, options: ['male', 'female', 'other'] },
          { key: 'cnic', label: 'CNIC', type: 'text', pattern: '[0-9]{5}-[0-9]{7}-[0-9]' },
        ],
      },
      // Additional form sections...
    ],
  },
  
  // Role-Based Permissions
  permissions: {
    superadmin: ['view', 'create', 'edit', 'delete', 'export'],
    principal: ['view', 'create', 'edit', 'export'],
    coordinator: ['view'],
    teacher: [],
  },
  
  // Dashboard Widgets (for role-specific dashboards)
  dashboardWidgets: {
    coordinator: [
      {
        type: 'stat',
        title: 'Total Teachers',
        key: 'total_teachers',
        icon: 'Users',
        color: 'blue',
      },
      {
        type: 'stat',
        title: 'Active Teachers',
        key: 'active_teachers',
        icon: 'CheckCircle',
        color: 'green',
      },
      {
        type: 'list',
        title: 'Recent Activities',
        key: 'recent_activities',
      },
    ],
    principal: [
      // Principal-specific widgets
    ],
  },
};
```

### 3. Dynamic List Page Component

**File**: `app/admin/[role]/[entity]/list/page.tsx`

```typescript
'use client';

import { useParams } from 'next/navigation';
import { DataTable } from '@/components/shared/DataTable';
import { useEntityData } from '@/hooks/useEntityData';
import { useRoleConfig } from '@/hooks/useRoleConfig';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DynamicEntityListPage() {
  const params = useParams();
  const { role, entity } = params;
  
  // Get entity configuration based on role and entity type
  const config = useRoleConfig(role, entity);
  
  // Fetch data using generic hook
  const {
    data,
    loading,
    error,
    pagination,
    filters,
    search,
    refresh,
  } = useEntityData({
    endpoint: config.api.listEndpoint,
    filters: config.listView.filters,
    pagination: config.listView.pagination,
  });
  
  if (!config) {
    return <div>Invalid entity configuration</div>;
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={config.listView.title}
        description={config.listView.description}
        actions={config.listView.headerActions}
      />
      
      <DataTable
        data={data}
        columns={config.listView.columns}
        actions={config.listView.actions}
        loading={loading}
        error={error}
        searchable={config.listView.search.enabled}
        searchPlaceholder={config.listView.search.placeholder}
        pagination={pagination}
        filters={filters}
        bulkActions={config.listView.bulkActions}
      />
    </div>
  );
}
```

### 4. Generic Profile View Component

**File**: `components/shared/ProfileView/ProfileView.tsx`

```typescript
interface ProfileViewProps<T> {
  data: T;
  config: EntityConfig;
  loading?: boolean;
  error?: string | null;
}

export function ProfileView<T>({ data, config, loading, error }: ProfileViewProps<T>) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <NotFoundState />;
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        title={config.profileView.title(data)}
        subtitle={config.profileView.subtitle(data)}
        actions={config.profileView.actions}
      />
      
      {/* Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.profileView.sections.map((section) => (
          <ProfileSection
            key={section.id}
            title={section.title}
            icon={section.icon}
            fields={section.fields}
            data={data}
          />
        ))}
      </div>
    </div>
  );
}
```

### 5. Custom Hooks

**File**: `hooks/useEntityData.ts`

```typescript
export function useEntityData({ endpoint, filters, pagination }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ... implementation with caching, filtering, pagination
  
  return {
    data,
    loading,
    error,
    refresh,
    // ... other methods
  };
}
```

**File**: `hooks/useRoleConfig.ts`

```typescript
import { teacherConfig } from '@/config/entities/teacher.config';
import { studentConfig } from '@/config/entities/student.config';
// ... other configs

export function useRoleConfig(role: string, entity: string) {
  const configs = {
    teacher: teacherConfig,
    student: studentConfig,
    coordinator: coordinatorConfig,
    principal: principalConfig,
  };
  
  const config = configs[entity];
  
  // Filter based on role permissions
  return filterConfigByRole(config, role);
}
```

## 📊 Migration Strategy

### Phase 1: Foundation (Week 1-2)
- [ ] Create base component structure
- [ ] Implement Generic DataTable component
- [ ] Implement Generic ProfileView component
- [ ] Create TypeScript types and interfaces
- [ ] Set up configuration system

### Phase 2: Configuration (Week 2-3)
- [ ] Create teacher.config.ts
- [ ] Create student.config.ts
- [ ] Create coordinator.config.ts
- [ ] Create principal.config.ts
- [ ] Implement useRoleConfig hook
- [ ] Implement useEntityData hook

### Phase 3: Migration (Week 3-5)
- [ ] Migrate Teacher List to dynamic component
- [ ] Migrate Student List to dynamic component
- [ ] Migrate Coordinator views to dynamic components
- [ ] Migrate Profile pages to dynamic ProfileView
- [ ] Update routing structure

### Phase 4: Testing & Refinement (Week 5-6)
- [ ] Test all role-based views
- [ ] Test permissions and access control
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Documentation updates

### Phase 5: Cleanup (Week 6-7)
- [ ] Remove legacy code
- [ ] Final testing
- [ ] Code review
- [ ] Deploy to production

## ✅ Benefits

### For Development
- ⚡ **Faster Development**: New features added once, work everywhere
- 🐛 **Easier Debugging**: Single component to fix
- 🧪 **Better Testing**: Test generic components once
- 📝 **Clearer Code**: Separation of concerns

### For Maintenance
- 🔧 **Easy Updates**: Update configuration, not code
- 🎨 **Consistent UI**: Same components everywhere
- 📦 **Smaller Bundle**: Shared components, less duplication
- 🚀 **Better Performance**: Optimized shared components

### For Business
- ⏱️ **Time Savings**: Less development time
- 💰 **Cost Reduction**: Less maintenance overhead
- 📈 **Scalability**: Easy to add new roles/features
- ✨ **Better UX**: Consistent experience

## 🎯 Success Metrics

- **Code Reduction**: Target 60% reduction in component code
- **Development Speed**: 50% faster feature implementation
- **Bug Rate**: 40% reduction in UI-related bugs
- **Bundle Size**: 30% smaller bundle size
- **Test Coverage**: 90%+ coverage on shared components

## 📚 Documentation Requirements

- [ ] Component API documentation
- [ ] Configuration guide
- [ ] Migration guide for developers
- [ ] Best practices guide
- [ ] Example implementations

## 🔐 Security Considerations

- Role-based access control at configuration level
- Permission checks in components
- API endpoint validation
- Data sanitization in renderers
- XSS protection in custom renders

## 🚀 Future Enhancements

### Phase 2 Features
- Advanced filtering with saved filters
- Customizable column visibility
- Export functionality (CSV, PDF, Excel)
- Bulk operations framework
- Real-time updates with WebSocket
- Offline support with service workers

### Phase 3 Features
- Drag-and-drop column reordering
- Custom dashboard builder
- Advanced reporting system
- Mobile-optimized views
- Accessibility improvements (WCAG 2.1 AA)

## 📝 Notes

- This is a **living document** - update as requirements change
- Prioritize **backward compatibility** during migration
- Keep **performance** in mind - profile and optimize
- Maintain **type safety** throughout implementation
- Document **all breaking changes**

## 👥 Stakeholders

- **Development Team**: Implementation and testing
- **Product Manager**: Requirements and priorities
- **UX/UI Designer**: Design consistency
- **QA Team**: Testing and validation

---

**Status**: 📋 Planning Phase  
**Priority**: 🔥 High (Post-MVP)  
**Estimated Effort**: 6-7 weeks  
**Risk Level**: 🟡 Medium (Requires careful migration)

**Next Steps**: 
1. Review and approve this plan
2. Create detailed tasks in project management tool
3. Assign resources and timeline
4. Begin Phase 1 implementation after MVP demo


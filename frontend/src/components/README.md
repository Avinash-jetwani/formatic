# Formatic Component Library

This is a collection of reusable UI components designed for consistency, accessibility, and responsiveness across the Formatic application.

## Component Categories

### UI Components
Basic building blocks that can be used throughout the application:

- **Button**: Customizable button with various styles, sizes, and states
- **Card**: Container component with header, content, and footer sections
- **Input**: Form inputs including text fields and textareas
- **Table**: Data table with customizable headers, rows, and cells
- **Loading**: Loading indicators and skeleton screens
- **Typography**: Text styling components (coming soon)

### Composite Components
More complex components that combine multiple UI components:

- **DateRangePicker**: Date range selection with presets
- **Charts**: Line, bar, and pie charts using Recharts
- **SearchBar**: Search input with suggestions (coming soon)
- **Filters**: Filter controls for data (coming soon)
- **DataTable**: Advanced table with sorting, filtering, and pagination (coming soon)

### Layout Components
Components that define the structure of pages:

- **DashboardLayout**: Layout for dashboard pages
- **MainLayout**: Main application layout
- **Navbar**: Top navigation bar
- **Sidebar**: Side navigation menu

### Feature Components
Components specific to application features:

- **Auth**: Authentication related components
- **FormBuilder**: Form creation and editing components
- **Dashboard**: Dashboard specific components (coming soon)
- **Forms**: Form management components (coming soon)
- **Submissions**: Submission management components (coming soon)

## Usage Guidelines

### Responsive Design
All components are designed with mobile-first principles:

- Use responsive utilities (`sm:`, `md:`, `lg:`, `xl:`) consistently
- Test on multiple screen sizes
- Consider touch interactions for mobile

### Accessibility
Components follow accessibility best practices:

- Proper semantic HTML
- ARIA attributes where needed
- Keyboard navigation support
- Focus management

### Theming
Components use a consistent color palette and spacing system:

- Colors follow the application's brand guidelines
- Spacing is consistent using Tailwind's scale
- Typography follows a clear hierarchy

## Implementation Example

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components';

const ExampleComponent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is an example of using our component library.</p>
        <Button variant="primary">Click Me</Button>
      </CardContent>
    </Card>
  );
};
```

## Future Improvements

- Add more component variations
- Enhance accessibility features
- Create a storybook documentation
- Add unit and integration tests 
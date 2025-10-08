function usePermissions() {
  const { user, authenticated } = useAuth();

  return {
    isAdmin: authenticated && user?.role === 'ADMIN',
    isTeacher: authenticated && user?.role === 'TEACHER',
    isStudent: authenticated && user?.role === 'STUDENT',
    isParent: authenticated && user?.role === 'PARENT',
    
    // دسترسی‌های ترکیبی
    canManageUsers: authenticated && user?.role === 'ADMIN',
    canManageClasses: authenticated && (user?.role === 'ADMIN' || user?.role === 'TEACHER'),
    canViewGrades: authenticated && (user?.role === 'STUDENT' || user?.role === 'PARENT' || user?.role === 'TEACHER'),
  };
}

// استفاده
function MyComponent() {
  const { canManageUsers, canManageClasses } = usePermissions();

  return (
    <div>
      {canManageUsers && <button>مدیریت کاربران</button>}
      {canManageClasses && <button>مدیریت کلاس‌ها</button>}
    </div>
  );
}
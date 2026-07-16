export interface ResourceCategory {
  key: string;
  label: string;
  href: string;
}

// Currently just Blogs. Add new entries here as more categories of
// Resources content (talks, notes, etc.) come online.
export const resourceCategories: ResourceCategory[] = [
  { key: "blogs", label: "Blogs", href: "/resources" },
];

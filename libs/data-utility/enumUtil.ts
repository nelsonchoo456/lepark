export function formatEnumLabelToRemoveUnderscores(enumValue: string): string {
  if (enumValue === 'BBQ_PIT') {
    return "BBQ Pit"
  }
    return enumValue
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Add other enum-related utility functions here
export enum LightTypeEnum {
  FULL_SUN = 'FULL_SUN',
  PARTIAL_SHADE = 'PARTIAL_SHADE',
  FULL_SHADE = 'FULL_SHADE'
}

export enum SoilTypeEnum {
  SANDY = 'SANDY',
  CLAYEY = 'CLAYEY',
  LOAMY = 'LOAMY'
}

export enum ConservationStatusEnum {
  LEAST_CONCERN = 'LEAST_CONCERN',
  NEAR_THREATENED = 'NEAR_THREATENED',
  VULNERABLE = 'VULNERABLE',
  ENDANGERED = 'ENDANGERED',
  CRITICALLY_ENDANGERED = 'CRITICALLY_ENDANGERED',
  EXTINCT_IN_THE_WILD = 'EXTINCT_IN_THE_WILD',
  EXTINCT = 'EXTINCT'
}

export function formatEnumString(input: string | undefined): string {
  if (!input) return '';

  return input
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function convertToEnum<T extends Record<string, string>>(value: string, enumObject: T): T[keyof T] | undefined {
  const enumValues = Object.values(enumObject);
  const enumKeys = Object.keys(enumObject) as Array<keyof T>;

  const index = enumValues.findIndex(enumValue =>
    enumValue.toLowerCase().replace(/_/g, ' ') === value.toLowerCase()
  );

  if (index !== -1) {
    return enumObject[enumKeys[index] as keyof T];
  }

  return undefined;
}

export function convertLightType(value: string): LightTypeEnum | undefined {
  return convertToEnum(value, LightTypeEnum);
}

export function convertSoilType(value: string): SoilTypeEnum | undefined {
  return convertToEnum(value, SoilTypeEnum);
}

export function convertConservationStatus(value: string): ConservationStatusEnum | undefined {
  return convertToEnum(value, ConservationStatusEnum);
}

export function convertEnumToNormalFormat(enumString: string): string {
  // Split the string by underscores
  const words = enumString.split('_');

  // Capitalize the first letter of each word and lowercase the rest
  const normalizedWords = words.map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  // Join the words back together with spaces
  return normalizedWords.join(' ');
}

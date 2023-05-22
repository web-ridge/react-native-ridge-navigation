import { initialUrl, isExpoUrl } from './url';
import { useURL } from 'expo-linking';

export default function useUrl() {
  const url = useURL();

  if (isExpoUrl(url)) {
    return null;
  }

  let finalUrl = url || initialUrl;
  if (!finalUrl) {
    return null;
  }

  return removePrefix(finalUrl);
}

function removePrefix(str: string) {
  const parts = str.split('://');
  if (parts.length > 1) {
    return parts.slice(1).join('://');
  }
  return str;
}

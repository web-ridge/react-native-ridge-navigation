import { initialUrl, isExpoUrl } from './url';
import { useURL } from 'expo-linking';

export default function useUrl() {
  const url = useURL();

  if (isExpoUrl(url)) {
    return null;
  }

  return url || initialUrl;
}

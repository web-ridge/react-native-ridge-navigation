import { initialUrl } from './url';
import { useURL } from 'expo-linking';

export default function useUrl() {
  return useURL() || initialUrl;
}

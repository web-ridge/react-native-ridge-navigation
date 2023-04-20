export default function useUrl() {
  const url = window.location.pathname + window.location.search;

  if (url === '/') {
    return null;
  }
  return url;
}
